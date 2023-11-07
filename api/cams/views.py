from rest_framework import generics
from .models import Camera, ParkingSpace, Point
from .serializers import CameraSerializer, ParkingSpaceSerializer, PointSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


class CameraListViewSet(ListAPIView):
    model = Camera
    serializer_class = CameraSerializer
    queryset = Camera.objects.all()


class CameraView(APIView):
    def get(self, request, camera_id):
        camera = get_object_or_404(Camera, pk=camera_id)
        spaces = ParkingSpace.objects.filter(camera=camera_id).prefetch_related(
            "point_set"
        )
        serializedSpaces = ParkingSpaceSerializer(spaces, many=True)
        response_data = {
            "camera_id": camera.id,
            "location": camera.location,
            "url": camera.url,
            "parking_spaces": serializedSpaces.data,
        }
        return Response(response_data)


class PointView(APIView):
    def get(self, request, point_uuid):
        point = get_object_or_404(Point, id=point_uuid)

    def post(self, request, point_uuid):
        point = Point.objects.get(pk=point_uuid)
        if point:
            return Response(
                {"details": "object already exists in the server"}, status=400
            )
        serializer = PointSerializer(point, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def patch(self, request, point_uuid):
        point = get_object_or_404(Point, id=point_uuid)

        new_point_data = {
            "id": point.id,
            "x": request.data.get("x", point.x),
            "y": request.data.get("y", point.y),
            "parking_space": point.get("parking_space")
        }

        serializer = PointSerializer(point, data=new_point_data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

class SelectionView(APIView):
    def get(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, id=parking_space_id)
        points = Point.objects.filter(parking_space=parking_space)
        serializer = PointSerializer(points, many=True)
        return Response(serializer.data)

    def post(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, id=parking_space_id)
        data = request.data
        data['parking_space'] = parking_space.id
        serializer = PointSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, id=parking_space_id)
        data = request.data
        points = Point.objects.filter(parking_space=parking_space)
        for point in points:
            point.x = data.get('x', point.x)
            point.y = data.get('y', point.y)
            point.save()
        serializer = PointSerializer(points, many=True)
        return Response(serializer.data)

    def delete(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, id=parking_space_id)
        points = Point.objects.filter(parking_space=parking_space)
        points.delete()
        return Response(status=204)