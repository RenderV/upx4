from pathlib import Path
import cv2
import time
import signal
import requests
import subprocess as sp
from ultralytics import YOLO
from concurrent.futures import ThreadPoolExecutor
from shapely.geometry import Polygon
from typing import List, Iterable, Union, Tuple
from dataclasses import dataclass
import websocket
import logging
import json
from jsonschema import validate
from jsonschema.exceptions import ValidationError
import rel
import traceback
import threading
import numpy as np
import queue
import uuid
import datetime

logging.basicConfig(level=logging.INFO)
def process_cams_data():
    cams = requests.get("http://api:8000/api/cams/1/").json()
    parking_spaces = cams.get("parking_spaces")
    selections = []
    for parking_space in parking_spaces:
        points = parking_space.get("selection")
        points_ = []
        for point in points:
            points_.append((point.get("x"), point.get("y")))
        selections.append(ParkingSpace(id=parking_space.get("id"), selection=points_))
    return selections

def is_valid_bgr24_image(image_array):
    if not isinstance(image_array, np.ndarray):
        return False
    
    if len(image_array.shape) != 3:
        return False

    if image_array.shape[2] != 3:
        return False

    if image_array.dtype != np.uint8:
        return False

    return True

def post_report(obj_type, parking_space, runtime, obj_id):
    url = "http://api:8000/api/records/99999999/"
    dt = datetime.datetime.now()
    formatted_time = dt.strftime("%H:%M:%S.%f")[:-3]  
    r = requests.post(url, json={
                            "obj_id": obj_id,
                            "in_time": formatted_time,
                             "obj_type": 1, 
                             "parking_space": parking_space, 
                             "runtime": runtime}
                             )
    logging.error(r.json().get("details"))
    logging.error(f"Posted report with status code {r.status_code}")
    logging.error(r.json())
    if r.status_code == 200:
        r = r.json().get("id")
        if r is not None:
            return r
    else:
        return None

def patch_report(obj_id, obj_cls, record_id, out=False):
    url = f"http://api:8000/api/records/{record_id}/"
    dt = datetime.datetime.now()
    formatted_time = dt.strftime("%H:%M:%S.%f")[:-3]  
    ex = {} if not out else  {"out_time": formatted_time}
    r = requests.patch(url, json={"obj_id": obj_id, "obj_cls": obj_cls} | ex)
    return r.json()


@dataclass
class Vehicle:
    id: int
    cls_id: float
    conf: float
    polygon: Polygon

class ParkingSpace:
    def __init__(self, id: str, selection: List[Iterable[float]], runtime_id=None, connect=False):
        self._id = id
        self._runtime_id = runtime_id
        self._selection_list = []
        self._selection_polygon = Polygon()
        self._vehicles: dict[str, Vehicle] = {}
        self._starting_time: dict[str, float] = {}
        self._finishing_time: dict[str, float] = {}
        self._active_ids = []
        self.selection_list = selection
        self._record_id = None
        logging.log(logging.INFO, f"Created parking space with id {self._id}")

    @property
    def selection_polygon(self):
        return self._selection_polygon
    @property
    def selection_list(self):
        return self._selection_list
    
    @selection_list.setter
    def selection_list(self, value: List[Iterable[float]]):
        self._selection_list = value
        self._selection_polygon = Polygon(self._selection_list)

    @property
    def id(self):
        return self._id
    
    @property
    def active_ids(self):
        return self._active_ids
    
    @active_ids.setter
    def active_ids(self, value):
        self._active_ids = value
    
    def _add_vehicle(self, vehicle: Vehicle):
        self._starting_time = time.monotonic()
        self._record_id = post_report(1, self._id, self._runtime_id, vehicle.id)
        self._vehicles[vehicle.id] = vehicle
        logging.log(logging.INFO, f"Vehicle {vehicle.id} entered parking space {self._id}")

    def _del_vehicle(self, vehicle: Vehicle, finishing_time: float = None):
        del self._vehicles[vehicle.id]
        finishing_time = finishing_time or time.monotonic()
        patch_report("car", vehicle.cls_id, self._record_id, out=True)
        logging.log(logging.INFO, f"Vehicle {vehicle.id} left parking space {self._id}")
    
    def _update_vehicle(self, vehicle: Vehicle):
        # patch_report(vehicle.id, vehicle.cls_id, self._record_id, out=False)
        self._vehicles[vehicle.id] = vehicle
    
    def intersects_vehicle(self, vehicle: Vehicle, threshold) -> bool:
        intersection = self._selection_polygon.intersection(vehicle.polygon)
        key_exists = vehicle.id in self._vehicles

        if intersection.area == 0 and key_exists:
            self._del_vehicle(vehicle)
        if intersection.area == 0:
            return False

        intersection_ratio = intersection.area / vehicle.polygon.area
        logging.log(logging.DEBUG, f"Vehicle area: {vehicle.polygon.area}\nSelection area: {self._selection_polygon.area}\nIntersection ratio: {intersection_ratio}")

        if intersection_ratio > threshold and not key_exists:
            self._add_vehicle(vehicle)
            return True
        elif intersection_ratio > threshold and key_exists:
            self._update_vehicle(vehicle)
            return True
        elif key_exists:
            self._del_vehicle(vehicle)
            return False
    
    def __export__(self):
        return {
            "id": self._id,
            "selection": self._selection_list,
            "vehicles": list(self._vehicles.values())
        }


class DetectionModel():
    def __init__(self, model: YOLO) -> None:
        self.model = model
    def perform_detection(self, frame, *args, **kwargs) -> List:
        return self.model.track(frame, persist=True)

class OccupationDetector(DetectionModel):
    def __init__(
        self,
        ws_url: str,
        selection: List[ParkingSpace],
        threshold: int,
        model: YOLO,
        task=None,
        frame_leap=10
    ) -> None:

        self._runtime_id = uuid.uuid4()
        self._register()
        # send runtime id to server
        self.selections = None
        self._thread_pool = None
        self._ws = websocket.WebSocketApp(
            url=ws_url, on_message=self._parse_message, on_error=self.log_error, on_close=self._stop
        )
        logging.log(logging.INFO, f"Connected to websocket {ws_url}")
        self.ws_url = ws_url
        self._parking_spaces_: dict[str, ParkingSpace] = {}
        self._threshold = None
        self._vehicles: dict[str, Vehicle] = {}
        self.threshold = threshold
        self._active_vehicles_ids_: List[int] = []
        self._parking_spaces: dict[str, ParkingSpace] = {space.id: space for space in selection}
        self.frame_leap = frame_leap
        self.count = 0
        json._schema = {
            "type": "object",
            "properties": {
                "parking_spaces": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": ["selection_update", "info"],
                            },
                            "id": {"type": "integer"},
                            "coordinates": {
                                "type": "array",
                                "items": {
                                    "type": "array",
                                    "items": [{"type": "number"}, {"type": "number"}],
                                    "minItems": 2,
                                    "maxItems": 2,
                                },
                            },
                        },
                        "required": ["type", "id", "coordinates"],
                        "additionalProperties": True,
                    },
                }
            },
            "required": ["selections"],
            "additionalProperties": False,
        }

        super().__init__(model)
    
    @property
    def _parking_spaces(self):
        return self._parking_spaces_
    
    @_parking_spaces.setter
    def _parking_spaces(self, value):
        self._parking_spaces_ = value
    
    @property
    def threshold(self):
        return self._threshold
    
    @threshold.setter
    def threshold(self, value: int):
            self._threshold = value
    
    @property
    def _active_vehicles_ids(self) -> List[int]:
        return self._active_vehicles_ids_

    @_active_vehicles_ids.setter
    def _active_vehicles_ids(self, value):
        old_value = self._active_vehicles_ids
        if(old_value != value):
            for parking_space in self._parking_spaces.values():
                logging.log(logging.DEBUG, f"Updating parking space {parking_space.id} with {parking_space.active_ids} to {value}")
                parking_space.active_ids = value
        self._active_vehicles_ids_ = value
    
    def _parse_message(self, ws, message):
        try:
            message = json.loads(message)
            validate(instance=message, schema=self._schema)
            logging.log(logging.INFO, f"Received message\n>{message}\n<")
        except (json.decoder.JSONDecodeError, ValueError) as e:
            logging.log(logging.ERROR, f"The message is not a valid JSON")
            return
        except ValidationError as e:
            logging.log(logging.ERROR, f"Validation error:\n {e}")
            return
        match message.get("type"):
            case "selection_update":
                parking_spaces_list = message.get("parking_spaces")
                for parking_space in parking_spaces_list:
                    space_id = parking_space.get("id")
                    coordinates: List[Iterable[float]] = parking_space.get("coordinates")
                    new_space = ParkingSpace(id=space_id, selection_polygon=coordinates)
                    if(self._parking_spaces.get(new_space.id) is None):
                        self._parking_spaces[new_space.id] = new_space
                        logging.log(logging.INFO, f"Added new parking space with id {new_space.id}")
                    else:
                        self._parking_spaces[new_space.id].selection_list = coordinates
                        logging.log(logging.INFO, f"Updated parking space with id {new_space.id}")
            case _:
                pass

    def log_error(self, ws, error):
        logging.log(logging.ERROR, error)
    
    def _register(self):
        logging.log(logging.INFO, f"Registering runtime with id {self._runtime_id}")
        r = requests.post(f"http://api:8000/api/cams/1/", json={"location": "brazil", "url": "http://mediamtx:8888/opencv"})
        logging.error(f"Tried to post cams 1")
        r2 = requests.post(f"http://api:8000/api/runtime/{self._runtime_id}/", json={"camera": 1})
        logging.error(f"Tried to post runtime {self._runtime_id}")

    def _stop(self):
        pass

    def start(self):
        if self._thread_pool is not None:
            raise RuntimeError(
                "Threadpool already exists - must stop before creating a new one."
        )
        self._thread_pool = ThreadPoolExecutor(max_workers=10)
        self._thread_pool.submit(self.receive_websockets_messages)
        rel.signal(2, rel.abort)
        logging.log(logging.INFO, f"Started websocket threadpool")
    
    def receive_websockets_messages(self):
        try:
            self._ws.run_forever()
        except Exception as e:
            traceback.print_exc()
            raise e
    
    def post_results(self, class_name):
        pass

    def perform_detection(self, frame, classes, skip_detections=True, *args, **kwargs) -> List:
        logging.log(logging.DEBUG, f"Performing detection on frame")
        results = self.model.track(frame, persist=True, classes=classes, tracker="bytetrack.yaml")
        if(skip_detections and self.count >= self.frame_leap):
            self.count = 0
            return results
        elif(self.count < self.frame_leap):
            self.count += 1
        masks, cls_list, cls_probs, id_list = [], [], [], []
        if(results[0].masks is not None):
            masks = results[0].masks.xy
        if(results[0].boxes.cls is not None):
            cls_list = results[0].boxes.cls.tolist()
        if(results[0].boxes.conf is not None):
            cls_probs = results[0].boxes.conf.tolist()
        if(results[0].boxes.id is not None):
            id_list = results[0].boxes.id.tolist()
        logging.log(logging.DEBUG, f"Detection results: cls={cls_list}, conf={cls_probs}, id={id_list}")
        try:
            self._active_vehicles_ids = id_list
            for id, mask, cls_, conf in zip(id_list, masks, cls_list, cls_probs):
                v =  Vehicle(id, cls_, conf, Polygon(mask))
                self._vehicles[id] = v
                for parking_space in self._parking_spaces.values():
                    parking_space.intersects_vehicle(v, self.threshold)
        except Exception as e:
            logging.log(logging.ERROR, f"Error while computing intersections")
            traceback.print_exc()
        return results


class YoloRTSP:
    def __init__(
        self,
        input_url: str,
        output_url: str,
        model: Union[str, DetectionModel] = None,
        img_width: int = None,
        img_height: int = None,
        fps: int = None,
        ffmpeg_cmd: str = "ffmpeg",
        classes: List[str] = None,
    ) -> None:

        self._frame_to_send = None
        self._frame_queue = queue.Queue(50)

        self._input_url = input_url
        vcap = cv2.VideoCapture(input_url, cv2.CAP_FFMPEG)

        if not vcap.isOpened():
            raise ConnectionError("Could not open video capture")

        if model is None:
            self._model = DetectionModel(YOLO())
            logging.log(logging.INFO, f"Using default model {DetectionModel.__name__}")
        elif isinstance(model, str):
            self._model = DetectionModel(YOLO(model))
            logging.log(logging.INFO, f"Using default model {DetectionModel.__name__} with file {model}")
        elif isinstance(model, DetectionModel):
            self._model = model
            logging.log(logging.INFO, f"Using custom model {model.__class__.__name__}")
        else:
            raise ValueError(
                f"model attribute must be an instance of {str} or {DetectionModel.__name__}, but got {model.__class__.__name__}"
            )
        self._class_dict = {v: k for k, v in self._model.model.names.items()}

        self._classes = (
            [self._class_dict[class_] for class_ in classes]
            if classes is not None
            else list(self._class_dict.values())
        )
        self._lock = threading.Lock()

        self._ffmpeg_cmd = ffmpeg_cmd
        self._input_url = input_url
        self._output_url = output_url
        self._img_width = img_width or int(vcap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self._img_height = img_height or int(vcap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self._fps = fps or int(vcap.get(cv2.CAP_PROP_FPS))
        self._T = 1 / self._fps
        self._process = None
        self._is_stopped_ = True
        self._thread_pool = None
        self._vcap = vcap
        self._last_frame_update = 0
        logging.log(logging.WARNING, f"Created YoloRTSP object with input url {self._input_url} and output url {self._output_url}")

    @property
    def fps(self) -> int:
        return self._fps

    @property
    def width(self) -> int:
        return self._img_width

    @property
    def height(self) -> int:
        return self._img_height

    @property
    def _is_stopped(self) -> bool:
        return self._is_stopped_

    @_is_stopped.setter
    def _is_stopped(self, value: bool) -> None:
        self._is_stopped_ = value

    @property
    def elapsed_time_since_update(self) -> float:
        return time() - self._last_frame_update

    @property
    def classes(self) -> List[str]:
        return [self._model.names[idx] for idx in self._classes]

    @classes.setter
    def classes(self, value: List[str]) -> None:
        try:
            self._classes = [self._class_dict[class_] for class_ in value]
        except KeyError:
            raise KeyError(
                f"Invalid value. Values must be a list of the following possible values: {self._class_dict.keys()}"
            )
    
    def queue_put(self, value):
        if(self._frame_queue.qsize() > 1):
            self._frame_queue.get()
        self._frame_queue.put(value)

    def start_ffmpeg_stream(self) -> None:
        if(self._process is not None):
            self._process.kill()

        command = [
            self._ffmpeg_cmd,
            "-re",
            "-f",
            "rawvideo",
            "-s",
            f"{self._img_width}x{self._img_height}",
            "-pixel_format",
            "bgr24",
            "-r",
            f"{self._fps}",
            "-i",
            "-",
            "-pix_fmt",
            "yuv420p",
            "-c:v",
            "libx264",
            "-bufsize",
            "64M",
            "-maxrate",
            "4M",
            "-rtsp_transport",
            "tcp",
            "-f",
            "rtsp",
            self._output_url,
        ]


        self._process = sp.Popen(command, stdin=sp.PIPE)
        logging.log(logging.INFO, f"Started ffmpeg process with command {command}")

    def _send(self, frame) -> None:
        try:
            if not is_valid_bgr24_image(frame) and frame is not None:
                logging.error("not a valid frame!")
                return
            if frame is not None:
                if self._process is None or self._process.poll() is not None:
                    logging.log(logging.INFO, f"Starting ffmpeg stream")
                    self.start_ffmpeg_stream()
                try:
                    self._process.stdin.write(frame.tobytes())
                except BrokenPipeError:
                    logging.log(logging.ERROR, f"Broken pipe error")
                    self._process.kill()
                    self._process = None
                    self.start_ffmpeg_stream()
        except:
            traceback.print_exc()
        
    
    def _receive(self):
        logging.log(logging.ERROR, "Started receiving")
        while self._vcap.isOpened() and not self._is_stopped:
            try:
                retry = False
                ret, frame = self._vcap.read()
                if ret:
                    if(retry):
                        logging.error("success!")
                        retry = False
                    self.queue_put(frame)
                elif not ret:
                    retry = True
                    if(not retry):
                        logging.error("invalid VIDEO, trying to recconect...")
                    else:
                        logging.error("failed")
                    self._vcap = cv2.VideoCapture(self._input_url, cv2.CAP_FFMPEG)
                    continue
            except:
                traceback.print_exc()
    
    def _track(self, inference=True) -> None:
        logging.log(logging.ERROR, "Started tracking")
        while True:
            try:
                frame = self._frame_queue.get()
                if(inference):
                    results = self._model.perform_detection(
                        frame, classes=self._classes
                    )
                    with self._lock:
                        self._frame_to_send = results[0].plot()
                else:
                    with self._lock:
                        self._frame_to_send = frame
                self._frame_queue.task_done()
            except:
                traceback.print_exc()
    
    def _send_loop(self,):
        logging.log(logging.ERROR, "Started sending")
        while True:
            starttime = time.monotonic()
            with self._lock:
                self._send(self._frame_to_send)
            time.sleep(self._T - ((time.monotonic() - starttime) % self._T))

    

    def stream(self, inference: bool = True) -> None:
        self._is_stopped = False
        if self._thread_pool is not None:
            raise RuntimeError(
                "Threadpool already exists - must stop before creating a new one."
            )
        self._thread_pool = ThreadPoolExecutor(max_workers=10)
        self._thread_pool.submit(self._receive)
        self._thread_pool.submit(self._track, inference=True)
        self._thread_pool.submit(self._send_loop)

    def stop(self) -> None:
        logging.log(logging.INFO, f"Stopping stream")
        self._is_stopped = True
        if self._thread_pool is not None:
            self._thread_pool.shutdown(wait=True)
            self._thread_pool = None
        if self._process:
            self._process.kill()
            self._process = None


def get_urls() -> Tuple[List[str], List[str]]:
    sources = ["rtsp://mediamtx:8554/collingwood"]
    upload = ["rtsp://mediamtx:8554/opencv"]
    return sources, upload


def create_signal_handler(streamers: List[YoloRTSP]) -> None:
    def stop_processes(sig, frame) -> None:
        print("\n\nStopping processes...\n")
        total = len(streamers)
        for i, streamer in enumerate(streamers):
            streamer.stop()
            print(f"Stopped process [{i+1}/{total}]")

    return stop_processes


if __name__ == "__main__":
    urls = get_urls()
    streamers = []
    requests.post("http://api:8000/api/cams/1/", json={"location": "Brazil", "url": "http://mediamtx:8888/opencv"})
    cams = requests.get("http://api:8000/api/cams/1/").json()
    parking_spaces = cams.get("parking_spaces")
    selections = []
    for parking_space in parking_spaces:
        points = parking_space.get("selection")
        points_ = []
        for point in points:
            points_.append((point.get("x"), point.get("y")))
        selections.append(ParkingSpace(id=parking_space.get("id"), selection=points_))
    model = OccupationDetector("ws://api:8000/ws/1/", selection=selections, threshold=0.3, model=YOLO("yolov8n-seg.pt"))
    logging.log(logging.INFO, f"Created model {model}")
    model.start()
    for file_url, rtsp_server in zip(*urls):
        streamer = YoloRTSP(file_url, rtsp_server, classes=["car", "truck"], model=model)
        streamer.stream(inference=True)
        streamers.append(streamer)
    signal.signal(signal.SIGINT, create_signal_handler(streamers))