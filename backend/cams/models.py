from django.db import models

# Create your models here.

class Camera(models.Model):
    id = models.PositiveBigIntegerField(primary_key=True)
    location = models.CharField(max_length=100)
    url = models.CharField(max_length=1000)

class ParkingSpace(models.Model):
    cameraID = models.ForeignKey(to=Camera, on_delete=models.CASCADE)
    polygons = models.JSONField()