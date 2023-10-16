# urls.py

from django.urls import path
from .views import CameraViewSet, ParkingSpaceViewSet
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'cams', CameraViewSet, basename="cam")
router.register(r'parking_spaces', ParkingSpaceViewSet, basename="parking_space")
urlpatterns = router.urls
