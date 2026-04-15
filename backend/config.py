# ============================================
# config.py
# Figure Flow - Gesture Music System
# Hardware: Raspberry Pi 4 (8GB)
# CPU: Quad-Core Cortex-A72
# Camera: USB Webcam 1080p
# Connection: Same WiFi
# ============================================

# ─── Camera ───────────────────────────────
CAMERA_INDEX = 0          # USB Webcam
FRAME_WIDTH = 640         # Process at 640x480
FRAME_HEIGHT = 480        # Good for Pi 4
TARGET_FPS = 30           # Target frame rate

# ─── MediaPipe ────────────────────────────
MODEL_COMPLEXITY = 0      # 0 = fastest for Pi 4
MAX_HANDS = 2             # Track both hands
MIN_DETECTION_CONFIDENCE = 0.5
MIN_TRACKING_CONFIDENCE = 0.5

# ─── Gesture Tuning ───────────────────────
PINCH_THRESHOLD = 0.05    # Pinch sensitivity
FIST_THRESHOLD = 0.10     # Fist sensitivity
DEBOUNCE_FRAMES = 3       # Stability frames
EMA_ALPHA = 0.5           # Smoothing factor

# ─── MIDI ─────────────────────────────────
MIDI_PORT_NAME = "GestureMIDI"
PIANO_CHANNEL = 0         # MIDI Channel 1
DRUM_CHANNEL = 9          # MIDI Channel 10
NOTE_OFF_DELAY = 0.08     # 80ms note duration

# ─── Piano ────────────────────────────────
PIANO_BASE_NOTE = 60      # Middle C = C4
PIANO_NOTES = 7           # C D E F G A B
PIANO_VELOCITY_MIN = 30
PIANO_VELOCITY_MAX = 127

# ─── Drums ────────────────────────────────
# Grid Layout:
# ┌──────────┬──────────┬──────────┐
# │ KICK  36 │ SNARE 38 │ HIHAT 42 │ ROW 0
# ├──────────┼──────────┼──────────┤
# │ CLAP  39 │ TOM   41 │ CRASH 49 │ ROW 1
# └──────────┴──────────┴──────────┘
#    COL 0       COL 1      COL 2

DRUM_MAP = {
    (0, 0): 36,   # Kick Drum
    (0, 1): 38,   # Snare Drum
    (0, 2): 42,   # Hi-Hat
    (1, 0): 39,   # Clap
    (1, 1): 41,   # Low Tom
    (1, 2): 49,   # Crash Cymbal
}
DRUM_VELOCITY = 100

# ─── SoundFont ────────────────────────────
# On PC (Windows) for testing:
SOUNDFONT_PATH_WINDOWS = "C:/soundfonts/FluidR3_GM.sf2"
# On Raspberry Pi 4:
SOUNDFONT_PATH_PI = "/usr/share/sounds/sf2/FluidR3_GM.sf2"

# ─── Mode ─────────────────────────────────
DEFAULT_MODE = "piano"

# ─── WebSocket Server ─────────────────────
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 5000

# ─── Note Names ───────────────────────────
NOTE_NAMES = {
    60: "C4",
    62: "D4",
    64: "E4",
    65: "F4",
    67: "G4",
    69: "A4",
    71: "B4"
}

# ─── Drum Names ───────────────────────────
DRUM_NAMES = {
    36: "Kick",
    38: "Snare",
    42: "Hi-Hat",
    39: "Clap",
    41: "Tom",
    49: "Crash"
}