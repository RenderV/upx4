from django.db import models
from django.utils import timezone

class ObjectTypes(models.Model):
    name = models.CharField(max_length=20, unique=True)

class Camera(models.Model):
    id = models.PositiveBigIntegerField(primary_key=True)
    location = models.CharField(max_length=100)
    url = models.CharField(max_length=1000)

class ParkingSpace(models.Model):
    id = models.UUIDField(primary_key=True)
    label = models.CharField(max_length=30)
    camera = models.ForeignKey(to=Camera, on_delete=models.CASCADE)
    selection = models.JSONField("selection", default=dict)

class Runtime(models.Model):
    id = models.UUIDField(primary_key=True)
    camera = models.ForeignKey(to=Camera, on_delete=models.CASCADE)
    creation_time = models.DateTimeField(default=timezone.now)

class Record(models.Model):
    in_time = models.TimeField(null=True)
    out_time = models.TimeField(null=True)
    obj_id = models.CharField()
    obj_type = models.CharField()
    parking_space = models.ForeignKey(to=ParkingSpace, on_delete=models.CASCADE)
    runtime = models.ForeignKey(to=Runtime, on_delete=models.CASCADE, null=True)