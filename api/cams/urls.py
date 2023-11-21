# urls.py

from django.urls import path, re_path
from .views import CameraListViewSet, CameraView, ParkingSpaceView, RecordListViewSet, RecordView, RuntimeView, RuntimeListViewSet, ObjectTypeListViewSet, ObjectTypeView, ListRecordsByParkingSpace, CountLast24HView
from .consumers import SelectionConsumer

websocket_urlpatterns = [
    re_path("<int:cam_id>", SelectionConsumer.as_asgi()),
]

urlpatterns = [
    path("cams/", CameraListViewSet.as_view()),
    path("cams/<int:camera_id>/", CameraView.as_view()),
    path("parking_space/<parking_space_id>/", ParkingSpaceView.as_view()),
    path("records/", RecordListViewSet.as_view()),
    path("records/<int:record_id>/", RecordView.as_view()),
    path("runtime/", RuntimeListViewSet.as_view()),
    path("runtime/<runtime_id>/", RuntimeView.as_view()),
    path("object_types/", ObjectTypeListViewSet.as_view()),
    path("object_types/<int:obj_type_id>/", ObjectTypeView.as_view()),
    path("records_by_parking_space/", ListRecordsByParkingSpace.as_view()),
    path("count_last_24h/", CountLast24HView.as_view())
]