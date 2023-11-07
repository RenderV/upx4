import cv2, threading
import time
import signal
import subprocess as sp
from ultralytics import YOLO
from concurrent.futures import ThreadPoolExecutor
from abc import ABC, abstractmethod

class DetectionModel(YOLO):
    def perform_detection(self, frame, *args, **kwargs):
        return self.track(frame, *args, **kwargs)

class ParkingLotDetector(DetectionModel):
    def _get_selection():
        pass
    def perform_detection(self, frame, *args, **kwargs):
        results = self.track(frame, *args, **kwargs)
        return results

class YoloRTSP:
    def __init__(self, input_url, output_url, model=None, img_width=None, img_height=None, fps=None, ffmpeg_cmd="ffmpeg", classes=None):
        vcap = cv2.VideoCapture(input_url)

        if not vcap.isOpened():
            raise ConnectionError("Could not open video capture")
        
        if(model is None):
            self._model = DetectionModel()
        elif(isinstance(model, str)):
            self._model = DetectionModel(model)
        elif isinstance(model, DetectionModel):
            self._model = model
        else:
            raise ValueError(f"model attribute must be a instance of {str.__name__} or {DetectionModel.__name__}, but got {type(model).__name__}")
        self._class_dict = {v: k for k, v in self._model.names.items()}

        self._classes = [self._class_dict[class_] for class_ in classes] if classes is not None else list(self._class_dict.values())

        self._ffmpeg_cmd = ffmpeg_cmd
        self._input_url = input_url
        self._output_url = output_url
        self._img_width = img_width or int(vcap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self._img_height = img_height or int(vcap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self._fps = fps or int(vcap.get(cv2.CAP_PROP_FPS))
        self._T = 1/self._fps
        self._process = None
        self._current_frame = None
        self._is_stopped = True
        self._thread_pool = None
        self._vcap = vcap
        self._last_frame_update = 0
    
    @property
    def fps(self):
        return self._fps
    
    @property
    def width(self):
        return self._img_width

    @property
    def height(self):
        return self._img_height
    
    @property
    def is_stopped(self):
        return self._is_stopped
    
    @property
    def elapsed_time_since_update(self):
        return time() - self._last_frame_update

    @property
    def classes(self):
        return [self._model.names[idx] for idx in self._classes]
    
    @classes.setter
    def classes(self, value):
        try:
            self._classes = [self._class_dict[class_] for class_ in value]
        except KeyError:
            raise KeyError(f"Invalid value. Values must be a list of the following possible values: {self._class_dict.keys()}")
    
    def start_ffmpeg_stream(self):
        command = [self._ffmpeg_cmd,
                   '-re',
                   '-f', 'rawvideo',
                   '-s', f'{self._img_width}x{self._img_height}',
                   '-pixel_format', 'bgr24',
                   '-r', f'{self._fps}',
                   '-i', '-',
                   '-pix_fmt', 'yuv420p',
                   '-c:v', 'libx264',
                   '-bufsize', '64M',
                   '-maxrate', '4M',
                   '-rtsp_transport', 'tcp',
                   '-f', 'rtsp',
                   self._output_url]

        self._process = sp.Popen(command, stdin=sp.PIPE)
    
    def _update(self):
        if(self._current_frame is not None):
            if(self._process is None):
                self.start_ffmpeg_stream()
            self._process.stdin.write(self._current_frame.tobytes())
            self._last_frame_update = time.monotonic()
    
    def _track(self, force_refresh_rate):
        while self._vcap.isOpened() and not self._is_stopped:
            ret, frame = self._vcap.read()
            if ret:
                results = self._model.perform_detection(frame, persist=True, verbose=False, classes=self._classes)
                annotated_frame = results[0].plot(boxes=False)
                self._current_frame = annotated_frame
                if(not force_refresh_rate):
                    self._update()
    
    def _capture(self, force_refresh_rate):
        while self._vcap.isOpened() and not self._is_stopped:
            ret, frame = self._vcap.read()
            if ret:
                self._current_frame = frame
                if(not force_refresh_rate):
                    self._update()
    
    def _upload_loop(self):
        starttime = time.monotonic()
        while not self._is_stopped:
            self._update()
            time.sleep(self._T - ((time.monotonic() - starttime) % self._T))
    
    def stream(self, inference=True, force_refresh_rate=True):
        self._is_stopped = False
        if(self._thread_pool is not None):
            raise RuntimeError("Threadpool already exists - must stop before creating a new one.")
        self._thread_pool = ThreadPoolExecutor(max_workers=2)
        if inference:
            self._thread_pool.submit(self._track, force_refresh_rate=force_refresh_rate)
        else:
            self._thread_pool.submit(self._capture, force_refresh_rate=force_refresh_rate)
        if(force_refresh_rate):
            self._thread_pool.submit(self._upload_loop)
    
    def stop(self):
        self._is_stopped = True
        if(self._thread_pool is not None):
            self._thread_pool.shutdown(wait=True)
            self._thread_pool = None
        if self._process:
            self._process.kill()
            self._process = None

def get_urls():
    sources = ["rtsp://mediamtx:8554/collingwood"]
    upload = ["rtsp://mediamtx:8554/opencv"]
    return sources, upload

def create_signal_handler(streamers):
    def stop_processes(sig, frame):
        print("\n\nStopping processes...\n")
        total = len(streamers)
        for i, streamer in enumerate(streamers):
            streamer.stop()
            print(f"Stopped process [{i+1}/{total}]")
    return stop_processes

if __name__ == "__main__":
    urls = get_urls()
    streamers = []
    model = "yolov8n-seg.pt"
    for file_url, rtsp_server in zip(*urls):
        streamer = YoloRTSP(file_url, rtsp_server, model=model, classes=["car"])
        streamer.stream(inference=True, force_refresh_rate=True)
        streamers.append(streamer)
    signal.signal(signal.SIGINT, create_signal_handler(streamers))