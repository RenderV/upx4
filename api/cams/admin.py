from django.contrib import admin
from .models import Camera, ParkingSpace, Runtime, Record, ObjectTypes

admin.site.register(Camera)
admin.site.register(ParkingSpace)
admin.site.register(Runtime)
admin.site.register(Record)
admin.site.register(ObjectTypes)