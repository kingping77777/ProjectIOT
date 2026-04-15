import { useState, useEffect, useRef } from 'react'

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
const GESTURES = ['Pinch', 'Palm', 'Fist', 'Peace', 'Thumbs Up', 'Thumbs Down', 'Idle']
const PRESETS = ['Grand Piano', 'Strings Ensemble', 'Electric Guitar', 'Synth Pad', 'Flute', 'Bass Guitar', 'Vibraphone']

function lerp(a, b, t) { return a + (b - a) * t }

export function useSimulatedHands() {
  const [handState, setHandState] = useState({
    hands: [],
    gesture: 'Idle',
    fps: 28,
    latency: 34,
    systemActive: true,
    activeNote: null,
    activeDrum: null,
    volume: 0.5,
    pitch: 0.5,
    preset: 0,
    mode: 'piano',
    handCount: 0,
  })

  const timeRef = useRef(0)
  const gestureTimerRef = useRef(0)
  const currentGestureRef = useRef('Idle')
  const phaseRef = useRef(Math.random() * Math.PI * 2)

  useEffect(() => {
    let raf

    const tick = () => {
      timeRef.current += 0.016 // ~60fps simulation
      gestureTimerRef.current += 0.016

      // Cycle gestures every ~3 seconds
      if (gestureTimerRef.current > 3) {
        gestureTimerRef.current = 0
        const available = ['Pinch', 'Palm', 'Peace', 'Fist', 'Thumbs Up', 'Idle']
        currentGestureRef.current = available[Math.floor(Math.random() * available.length)]
      }

      const t = timeRef.current
      const gesture = currentGestureRef.current

      // Simulate two hands with organic motion
      const hand1x = 0.3 + 0.2 * Math.sin(t * 0.7 + phaseRef.current)
      const hand1y = 0.4 + 0.2 * Math.cos(t * 0.5)
      const hand2x = 0.6 + 0.15 * Math.cos(t * 0.6 + 1.2)
      const hand2y = 0.45 + 0.15 * Math.sin(t * 0.8 + 0.5)

      // Determine active note based on X position
      const noteIdx = Math.min(6, Math.floor(hand1x * 7))
      const activeNote = gesture === 'Pinch' ? NOTES[noteIdx] : null

      // Volume from Y position (inverted: top = loud)
      const volume = 1 - hand1y

      // FPS jitter
      const fps = Math.round(27 + Math.random() * 3)
      const latency = Math.round(28 + Math.random() * 15)

      setHandState(prev => ({
        ...prev,
        gesture,
        fps,
        latency,
        activeNote,
        volume: lerp(prev.volume, volume, 0.1),
        pitch: lerp(prev.pitch, hand1x, 0.1),
        handCount: 2,
        hands: [
          {
            id: 'right',
            label: 'Right',
            x: hand1x,
            y: hand1y,
            gesture,
            landmarks: generateLandmarks(hand1x, hand1y, t),
          },
          {
            id: 'left',
            label: 'Left',
            x: hand2x,
            y: hand2y,
            gesture: gesture === 'Pinch' ? 'Palm' : gesture,
            landmarks: generateLandmarks(hand2x, hand2y, t + 1.5),
          },
        ],
      }))

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const setMode = (mode) => setHandState(prev => ({ ...prev, mode }))
  const cyclePreset = (dir) =>
    setHandState(prev => ({
      ...prev,
      preset: (prev.preset + dir + PRESETS.length) % PRESETS.length,
    }))

  return { handState, NOTES, GESTURES, PRESETS, setMode, cyclePreset }
}

function generateLandmarks(cx, cy, t) {
  // 21 MediaPipe-like landmarks for a hand
  const landmarks = []
  const wristX = cx
  const wristY = cy

  // Wrist (0)
  landmarks.push({ x: wristX, y: wristY + 0.08 })

  // Thumb (1-4)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: wristX - 0.06 - i * 0.015 + Math.sin(t * 2 + i) * 0.005,
      y: wristY + 0.04 - i * 0.02 + Math.cos(t * 2 + i) * 0.003,
    })
  }

  // Index (5-8)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: wristX - 0.025 + Math.sin(t * 1.5 + i) * 0.004,
      y: wristY - i * 0.025 + Math.cos(t * 1.5 + i) * 0.003,
    })
  }

  // Middle (9-12)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: wristX + Math.sin(t + i) * 0.004,
      y: wristY - i * 0.028 + Math.cos(t + i) * 0.003,
    })
  }

  // Ring (13-16)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: wristX + 0.025 + Math.sin(t * 0.8 + i) * 0.004,
      y: wristY - i * 0.025 + Math.cos(t * 0.8 + i) * 0.003,
    })
  }

  // Pinky (17-20)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: wristX + 0.05 + Math.sin(t * 1.2 + i) * 0.003,
      y: wristY - i * 0.02 + Math.cos(t * 1.2 + i) * 0.002,
    })
  }

  return landmarks
}
