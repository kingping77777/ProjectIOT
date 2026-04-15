# ============================================
# gesture_detector.py
# Figure Flow - Hand Gesture Detection
# Uses MediaPipe 21 Landmarks
# Detects: Pinch, Fist, Palm, Peace
# ============================================

import math
import config


class GestureDetector:
    """
    Detects hand gestures from MediaPipe landmarks.
    
    Landmarks used:
    LM0  = Wrist
    LM4  = Thumb Tip
    LM8  = Index Tip
    LM12 = Middle Tip
    LM16 = Ring Tip
    LM20 = Pinky Tip
    LM6  = Index PIP (knuckle)
    LM10 = Middle PIP
    LM14 = Ring PIP
    LM18 = Pinky PIP
    """

    def __init__(self):
        # Debounce counters per hand
        self._counters = {}
        # EMA smoothed landmarks per hand
        self._smoothed = {}

    def process(self, hand_landmarks, hand_index=0):
        """
        Takes MediaPipe landmarks.
        Returns gesture data dict.
        
        Returns:
            {
                "gesture": "pinch" | "fist" | "palm" | "peace" | None,
                "x": float (0.0 to 1.0),
                "y": float (0.0 to 1.0),
                "raw_gesture": str or None
            }
        """
        lm = hand_landmarks.landmark

        # ── Step 1: Smooth landmarks ──
        lm = self._smooth(lm, hand_index)

        # ── Step 2: Get key points ──
        thumb_tip  = lm[4]
        index_tip  = lm[8]
        middle_tip = lm[12]
        ring_tip   = lm[16]
        pinky_tip  = lm[20]
        wrist      = lm[0]

        index_pip  = lm[6]
        middle_pip = lm[10]
        ring_pip   = lm[14]
        pinky_pip  = lm[18]

        # ── Step 3: Calculate distances ──
        pinch_dist = self._dist(thumb_tip, index_tip)

        tips = [thumb_tip, index_tip, middle_tip, ring_tip, pinky_tip]
        tip_to_wrist = [self._dist(t, wrist) for t in tips]
        max_tip_dist = max(tip_to_wrist)

        # ── Step 4: Detect gesture ──
        raw_gesture = None

        # PINCH — thumb and index touching
        if pinch_dist < config.PINCH_THRESHOLD:
            raw_gesture = "pinch"

        # FIST — all tips close to wrist
        elif max_tip_dist < config.FIST_THRESHOLD:
            raw_gesture = "fist"

        # PEACE — index + middle up, others down
        elif (self._is_extended(index_tip, index_pip) and
              self._is_extended(middle_tip, middle_pip) and
              not self._is_extended(ring_tip, ring_pip) and
              not self._is_extended(pinky_tip, pinky_pip)):
            raw_gesture = "peace"

        # PALM — all fingers extended
        elif (self._is_extended(index_tip, index_pip) and
              self._is_extended(middle_tip, middle_pip) and
              self._is_extended(ring_tip, ring_pip) and
              self._is_extended(pinky_tip, pinky_pip)):
            raw_gesture = "palm"

        # ── Step 5: Debounce ──
        confirmed = self._debounce(raw_gesture, hand_index)

        # ── Step 6: Hand position ──
        x = (thumb_tip.x + index_tip.x) / 2.0
        y = (thumb_tip.y + index_tip.y) / 2.0

        return {
            "gesture": confirmed,
            "x": x,
            "y": y,
            "raw_gesture": raw_gesture
        }

    # ─── HELPER: Distance between two points ───
    def _dist(self, a, b):
        """Euclidean distance in normalized coordinates."""
        return math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)

    # ─── HELPER: Is finger extended? ───
    def _is_extended(self, tip, pip):
        """
        Finger is extended if tip is ABOVE pip.
        MediaPipe y goes DOWN, so tip.y < pip.y = extended.
        """
        return tip.y < pip.y - 0.02

    # ─── HELPER: Debounce gesture ───
    def _debounce(self, raw_gesture, hand_index):
        """
        Gesture must be same for DEBOUNCE_FRAMES
        consecutive frames to be confirmed.
        Prevents flickering / false triggers.
        """
        if hand_index not in self._counters:
            self._counters[hand_index] = {
                "gesture": None,
                "count": 0,
                "confirmed": None
            }

        state = self._counters[hand_index]

        if raw_gesture == state["gesture"]:
            state["count"] += 1
        else:
            state["gesture"] = raw_gesture
            state["count"] = 1

        if state["count"] >= config.DEBOUNCE_FRAMES:
            state["confirmed"] = state["gesture"]

        return state["confirmed"]

    # ─── HELPER: Smooth landmarks with EMA ───
    def _smooth(self, landmarks, hand_index):
        """
        Exponential Moving Average on landmarks.
        Reduces hand jitter / shaking.
        
        alpha = 1.0 → no smoothing (raw)
        alpha = 0.3 → heavy smoothing (slow)
        alpha = 0.5 → balanced (recommended)
        """
        alpha = config.EMA_ALPHA

        # First frame — store raw values
        if hand_index not in self._smoothed:
            self._smoothed[hand_index] = [
                {"x": lm.x, "y": lm.y, "z": lm.z}
                for lm in landmarks
            ]
            return landmarks

        smoothed = self._smoothed[hand_index]

        # Wrapper class to mimic landmark object
        class LM:
            def __init__(self, x, y, z):
                self.x = x
                self.y = y
                self.z = z

        result = []
        for i, lm in enumerate(landmarks):
            sx = alpha * lm.x + (1 - alpha) * smoothed[i]["x"]
            sy = alpha * lm.y + (1 - alpha) * smoothed[i]["y"]
            sz = alpha * lm.z + (1 - alpha) * smoothed[i]["z"]
            smoothed[i] = {"x": sx, "y": sy, "z": sz}
            result.append(LM(sx, sy, sz))

        return result