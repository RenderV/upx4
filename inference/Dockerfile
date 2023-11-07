FROM ultralytics/ultralytics:latest-python
RUN apt-get update && apt-get install -y ffmpeg python3-pip &&\
    pip install --no-cache-dir shapely && \
    apt-get clean && rm -rf /var/lib/apt/lists/*