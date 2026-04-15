# ============================================================
# socket_bridge.py
# FigureFlow — WebSocket bridge between MediaPipe pipeline
# and the React UI.
#
# Sends real-time JSON frames to all connected clients:
#   {
#     "type":      "frame",
#     "fps":       int,
#     "latency_ms": int,
#     "mode":      "piano" | "drums",
#     "hands": [
#       {
#         "id":        0 | 1,
#         "label":     "Right" | "Left",
#         "gesture":   "pinch" | "fist" | "palm" | "peace" | null,
#         "x":         float,   # 0.0–1.0
#         "y":         float,   # 0.0–1.0
#         "landmarks": [[x,y,z], ...]   # 21 points
#       }
#     ],
#     "active_note": "C4" | null,
#     "active_drum": "Kick" | null,
#     "preset":     int,
#     "volume":     float    # 0.0–1.0
#   }
#
# Receives commands from UI:
#   { "cmd": "set_mode",   "value": "piano" | "drums" }
#   { "cmd": "set_preset", "value": int }
# ============================================================

import asyncio
import json
import time
import websockets
import config


class SocketBridge:
    def __init__(self):
        self._clients: set = set()
        self._mode: str = config.DEFAULT_MODE
        self._preset: int = 0
        self._last_frame: dict = {}

    # ── Server entry point ─────────────────────────────────────────
    async def start(self):
        """Start the WebSocket server on config.SERVER_HOST:SERVER_PORT."""
        print(f"[WS] Listening on ws://{config.SERVER_HOST}:{config.SERVER_PORT}")
        async with websockets.serve(
            self._handler,
            config.SERVER_HOST,
            config.SERVER_PORT,
            ping_interval=20,
            ping_timeout=60,
        ):
            await asyncio.Future()          # run forever

    # ── Client lifecycle ───────────────────────────────────────────
    async def _handler(self, ws):
        self._clients.add(ws)
        print(f"[WS] Client connected  ({len(self._clients)} total)")
        try:
            # Send last known frame immediately so UI is not blank
            if self._last_frame:
                await ws.send(json.dumps(self._last_frame))
            # Listen for commands from UI
            async for raw in ws:
                await self._handle_cmd(raw)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self._clients.discard(ws)
            print(f"[WS] Client disconnected ({len(self._clients)} remaining)")

    # ── Inbound command handler ────────────────────────────────────
    async def _handle_cmd(self, raw: str):
        try:
            msg = json.loads(raw)
            cmd = msg.get("cmd")
            if cmd == "set_mode":
                self._mode = msg.get("value", self._mode)
                print(f"[WS] Mode → {self._mode}")
            elif cmd == "set_preset":
                self._preset = int(msg.get("value", self._preset))
                print(f"[WS] Preset → {self._preset}")
        except Exception as e:
            print(f"[WS] Bad command: {e}")

    # ── Broadcast a frame to all connected clients ─────────────────
    async def broadcast(self, frame: dict):
        """Called from main loop with the latest gesture frame."""
        frame["mode"] = self._mode
        frame["preset"] = self._preset
        self._last_frame = frame
        if not self._clients:
            return
        payload = json.dumps(frame)
        # Fire-and-forget to all clients; ignore disconnected ones
        await asyncio.gather(
            *[self._safe_send(ws, payload) for ws in list(self._clients)],
            return_exceptions=True,
        )

    async def _safe_send(self, ws, payload: str):
        try:
            await ws.send(payload)
        except Exception:
            self._clients.discard(ws)

    # ── Convenience properties for main loop ──────────────────────
    @property
    def mode(self) -> str:
        return self._mode

    @property
    def preset(self) -> int:
        return self._preset
