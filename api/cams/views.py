from .models import Camera, ParkingSpace, Record, ObjectTypes, Runtime
from django.utils import timezone
from .serializers import CameraSerializer, ParkingSpaceSerializer, RecordSerializer, ObjectTypeSerializer, RuntimeSerializer
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import jsonschema, json

schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "selection": {
    "type": "object",
    "required": ["x", "y"],
    "properties": {
      "x": {
        "type": "integer"
      },
      "y": {
        "type": "integer"
      }
    },
    "additionalProperties": False
  }
}

class CameraListViewSet(ListAPIView):
    model = Camera
    serializer_class = CameraSerializer
    queryset = Camera.objects.all()

class CameraView(APIView):
    def get(self, request, camera_id):
        camera = get_object_or_404(Camera, pk=camera_id)
        camera_serializer = CameraSerializer(camera)
        spaces = ParkingSpace.objects.filter(camera=camera_id)
        spaces_serializer = ParkingSpaceSerializer(spaces, many=True)
        data = camera_serializer.data
        data["parking_spaces"] = spaces_serializer.data
        return Response(data)
    def post(self, request, camera_id):
        data = {}
        data["id"] = camera_id
        data["location"] = request.data.get("location")
        data["url"] = request.data.get("url")
        camera_serializer = CameraSerializer(data=data)
        if(camera_serializer.is_valid()):
            camera_serializer.save()
            return Response(camera_serializer.data, status=201)
        return Response(camera_serializer.errors, status=400)        
  
class ParkingSpaceView(APIView):
    def get(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, pk=parking_space_id)
        serializer = ParkingSpaceSerializer(parking_space)
        return Response(serializer.data)
    def post(self, request, parking_space_id):
        selection = request.data.get("selection")
        try:
            jsonschema.validate(selection, schema)
        except jsonschema.exceptions.ValidationError as err:
            return Response({"details": f"selection validation error: {err.message}"}, status=400)
        data = {
            "id": parking_space_id,
            "label": request.data.get("label"),
            "camera": request.data.get("camera"),
            "selection": selection
        }
        serializer = ParkingSpaceSerializer(data=data)
        if(serializer.is_valid()):
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    def patch(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, pk=parking_space_id)
        print(parking_space.selection)
        data = {
            "id": parking_space_id,
            "label": request.data.get("label", parking_space.label),
            "selection": request.data.get("selection", parking_space.selection)
        }
        if(data["selection"]):
            try:
                jsonschema.validate(data["selection"], schema)
            except jsonschema.exceptions.ValidationError as err:
                return Response({"details": f"selection validation error: {err.message}"}, status=400)
        serializer = ParkingSpaceSerializer(parking_space, data=data, partial=True)
        if(serializer.is_valid()):
            serializer.update(parking_space, serializer.validated_data)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def delete(self, request, parking_space_id):
        parking_space = get_object_or_404(ParkingSpace, pk=parking_space_id)
        parking_space.delete()
        return Response({"details": "successfully deleted requested item"}, status=204)

class RecordListViewSet(ListAPIView):
    model = Record
    serializer_class = RecordSerializer
    queryset = Record.objects.all()

class RecordView(APIView):
    def get(self, request, record_id):
        record = get_object_or_404(Record, pk=record_id)
        serializer = RecordSerializer(record)
        data = serializer.data
        return Response(data)
    def post(self, request, record_id=None):
        data = {
            "in_time": request.data.get("in_time"),
            "out_time": request.data.get("out_time"),
            "obj_id": request.data.get("obj_id"),
            "obj_type": request.data.get("obj_type"),
            "parking_space": request.data.get("parking_space"),
        }
        serializer = RecordSerializer(data=data)
        if(serializer.is_valid()):
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    def patch(self, request, record_id):
        record = get_object_or_404(Record, pk=record_id)
        data = {
            "in_time": request.data.get("in_time", record.in_time),
            "out_time": request.data.get("out_time", record.out_time),
            "obj_id": request.data.get("obj_id", record.obj_id),
            "obj_type": request.data.get("obj_type", record.obj_type),
            "parking_space": request.data.get("parking_space", record.parking_space.id),
        }
        serializer = RecordSerializer(record, data=data, partial=True)
        if(serializer.is_valid()):
            serializer.update(record, serializer.validated_data)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RuntimeListViewSet(ListAPIView):
    model = Runtime
    serializer_class = RuntimeSerializer
    queryset = Runtime.objects.all()

class RuntimeView(APIView):
    def get(self, request, runtime_id):
        runtime = get_object_or_404(Runtime, pk=runtime_id)
        serializer = RuntimeSerializer(runtime)
        return Response(serializer.data)
    def post(self, request, runtime_id):
        data = {
            "id": runtime_id,
            "camera": request.data.get("camera"),
            "creation_time": timezone.now()
        }
        serializer = RuntimeSerializer(data=data)
        if(serializer.is_valid()):
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

class ObjectTypeListViewSet(ListAPIView):
    model = ObjectTypes
    serializer_class = ObjectTypeSerializer
    queryset = ObjectTypes.objects.all()

class ObjectTypeView(APIView):
    def get(self, request, obj_type_id):
        obj_type = get_object_or_404(ObjectTypes, pk=obj_type_id)
        serializer = ObjectTypeSerializer(obj_type)
        return Response(serializer.data)
    def post(self, request, obj_type_id):
        data = {
            "id": obj_type_id,
            "name": request.data.get("name")
        }
        serializer = ObjectTypeSerializer(data=data)
        if(serializer.is_valid()):
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)