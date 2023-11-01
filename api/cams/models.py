from django.db import models
from django.contrib.postgres.fields import ArrayField

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