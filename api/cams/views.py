from rest_framework import generics
from .models import Camera, ParkingSpace
from .serializers import CameraSerializer, ParkingSpaceSummarySerializer, ParkingSpaceSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


class CameraListViewSet(ListAPIView):
    model = Camera
    serializer_class = CameraSerializer
    queryset = Camera.objects.all()

class SelectionView(APIView):
    """
        CRUD operations on cameras and its selections.
    """
    def get(self, request, camera_id, format=None):
        camera = get_object_or_404(Camera.objects, pk=camera_id)
        parking_spaces = ParkingSpace.objects.filter(cameraID = camera)
        if parking_spaces.exists():
            serializer = ParkingSpaceSerializer(parking_spaces, many=True)
            return Response(serializer.data)
        else:
            return Response([])
    
    def post(self, request, camera_id):
        camera = get_object_or_404(Camera.objects, pk=camera_id)
        parking_spaces = ParkingSpace.objects.filter(cameraID = camera)
        if parking_spaces.exists():
            try:
                parking_spaces.delete()
                parking_spaces
            except:
                return Response(data={"detail": "couldn't delete"}, status=400)
        return Response(200)