from rest_framework import serializers
from .models import Camera, ParkingSpace


class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ["id", "location", "url"]


class ParkingSpaceSerializer(serializers.ModelSerializer):
    area = serializers.ListField(allow_empty=True, child=serializers.ListField())

    class Meta:
        model = ParkingSpace
        fields = ["id", "cameraID", "area"]


class ParkingSpaceSummarySerializer(serializers.ModelSerializer):
    area = serializers.ListField(allow_empty=True, child=serializers.ListField(allow_empty=False))

    class Meta:
        model = ParkingSpace
        fields = ["id", "area"]
