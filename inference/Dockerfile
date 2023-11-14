FROM ubuntu

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=America/New_York

RUN apt-get update \
    && apt-get install -y curl gpg \
    && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
    && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list \
    && apt-get update \
    && apt-get install -y nvidia-container-toolkit python3 python3-pip ffmpeg \
    && pip install --no-cache-dir ultralytics rel shapely jsonschema websocket-client \
    && apt-get remove -y curl gpg \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*