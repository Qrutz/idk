import asyncio
import websockets
import json
import random
import uuid
import logging

logger = logging.getLogger("websockets")
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

games = {}


class GameRoom:
    def __init__(self, room_id):
        self.room_id = room_id
        self.players = {}

    async def add_player(self, websocket, name):
        if len(self.players) < 2:
            self.players[websocket] = {"name": name, "choice": None}
            return True, None
        return False, "Room is full"

    async def receive_choice(self, websocket, choice):
        player = self.players.get(websocket)
        if player and player["choice"] is None:
            player["choice"] = choice
            # Automatically assign the opposite choice to the other player
            for other_player, info in self.players.items():
                if other_player != websocket:
                    info["choice"] = "tails" if choice == "heads" else "heads"
            await self.send_results()  # Now that both players have choices, send results

    async def send_results(self):
        results = random.choice(["heads", "tails"])
        for player, info in self.players.items():
            win = info["choice"] == results
            await player.send(
                json.dumps(
                    {
                        "type": "result",
                        "your_choice": info["choice"],
                        "opponent_choice": (
                            "tails" if info["choice"] == "heads" else "heads"
                        ),
                        "outcome": results,
                        "win": win,
                    }
                )
            )


async def main():
    async with websockets.serve(handler, "localhost", 6789):
        await asyncio.Future()  # run forever


async def handler(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "create":
                room_id = str(uuid.uuid4())
                games[room_id] = GameRoom(room_id)
                await websocket.send(
                    json.dumps(
                        {
                            "type": "room_created",
                            "room": room_id,
                            "link": f"http://yourdomain.com/game/{room_id}",
                        }
                    )
                )
            elif data["type"] == "join":
                room_id = data["room"]
                if room_id in games:
                    success, message = await games[room_id].add_player(
                        websocket, data["name"]
                    )
                    if success:
                        message = {
                            "type": "status",
                            "message": "Waiting for another player...",
                        }
                        if len(games[room_id].players) == 2:
                            first_player = next(iter(games[room_id].players))
                            await first_player.send(
                                json.dumps(
                                    {"type": "status", "message": "Your turn to choose"}
                                )
                            )
                            message = {
                                "type": "status",
                                "message": "Waiting for Player 1 to choose",
                            }
                        await websocket.send(json.dumps(message))
                    else:
                        await websocket.send(
                            json.dumps({"type": "error", "message": message})
                        )
                else:
                    await websocket.send(
                        json.dumps(
                            {
                                "type": "error",
                                "message": "Room does not exist or is full",
                            }
                        )
                    )
            elif data["type"] == "choice":
                room_id = data["room"]
                if room_id in games:
                    await games[room_id].receive_choice(websocket, data["choice"])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        for room in games.values():
            if websocket in room.players:
                del room.players[websocket]
                if not room.players:  # If no players left, delete the room
                    del games[room.room_id]


if __name__ == "__main__":
    asyncio.run(main())
