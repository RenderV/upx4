# urls.py

from django.urls import path
from .views import CameraListViewSet, CameraView, PointView

urlpatterns = [
    path("cams", CameraListViewSet.as_view()),
    path("cams/<int:camera_id>", CameraView.as_view()),
    path("point/<point_uuid>", PointView.as_view()),
]