from rest_framework import generics
from .models import Camera, ParkingSpace
from .serializers import CameraSerializer, ParkingSpaceSummarySerializer, ParkingSpaceSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class CameraViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = Camera.objects.all()
        serializer = CameraSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        camera_queryset = Camera.objects.all()
        camera = get_object_or_404(camera_queryset, pk=pk)
        camera_serializer = CameraSerializer(camera)
        data = camera_serializer.data
        parking_queryset = ParkingSpace.objects.filter(cameraID=pk)
        if(parking_queryset.exists()):
            parking_serializer = ParkingSpaceSummarySerializer(parking_queryset, many=True)
            print(parking_serializer.data)
            data['parking_spaces'] = parking_serializer.data
        else:
            data['parking_spaces'] = []
        return Response(data)

class ParkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = ParkingSpace.objects.all()
    serializer_class = ParkingSpaceSerializer