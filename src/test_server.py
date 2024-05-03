import threading
import unittest
import asyncio
import websockets
import json
import sys
import os

# Ensure the server directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from server import start_server  # Import the server start function


class TestWebSocketServer(unittest.IsolatedAsyncioTestCase):
    @classmethod
    async def asyncSetUpClass(cls):
        # Start the WebSocket server
        cls.server = await websockets.serve(start_server, "localhost", 6789)

    @classmethod
    async def asyncTearDownClass(cls):
        # Stop the server
        cls.server.close()
        await cls.server.wait_closed()

    async def test_create_and_join_room(self):
        async with websockets.connect("ws://localhost:6789") as websocket:
            # Test creating a room
            await websocket.send(json.dumps({"type": "create"}))
            response = json.loads(await websocket.recv())
            self.assertIn("room_created", response["type"])

            # Test joining the room
            room_id = response["room"]
            await websocket.send(
                json.dumps({"type": "join", "room": room_id, "name": "Player 1"})
            )
            response = json.loads(await websocket.recv())
            self.assertIn("Waiting for another player...", response["message"])

            # Simulate second player joining
            async with websockets.connect("ws://localhost:6789") as websocket2:
                await websocket2.send(
                    json.dumps({"type": "join", "room": room_id, "name": "Player 2"})
                )
                response = json.loads(await websocket2.recv())
                self.assertIn("Your turn to choose", response["message"])

    async def test_erroneous_input(self):
        async with websockets.connect("ws://localhost:6789") as websocket:
            # Player tries to join a non-existent room
            await websocket.send(
                json.dumps({"type": "join", "room": "fake_room", "name": "Player 1"})
            )
            response = json.loads(await websocket.recv())
            self.assertIn("Room does not exist", response["message"])

            # Player tries to make a choice without game being ready
            await websocket.send(
                json.dumps({"type": "choice", "room": "fake_room", "choice": "heads"})
            )
            response = json.loads(await websocket.recv())
            self.assertIn("error", response["type"])
