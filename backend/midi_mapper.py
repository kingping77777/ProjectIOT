# ============================================================
# midi_mapper.py
# FigureFlow — Maps gesture data to MIDI notes/drums.
# Plays audio via FluidSynth + SoundFont.
# ============================================================

import time
import platform
import config

# ── Try importing MIDI + FluidSynth libs ──────────────────────────
try:
    import rtmidi
    MIDI_AVAILABLE = True
except ImportError:
    print("[MIDI] python-rtmidi not found — MIDI output disabled.")
    MIDI_AVAILABLE = False

try:
    import fluidsynth
    FLUID_AVAILABLE = True
except ImportError:
    print("[MIDI] pyfluidsynth not found — FluidSynth disabled.")
    FLUID_AVAILABLE = False


class MIDIMapper:
    """
    Maps (gesture, x, y) → MIDI note/drum events.
    Piano mode  : x → pitch zone (7 notes), y → velocity
    Drum mode   : (x, y) → 2×3 grid pad
    """

    NOTE_LIST = [60, 62, 64, 65, 67, 69, 71]   # C4–B4

    def __init__(self):
        self._fs = None
        self._sfid = None
        self._active_note = None
        self._active_drum = None
        self._last_drum_time = 0.0
        self._setup_synth()

    # ── FluidSynth setup ──────────────────────────────────────────
    def _setup_synth(self):
        if not FLUID_AVAILABLE:
            return
        sf_path = (
            config.SOUNDFONT_PATH_PI
            if platform.system() != "Windows"
            else config.SOUNDFONT_PATH_WINDOWS
        )
        try:
            self._fs = fluidsynth.Synth()
            self._fs.start(driver="alsa" if platform.system() == "Linux" else "dsound")
            self._sfid = self._fs.sfload(sf_path)
            self._fs.program_select(config.PIANO_CHANNEL, self._sfid, 0, 0)
            print(f"[MIDI] FluidSynth ready — SoundFont: {sf_path}")
        except Exception as e:
            print(f"[MIDI] FluidSynth init failed: {e}")
            self._fs = None

    # ── Public: Process one gesture frame ─────────────────────────
    def process(self, gesture: str, x: float, y: float, mode: str) -> dict:
        """
        Returns dict describing what note/drum was triggered:
          { "active_note": "C4" | None, "active_drum": "Kick" | None, "volume": float }
        """
        volume = max(0.0, min(1.0, 1.0 - y))   # y=0 (top) → loud, y=1 (bottom) → quiet

        if mode == "piano":
            return self._process_piano(gesture, x, volume)
        else:
            return self._process_drum(gesture, x, y)

    # ── Piano mode ────────────────────────────────────────────────
    def _process_piano(self, gesture: str, x: float, volume: float) -> dict:
        note_idx = min(6, max(0, int(x * 7)))
        midi_note = self.NOTE_LIST[note_idx]
        note_name = config.NOTE_NAMES.get(midi_note, "?")

        velocity = int(
            config.PIANO_VELOCITY_MIN
            + volume * (config.PIANO_VELOCITY_MAX - config.PIANO_VELOCITY_MIN)
        )

        if gesture == "pinch":
            if self._active_note != midi_note:
                self._midi_note_off(self._active_note, config.PIANO_CHANNEL)
                self._midi_note_on(midi_note, velocity, config.PIANO_CHANNEL)
                self._active_note = midi_note
        else:
            if self._active_note is not None:
                self._midi_note_off(self._active_note, config.PIANO_CHANNEL)
                self._active_note = None

        return {
            "active_note": note_name if self._active_note else None,
            "active_drum": None,
            "volume": volume,
        }

    # ── Drum mode ─────────────────────────────────────────────────
    def _process_drum(self, gesture: str, x: float, y: float) -> dict:
        col = min(2, int(x * 3))
        row = min(1, int(y * 2))
        midi_note = config.DRUM_MAP.get((row, col))
        drum_name = config.DRUM_NAMES.get(midi_note, "?") if midi_note else None

        now = time.time()
        if gesture == "pinch" and midi_note and (now - self._last_drum_time) > 0.1:
            self._midi_note_on(midi_note, config.DRUM_VELOCITY, config.DRUM_CHANNEL)
            self._last_drum_time = now
            self._active_drum = drum_name
        else:
            self._active_drum = None

        return {
            "active_note": None,
            "active_drum": self._active_drum,
            "volume": 0.8,
        }

    # ── Raw MIDI helpers ──────────────────────────────────────────
    def _midi_note_on(self, note: int, velocity: int, channel: int):
        if self._fs:
            self._fs.noteon(channel, note, velocity)

    def _midi_note_off(self, note, channel: int):
        if note is not None and self._fs:
            self._fs.noteoff(channel, note)

    def cleanup(self):
        if self._active_note and self._fs:
            self._fs.noteoff(config.PIANO_CHANNEL, self._active_note)
        if self._fs:
            self._fs.delete()
