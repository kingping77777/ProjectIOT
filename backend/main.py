# ============================================================
# main.py
# FigureFlow — Raspberry Pi 4 Entry Point
#
# Pipeline:
#   Camera → MediaPipe Hands → GestureDetector
#       → MIDIMapper (audio)
#       → SocketBridge (WebSocket → React UI)
#
# Run with: python main.py
# ============================================================

import asyncio
import time
import threading
import cv2
import mediapipe as mp

import config
from gesture_detector import GestureDetector
from midi_mapper import MIDIMapper
from socket_bridge import SocketBridge

# ── Globals ───────────────────────────────────────────────────────
bridge = SocketBridge()
detector = GestureDetector()
mapper = MIDIMapper()

mp_hands = mp.solutions.hands


# ── Camera + detection loop (runs in a separate thread) ──────────
def camera_loop(loop: asyncio.AbstractEventLoop):
    cap = cv2.VideoCapture(config.CAMERA_INDEX)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, config.TARGET_FPS)

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=config.MAX_HANDS,
        model_complexity=config.MODEL_COMPLEXITY,
        min_detection_confidence=config.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence=config.MIN_TRACKING_CONFIDENCE,
    )

    prev_time = time.time()

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.01)
            continue

        # ── MediaPipe expects RGB ──────────────────────────────────
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        now = time.time()
        fps = int(1.0 / max(now - prev_time, 1e-9))
        latency_ms = int((now - prev_time) * 1000)
        prev_time = now

        mode = bridge.mode          # piano | drums

        hands_data = []

        if results.multi_hand_landmarks and results.multi_handedness:
            for idx, (hand_lm, handedness) in enumerate(
                zip(results.multi_hand_landmarks, results.multi_handedness)
            ):
                label = handedness.classification[0].label  # "Left" | "Right"

                # Gesture detection
                gesture_info = detector.process(hand_lm, hand_index=idx)
                gesture = gesture_info["gesture"]           # "pinch" | "fist" | ...
                x = gesture_info["x"]
                y = gesture_info["y"]

                # MIDI output (only for first hand in piano mode)
                midi_result = {"active_note": None, "active_drum": None, "volume": 0.5}
                if idx == 0:
                    midi_result = mapper.process(gesture, x, y, mode)

                # Pack landmark list for UI
                landmarks = [
                    {"x": lm.x, "y": lm.y, "z": lm.z}
                    for lm in hand_lm.landmark
                ]

                hands_data.append({
                    "id": idx,
                    "label": label,
                    "gesture": gesture,
                    "x": round(x, 4),
                    "y": round(y, 4),
                    "landmarks": landmarks,
                    **midi_result,
                })

        # ── Build the frame payload ────────────────────────────────
        active_note = next((h.get("active_note") for h in hands_data if h.get("active_note")), None)
        active_drum = next((h.get("active_note") for h in hands_data if h.get("active_drum")), None)
        volume = hands_data[0].get("volume", 0.5) if hands_data else 0.5

        frame_payload = {
            "type": "frame",
            "fps": fps,
            "latency_ms": latency_ms,
            "mode": mode,
            "hands": hands_data,
            "hand_count": len(hands_data),
            "active_note": active_note,
            "active_drum": active_drum,
            "volume": round(volume, 3),
        }

        # Broadcast async from this sync thread
        asyncio.run_coroutine_threadsafe(bridge.broadcast(frame_payload), loop)

    cap.release()
    hands.close()


# ── Main ──────────────────────────────────────────────────────────
async def main():
    loop = asyncio.get_running_loop()

    # Start camera thread
    cam_thread = threading.Thread(target=camera_loop, args=(loop,), daemon=True)
    cam_thread.start()

    print("[Main] FigureFlow backend started.")
    print(f"[Main] WebSocket server → ws://0.0.0.0:{config.SERVER_PORT}")
    print(f"[Main] Default mode: {config.DEFAULT_MODE}")

    # Start WebSocket server (blocks forever)
    await bridge.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Main] Shutting down.")
        mapper.cleanup()
