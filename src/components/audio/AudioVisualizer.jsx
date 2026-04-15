import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2 } from 'lucide-react'

export function AudioVisualizer({ gesture, volume, pitch, handCount, activeNote }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const orbRadiusRef = useRef(60)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    // Spawn particles on note
    if (activeNote) {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: W / 2 + (pitch - 0.5) * W * 0.6,
          y: H / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color: `hsl(${180 + pitch * 120}, 80%, 60%)`,
          size: 2 + Math.random() * 4,
        })
      }
    }

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      // Dark background
      ctx.fillStyle = 'rgba(2,8,24,0.92)'
      ctx.fillRect(0, 0, W, H)

      const time = frame * 0.03
      const vol = volume || 0.3
      const targetR = 40 + vol * 60 + handCount * 10
      orbRadiusRef.current += (targetR - orbRadiusRef.current) * 0.05

      const orbR = orbRadiusRef.current
      const cx = W / 2 + (pitch - 0.5) * 40
      const cy = H / 2

      // Frequency bars (behind orb)
      const bars = 64
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        const noise = Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5
        const barH = 10 + noise * vol * 60 + Math.sin(time + i) * 10
        const x1 = cx + Math.cos(angle) * (orbR + 8)
        const y1 = cy + Math.sin(angle) * (orbR + 8)
        const x2 = cx + Math.cos(angle) * (orbR + 8 + barH)
        const y2 = cy + Math.sin(angle) * (orbR + 8 + barH)

        const hue = 180 + pitch * 120 + i * 2
        ctx.strokeStyle = `hsla(${hue},80%,60%,${0.4 + noise * 0.4})`
        ctx.lineWidth = 2
        ctx.shadowColor = `hsla(${hue},80%,60%,0.8)`
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Outer glow rings
      for (let ring = 3; ring >= 1; ring--) {
        const rr = orbR + ring * 20
        const alpha = 0.06 / ring
        const grad = ctx.createRadialGradient(cx, cy, rr - 15, cx, cy, rr + 15)
        grad.addColorStop(0, `rgba(6,182,212,${alpha * 2})`)
        grad.addColorStop(1, 'rgba(6,182,212,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, rr + 15, 0, Math.PI * 2)
        ctx.fill()
      }

      // Orb gradient fill
      const orbGrad = ctx.createRadialGradient(cx - orbR * 0.3, cy - orbR * 0.3, 0, cx, cy, orbR)
      const hue = 180 + pitch * 120
      orbGrad.addColorStop(0, `hsla(${hue + 40},80%,80%,0.95)`)
      orbGrad.addColorStop(0.5, `hsla(${hue},70%,55%,0.85)`)
      orbGrad.addColorStop(1, `hsla(${hue - 60},80%,30%,0.9)`)
      ctx.shadowColor = `hsla(${hue},80%,60%,0.8)`
      ctx.shadowBlur = 40
      ctx.fillStyle = orbGrad
      ctx.beginPath()
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Orb shimmer highlight
      const shimmer = ctx.createRadialGradient(cx - orbR * 0.35, cy - orbR * 0.35, 0, cx - orbR * 0.2, cy - orbR * 0.2, orbR * 0.6)
      shimmer.addColorStop(0, 'rgba(255,255,255,0.35)')
      shimmer.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = shimmer
      ctx.beginPath()
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2)
      ctx.fill()

      // Waveform at bottom
      ctx.strokeStyle = `hsla(${hue},70%,60%,0.5)`
      ctx.lineWidth = 2
      ctx.beginPath()
      const wY = H - 30
      for (let x = 0; x < W; x++) {
        const t = (x / W) * Math.PI * 6
        const amp = 8 + vol * 20
        const y = wY + Math.sin(t + time * 3) * amp * Math.sin(t * 0.5)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.05
        p.life -= 0.03
        ctx.globalAlpha = p.life
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [volume, pitch, handCount, activeNote, gesture])

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Audio Visualizer</span>
        </div>
        <div className="flex items-center gap-2 glass-card-dark px-2 py-1">
          <Volume2 className="w-3 h-3 text-cyan-400" />
          <div className="w-16 h-1.5 rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)' }}
              animate={{ width: `${Math.round(volume * 100)}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 220 }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={260}
          className="w-full h-full object-cover"
          style={{ borderRadius: 12 }}
        />
      </div>

      {activeNote && (
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <span className="font-mono text-xs text-slate-500">PLAYING</span>
          <motion.span
            className="font-black text-2xl neon-text-cyan"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            {activeNote}
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}
