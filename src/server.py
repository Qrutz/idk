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
        self.player_names = []
        self.choice = None  # Track the choice of the first player

    async def add_player(self, websocket, name):
        if len(self.players) < 2:
            self.players[websocket] = name
            self.player_names.append(name)
            return True, None
        return False, "Room is full"

    async def receive_choice(self, websocket, choice):
        if self.choice is None:  # Only accept the first choice
            self.choice = choice
            opposite_choice = "tails" if choice == "heads" else "heads"
            result = random.choice(["heads", "tails"])
            await self.send_results(result, choice, opposite_choice)
        else:
            await websocket.send(
                json.dumps({"type": "error", "message": "Choice already made"})
            )

    async def send_results(self, result, first_choice, second_choice):
        first_player = next(iter(self.players))  # The first player in the dictionary
        second_player = next(
            iter({k: v for k, v in self.players.items() if k != first_player})
        )
        first_player_msg = {
            "type": "result",
            "your_choice": first_choice,
            "opponent_choice": second_choice,
            "outcome": result,
            "win": result == first_choice,
        }
        second_player_msg = {
            "type": "result",
            "your_choice": second_choice,
            "opponent_choice": first_choice,
            "outcome": result,
            "win": result == second_choice,
        }
        await first_player.send(json.dumps(first_player_msg))
        await second_player.send(json.dumps(second_player_msg))


# async def process_request(path, request_headers):
#     """
#     Handle CORS policy for WebSocket by allowing origins that match your criteria.
#     """
#     if "Origin" in request_headers:
#         # You might want to validate the origin here and adjust "Allow-Origin" accordingly.
#         response_headers = [
#             (
#                 "Access-Control-Allow-Origin",
#                 "*",
#             ),  # Be more specific in production!
#             ("Access-Control-Allow-Methods", "OPTIONS, GET"),
#             ("Access-Control-Allow-Headers", "Content-Type"),
#         ]
#         return 200, response_headers
#     return None


async def main():
    async with websockets.serve(handler, "localhost", 6789):
        await asyncio.Future()  # run forever


async def handler(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            print(data)
            if data["type"] == "create":
                room_id = str(uuid.uuid4())  # Generate a unique room ID
                games[room_id] = GameRoom(room_id)
                invite_link = (
                    f"http://yourdomain.com/game/{room_id}"  # Generate the invite link
                )
                await websocket.send(
                    json.dumps(
                        {"type": "room_created", "room": room_id, "link": invite_link}
                    )
                )
            elif data["type"] == "join":
                room_id = data["room"]
                if room_id in games:
                    success, message = await games[room_id].add_player(
                        websocket, data["name"]
                    )
                    if success:
                        await websocket.send(
                            json.dumps(
                                {
                                    "type": "status",
                                    "message": "Waiting for another player...",
                                }
                            )
                        )
                        if len(games[room_id].players) == 2:
                            await next(iter(games[room_id].players)).send(
                                json.dumps(
                                    {"type": "status", "message": "Your turn to choose"}
                                )
                            )
                    else:
                        await websocket.send(
                            json.dumps({"type": "error", "message": message})
                        )
                else:
                    await websocket.send(
                        json.dumps({"type": "error", "message": "Room does not exist"})
                    )
            elif data["type"] == "choice":
                room_id = data["room"]
                if room_id in games:
                    await games[room_id].receive_choice(websocket, data["choice"])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Cleanup on disconnection
        for room in games.values():
            if websocket in room.players:
                del room.players[websocket]
                break


if __name__ == "__main__":
    asyncio.run(main())
