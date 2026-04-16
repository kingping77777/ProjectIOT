# FigureFlow Architecture Blueprint

FigureFlow is a real-time, gesture-controlled music synthesizer. It converts your physical hand movements into MIDI data, synthesizes audio locally, and streams the control data to a beautiful React dashboard.

The application is split into two completely decoupled systems: a **Python Backend Server** (which does all the heavy lifting and sound generation) and a **React Frontend UI** (which serves as a visual control deck).

---

## 1. The Python Backend (The "Brain" & "Audio Engine")
* **Language:** Python
* **Core Libraries:** OpenCV, MediaPipe, FluidSynth, WebSockets
* **Location:** `C:\Users\Gaurav\ProjectIOT-backend\backend`

### The Processing Pipeline:
1. **Camera Capture (`main.py`):** Uses OpenCV (`cv2`) to grab frames from your webcam at a high frame rate.
2. **AI Hand Tracking (`main.py`):** Feeds the RGB video frames into Google's **MediaPipe Hands** AI model. MediaPipe returns 21 distinct 3D joint coordinates per hand.
3. **Gesture Classification (`gesture_detector.py`):** Analyzes the angles and distances between the joints to figure out what gesture you are making (e.g., "Fist", "Pinch", "Palm").
4. **Music Generation (`midi_mapper.py`):**
    - Takes your `X` coordinate to pick a music note or drum pad.
    - Takes your `Y` coordinate to calculate volume/velocity (higher up = louder).
    - Looks for trigger gestures (like "Palm" for Piano, "Pinch" for Drums). 
    - Uses **FluidSynth** (loaded with a SoundFont `.sf2` file) to actively play the sound through your local computer speakers.
5. **WebSocket Broadcasting (`socket_bridge.py`):** Packs all the calculated data (hand coordinates, current note playing, FPS, Gestures) into a tiny JSON frame and broadcasts it out over a local socket server (`ws://0.0.0.0:5000`).

---

## 2. The React Frontend (The "Control Dashboard")
* **Framework:** React + Vite (+ TailwindCSS + Framer Motion)
* **Location:** `D:\Desktop\figureflow-ui`
* **Address:** `http://localhost:5173`

The frontend **does not** process audio or AI itself. It simply draws a beautiful visualization of what the Python backend is doing.

### Core Modules:
1. **Data Ingestion (`useBackend.js`):** A custom React hook that connects to `ws://localhost:5000`. It listens to the Python server 30+ times a second and updates a master React State object with the exact coordinates of your hands.
2. **Live Interface (`App.jsx`):** The master dashboard layout that distributes the backend data to various widgets.
3. **The Widgets:**
    - **`CameraFeed`:** Runs the webcam in a hidden background element, and uses an HTML5 Canvas to draw beautiful neon glowing lines over your real fingers using the coordinate data received from the backend.
    - **`XYPad`:** A 2D radar control map. It plots your hand on an X/Y axis grid so you can dial in exactly what Pitch (X) and Volume (Y) you are targeting.
    - **`AudioVisualizer`:** Displays dynamic, reacting waveform graphics based on the volume and pitch of the note you are currently holding.
    - **`PianoMode` & `DrumMode`:** Visual representations of the instrument you are playing. They light up specific keys or pads when the backend reports that an `active_note` is currently playing.
    - **`HandTracker`:** Provides technical telemetry, such as which hand is detected (Left/Right) and what the current gesture state is.

---

## System Flow Summary

1. **You raise a "Palm" over the Camera.**
2. OpenCV (Python) sees it → MediaPipe plots 21 points → GestureDetector flags "Palm".
3. MIDIMapper translates points to `Note: E4, Volume: 80%` and commands FluidSynth to play E4 audio.
4. Python broadcasts: `{ gesture: "Palm", x: 0.4, y: 0.2, note: "E4" }` via WebSocket.
5. React receives the JSON → `useBackend` updates state.
6. The `CameraFeed` UI draws a neon skeleton over your palm, the `XYPad` UI plots your dot, and the `PianoMode` UI lights up the "E4" key on your screen!
