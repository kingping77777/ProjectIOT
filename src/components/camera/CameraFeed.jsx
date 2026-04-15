import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Eye, Hand, VideoOff } from 'lucide-react'

const GESTURE_ICONS = {
  Pinch: '👌',
  Palm: '✋',
  Fist: '✊',
  Peace: '✌️',
  'Thumbs Up': '👍',
  'Thumbs Down': '👎',
  Idle: '🖐️',
}

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

const FINGER_COLORS = [
  '#f59e0b', // Thumb
  '#06b6d4', // Index - cyan
  '#8b5cf6', // Middle - violet
  '#f472b6', // Ring - pink
  '#4ade80', // Pinky - green
]

function getFingerColor(idx) {
  if (idx >= 1 && idx <= 4) return FINGER_COLORS[0]
  if (idx >= 5 && idx <= 8) return FINGER_COLORS[1]
  if (idx >= 9 && idx <= 12) return FINGER_COLORS[2]
  if (idx >= 13 && idx <= 16) return FINGER_COLORS[3]
  if (idx >= 17 && idx <= 20) return FINGER_COLORS[4]
  return '#94a3b8'
}

export function CameraFeed({ hands, gesture, handCount }) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const animRef = useRef(null)
  const [camStatus, setCamStatus] = useState('pending') // 'pending' | 'active' | 'denied'

  // ── Start webcam ────────────────────────────────────────────────
  useEffect(() => {
    let stream = null

    async function startCamera() {
      // Camera purposefully turned off based on user request
      setCamStatus('denied')
      return
    }

    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  // ── Draw loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // ── 1. Background: real camera or fallback dark grid ──────────
      const video = videoRef.current
      if (camStatus === 'active' && video && video.readyState >= 2) {
        // Mirror-flip to match natural selfie view
        ctx.save()
        ctx.translate(W, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, W, H)
        ctx.restore()
        // Subtle dark overlay so landmarks pop on bright backgrounds
        ctx.fillStyle = 'rgba(2,8,24,0.35)'
        ctx.fillRect(0, 0, W, H)
      } else {
        // Fallback: dark grid (demo / denied)
        ctx.fillStyle = 'rgba(2, 8, 24, 0.92)'
        ctx.fillRect(0, 0, W, H)
        ctx.strokeStyle = 'rgba(99,102,241,0.08)'
        ctx.lineWidth = 1
        for (let x = 0; x < W; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
        }
        for (let y = 0; y < H; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
        }
      }

      // ── 2. Scan-line effect ───────────────────────────────────────
      const scanOffset = (Date.now() / 30) % H
      const scanGrad = ctx.createLinearGradient(0, scanOffset - 60, 0, scanOffset + 60)
      scanGrad.addColorStop(0, 'rgba(6,182,212,0)')
      scanGrad.addColorStop(0.5, 'rgba(6,182,212,0.05)')
      scanGrad.addColorStop(1, 'rgba(6,182,212,0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanOffset - 60, W, 120)

      // ── 3. Corner targeting brackets ─────────────────────────────
      const bSize = 24
      ctx.strokeStyle = 'rgba(6,182,212,0.6)'
      ctx.lineWidth = 2
      const corners = [[12,12],[W-12,12],[12,H-12],[W-12,H-12]]
      corners.forEach(([cx, cy], i) => {
        const sx = i < 2 ? 1 : -1
        const sy = i % 2 === 0 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(cx + sx * bSize, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + sy * bSize)
        ctx.stroke()
      })

      // ── 4. Hand landmarks ─────────────────────────────────────────
      hands.forEach((hand) => {
        if (!hand.landmarks || hand.landmarks.length !== 21) return
        const lms = hand.landmarks.map(p => ({ x: p.x * W, y: p.y * H }))

        // Connections
        CONNECTIONS.forEach(([a, b]) => {
          const p1 = lms[a], p2 = lms[b]
          const col = getFingerColor(Math.max(a, b))
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          grad.addColorStop(0, col + 'bb')
          grad.addColorStop(1, col + '66')
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.shadowColor = col
          ctx.shadowBlur = 6
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
          ctx.shadowBlur = 0
        })

        // Landmark dots
        lms.forEach((pt, idx) => {
          const col = getFingerColor(idx)
          const isTip = [4, 8, 12, 16, 20].includes(idx)
          const r = isTip ? 6 : 3.5

          ctx.shadowColor = col
          ctx.shadowBlur = isTip ? 14 : 7
          ctx.fillStyle = col
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
          ctx.fill()

          if (isTip) {
            ctx.strokeStyle = col + '99'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, r + 5, 0, Math.PI * 2)
            ctx.stroke()
          }
          ctx.shadowBlur = 0
        })

        // Hand label
        const wrist = lms[0]
        ctx.font = '600 11px "JetBrains Mono", monospace'
        ctx.fillStyle = 'rgba(6,182,212,0.95)'
        ctx.textAlign = 'center'
        ctx.shadowColor = '#06b6d4'
        ctx.shadowBlur = 6
        ctx.fillText(hand.label, wrist.x, wrist.y + 18)
        ctx.shadowBlur = 0
      })

      // ── 5. Edge glow when gesture detected ───────────────────────
      if (gesture && gesture !== 'Idle') {
        const pulse = 0.04 + 0.02 * Math.sin(Date.now() / 200)
        const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) / 2)
        grad.addColorStop(0, 'rgba(6,182,212,0)')
        grad.addColorStop(0.75, 'rgba(6,182,212,0)')
        grad.addColorStop(1, `rgba(6,182,212,${pulse})`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [hands, gesture, camStatus])

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Live Feed</span>
          <span className="text-xs font-mono text-slate-500">MediaPipe Hands</span>
          {/* Camera status pill */}
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-md"
            style={{
              background: camStatus === 'active'
                ? 'rgba(74,222,128,0.12)'
                : camStatus === 'denied'
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(148,163,184,0.08)',
              color: camStatus === 'active' ? '#4ade80'
                : camStatus === 'denied' ? '#f87171' : '#94a3b8',
              border: `1px solid ${camStatus === 'active' ? 'rgba(74,222,128,0.3)'
                : camStatus === 'denied' ? 'rgba(239,68,68,0.3)' : 'rgba(148,163,184,0.15)'}`,
            }}
          >
            {camStatus === 'active' ? '● LIVE' : camStatus === 'denied' ? '● DENIED' : '◌ INIT'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Hand className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-mono text-violet-400">
            {handCount} hand{handCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Video + Canvas stack */}
      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
        {/* Hidden video element — feeds into canvas */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
          muted
          playsInline
        />

        {/* Overlay canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover"
          style={{ borderRadius: 16, display: 'block' }}
        />

        {/* Demo / denied overlay badge */}
        {camStatus !== 'active' && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl pointer-events-none"
            style={{
              background: 'rgba(2,8,24,0.7)',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {camStatus === 'denied'
              ? <VideoOff className="w-3.5 h-3.5 text-red-400" />
              : <Eye className="w-3.5 h-3.5 text-cyan-400" />
            }
            <span className="text-xs font-mono text-slate-400">
              {camStatus === 'denied' ? 'Camera access denied — demo mode' : 'Requesting camera…'}
            </span>
          </div>
        )}

        {/* Gesture Badge */}
        <AnimatePresence mode="wait">
          {gesture && gesture !== 'Idle' && (
            <motion.div
              key={gesture}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute top-3 left-3"
            >
              <div
                className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                style={{
                  background: 'rgba(6,182,212,0.15)',
                  border: '1px solid rgba(6,182,212,0.6)',
                  boxShadow: '0 0 20px rgba(6,182,212,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className="text-base">{GESTURE_ICONS[gesture]}</span>
                <span className="font-mono text-xs text-cyan-300 font-semibold tracking-wider uppercase">
                  {gesture}
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REC indicator */}
        {gesture === 'Fist' && (
          <motion.div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)' }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-mono text-red-400">REC</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
