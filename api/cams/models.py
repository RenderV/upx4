from django.db import models
from django.contrib.postgres.fields import ArrayField

class ObjectTypes(models.Model):
    name = models.CharField(max_length=20)

class Camera(models.Model):
    id = models.PositiveBigIntegerField(primary_key=True)
    location = models.CharField(max_length=100)
    url = models.CharField(max_length=1000)

class ParkingSpace(models.Model):
    id = models.UUIDField(primary_key=True)
    label = models.CharField(max_length=30)
    camera = models.ForeignKey(to=Camera, on_delete=models.CASCADE)

class Point(models.Model):
    id = models.UUIDField(primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    parking_space = models.ForeignKey(to=ParkingSpace, on_delete=models.CASCADE)

class Record(models.Model):
    in_time = models.TimeField()
    out_time = models.TimeField()
    obj_id = models.CharField()
    obj_type = models.ForeignKey(to=ObjectTypes, on_delete=models.CASCADE)
    parking_space = models.ForeignKey(to=ParkingSpace, on_delete=models.CASCADE)