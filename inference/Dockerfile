FROM vertolis/ultralytics-opencv-gstreamer:v0.1
RUN apt-get update \
    && apt-get install -y gstreamer1.0-rtsp \
    && rm -rf /var/lib/apt/lists/*