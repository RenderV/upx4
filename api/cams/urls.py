# urls.py

from django.urls import path
from .views import CameraListViewSet, SelectionView
# from rest_framework.routers import DefaultRouter
# router = DefaultRouter()
# router.register(r'cams', CameraViewSet, basename="cam")
# router.register(r'parking_spaces', ParkingSpaceViewSet, basename="parking_space")
# urlpatterns = router.urls
urlpatterns = [
    path("", CameraListViewSet.as_view()),
    path("<int:camera_id>", SelectionView.as_view())
]
