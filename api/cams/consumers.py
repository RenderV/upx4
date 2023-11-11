import json

from channels.generic.websocket import WebsocketConsumer

class SelectionConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            json_data = json.loads(text_data)
        except json.decoder.JSONDecodeError:
            await self.close(code=3000)
            return
    
    async def point_update(self, event):
        pass
        # selection = event['selection']
        # await self.send(json.dumps(point))