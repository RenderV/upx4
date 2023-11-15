from rest_framework import serializers
from .models import Camera, ParkingSpace, Record, ObjectTypes, Runtime


class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = "__all__"

class ParkingSpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingSpace
        fields = "__all__"

class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = "__all__"

class ObjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectTypes
        fields = "__all__"

class RuntimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Runtime
        fields = "__all__"