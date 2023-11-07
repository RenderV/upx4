from rest_framework import serializers
from .models import Camera, ParkingSpace, Point


class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = "__all__"

class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields="__all__"

class ParkingSpaceSerializer(serializers.ModelSerializer):
    point_set = PointSerializer(many=True)
    class Meta:
        model = ParkingSpace
        fields = "__all__"
