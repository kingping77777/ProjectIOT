import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Move } from 'lucide-react'

export function XYPad({ pitch, volume, hands }) {
  const canvasRef = useRef(null)
  const trailsRef = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    // Add to trails for each hand
    hands.forEach((hand, hi) => {
      trailsRef.current.push({
        x: hand.x * W,
        y: hand.y * H,
        hand: hi,
        alpha: 0.8,
      })
    })
    // Limit trail length
    if (trailsRef.current.length > 120) {
      trailsRef.current = trailsRef.current.slice(-120)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(2,8,24,0.92)'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(99,102,241,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Axis labels
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillStyle = 'rgba(99,102,241,0.5)'
      ctx.textAlign = 'center'
      ctx.fillText('← PITCH →', W / 2, H - 8)
      ctx.save()
      ctx.translate(12, H / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('← VOL →', 0, 0)
      ctx.restore()

      // Draw trails
      trailsRef.current.forEach((pt, i) => {
        const colors = ['rgba(6,182,212,', 'rgba(168,85,247,']
        const alpha = (i / trailsRef.current.length) * 0.5
        ctx.fillStyle = colors[pt.hand % 2] + alpha + ')'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw current hand positions
      hands.forEach((hand, hi) => {
        const hx = hand.x * W
        const hy = hand.y * H
        const colors = ['#06b6d4', '#a855f7']
        const col = colors[hi % 2]

        ctx.shadowColor = col
        ctx.shadowBlur = 20
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(hx, hy, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = col + '66'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, H); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(0, hy); ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.font = '500 10px "JetBrains Mono", monospace'
        ctx.fillStyle = col
        ctx.textAlign = 'center'
        ctx.fillText(hand.label, hx, hy - 14)
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [hands, pitch, volume])

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Move className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-slate-200">XY Control Map</span>
        <span className="ml-auto text-xs font-mono text-slate-500">Pitch × Volume</span>
      </div>

      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 160 }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          className="w-full h-full object-cover"
          style={{ borderRadius: 12 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card-dark p-2 rounded-xl text-center">
          <p className="text-xs text-slate-500">X → Pitch</p>
          <p className="font-mono text-sm text-cyan-400">{Math.round(pitch * 100)}%</p>
        </div>
        <div className="glass-card-dark p-2 rounded-xl text-center">
          <p className="text-xs text-slate-500">Y → Volume</p>
          <p className="font-mono text-sm text-violet-400">{Math.round(volume * 100)}%</p>
        </div>
      </div>
    </div>
  )
}
