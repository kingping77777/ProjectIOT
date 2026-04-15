import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_STATE = {
  hands: [],
  gesture: 'Idle',
  fps: 0,
  latency: 0,
  systemActive: false,
  activeNote: null,
  activeDrum: null,
  volume: 0.5,
  pitch: 0.5,
  preset: 0,
  mode: 'piano',
  handCount: 0,
}

/**
 * useBackend — connects to the Raspberry Pi WebSocket server.
 *
 * The backend broadcasts JSON frames:
 * {
 *   type: "frame",
 *   fps, latency_ms, mode, preset,
 *   hands: [{ id, label, gesture, x, y, landmarks, active_note, active_drum, volume }],
 *   hand_count, active_note, active_drum, volume
 * }
 *
 * @param {string} wsUrl  — e.g. "ws://192.168.1.xx:5000"
 */
export function useBackend(wsUrl) {
  const [state, setState] = useState({ ...DEFAULT_STATE, wsUrl })
  const [wsStatus, setWsStatus] = useState('disconnected') // 'connecting'|'connected'|'disconnected'|'error'
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) return

    setWsStatus('connecting')

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      console.log('[WS] Connected to backend:', wsUrl)
      setWsStatus('connected')
      setState(prev => ({ ...prev, systemActive: true }))
      clearTimeout(reconnectRef.current)
    }

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type !== 'frame') return

        // Map backend frame → UI state shape
        const primaryHand = msg.hands?.[0]
        const gesture = primaryHand?.gesture
          ? capitalizeGesture(primaryHand.gesture)
          : 'Idle'

        setState(prev => ({
          ...prev,
          fps: msg.fps ?? prev.fps,
          latency: msg.latency_ms ?? prev.latency,
          mode: msg.mode ?? prev.mode,
          preset: msg.preset ?? prev.preset,
          hands: (msg.hands ?? []).map(h => ({
            id: h.id,
            label: h.label,
            gesture: capitalizeGesture(h.gesture),
            x: h.x,
            y: h.y,
            landmarks: (h.landmarks ?? []).map(lm => ({ x: lm.x, y: lm.y, z: lm.z })),
          })),
          handCount: msg.hand_count ?? 0,
          gesture,
          activeNote: msg.active_note ?? null,
          activeDrum: msg.active_drum ?? null,
          volume: msg.volume ?? prev.volume,
          pitch: primaryHand?.x ?? prev.pitch,
          systemActive: true,
        }))
      } catch (e) {
        console.warn('[WS] Parse error:', e)
      }
    }

    ws.onerror = () => {
      setWsStatus('error')
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      console.log('[WS] Disconnected — retrying in 3s')
      setWsStatus('disconnected')
      setState(prev => ({ ...prev, systemActive: false }))
      // Auto-reconnect after 3s
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 3000)
    }
  }, [wsUrl])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  // Send a command to the backend (mode/preset change)
  const sendCmd = useCallback((cmd, value) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ cmd, value }))
    }
  }, [])

  const setMode = useCallback((mode) => {
    setState(prev => ({ ...prev, mode }))
    sendCmd('set_mode', mode)
  }, [sendCmd])

  const cyclePreset = useCallback((dir) => {
    setState(prev => {
      const next = (prev.preset + dir + 7) % 7
      sendCmd('set_preset', next)
      return { ...prev, preset: next }
    })
  }, [sendCmd])

  return { handState: state, wsStatus, setMode, cyclePreset }
}

// "pinch" → "Pinch", "thumbs_up" → "Thumbs Up"
function capitalizeGesture(g) {
  if (!g) return 'Idle'
  return g
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
