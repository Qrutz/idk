import asyncio
import websockets
import json
import random

games = {}


class GameRoom:
    def __init__(self):
        self.players = {}
        self.player_names = []
        self.choice = None  # Track the choice of the first player

    def add_player(self, websocket, name):
        if len(self.players) < 2:
            self.players[websocket] = name
            self.player_names.append(name)
            return True
        return False

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


async def handler(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "join":
                room_id = data["room"]
                if room_id not in games:
                    games[room_id] = GameRoom()
                if games[room_id].add_player(websocket, data["name"]):
                    if len(games[room_id].players) == 2:
                        # Notify the first player to choose
                        await next(iter(games[room_id].players)).send(
                            json.dumps(
                                {"type": "status", "message": "Your turn to choose"}
                            )
                        )
                    else:
                        await websocket.send(
                            json.dumps(
                                {
                                    "type": "status",
                                    "message": "Waiting for another player...",
                                }
                            )
                        )
                else:
                    await websocket.send(
                        json.dumps({"type": "error", "message": "Room is full"})
                    )
            elif data["type"] == "choice":
                await games[data["room"]].receive_choice(websocket, data["choice"])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Cleanup on disconnection
        for room in games.values():
            if websocket in room.players:
                del room.players[websocket]
                break


start_server = websockets.serve(handler, "localhost", 6789)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
