from django.db import models
from django.contrib.postgres.fields import ArrayField


class Camera(models.Model):
    id = models.PositiveBigIntegerField(primary_key=True)
    location = models.CharField(max_length=100)
    url = models.CharField(max_length=1000)
    selections = models.JSONField()

class ParkingSpace(models.Model):
    cameraID = models.ForeignKey(to=Camera, on_delete=models.CASCADE)
    area_code = models.CharField(5)