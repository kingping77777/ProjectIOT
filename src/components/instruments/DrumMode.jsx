import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DRUMS = [
  { id: 'kick', label: 'Kick', icon: '🥁', color: '#ef4444', midi: 36 },
  { id: 'snare', label: 'Snare', icon: '🪘', color: '#f59e0b', midi: 38 },
  { id: 'hihat', label: 'Hi-Hat', icon: '🎵', color: '#06b6d4', midi: 42 },
  { id: 'clap', label: 'Clap', icon: '👏', color: '#8b5cf6', midi: 39 },
  { id: 'tom', label: 'Tom', icon: '🔊', color: '#f472b6', midi: 45 },
  { id: 'crash', label: 'Crash', icon: '✨', color: '#4ade80', midi: 49 },
]

export function DrumMode({ gesture, pitch }) {
  const [hitPad, setHitPad] = useState(null)
  const [particles, setParticles] = useState([])

  // Simulate drum trigger from pinch gesture
  useEffect(() => {
    if (gesture === 'Pinch') {
      // map pitch (0-1) to drum zone (0-5)
      const idx = Math.min(5, Math.floor(pitch * 6))
      const drum = DRUMS[idx]
      setHitPad(drum.id)
      setParticles(prev => [
        ...prev,
        { id: Date.now(), drumId: drum.id, color: drum.color },
      ])
      const t = setTimeout(() => setHitPad(null), 120)
      return () => clearTimeout(t)
    }
  }, [gesture, pitch])

  // Clean particles
  useEffect(() => {
    if (particles.length > 0) {
      const t = setTimeout(() => setParticles(p => p.slice(1)), 600)
      return () => clearTimeout(t)
    }
  }, [particles])

  const triggerDrum = (drumId) => {
    setHitPad(drumId)
    setTimeout(() => setHitPad(null), 120)
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {DRUMS.map((drum, i) => {
        const isHit = hitPad === drum.id
        return (
          <motion.button
            key={drum.id}
            onClick={() => triggerDrum(drum.id)}
            className={`drum-pad relative rounded-xl flex flex-col items-center justify-center py-4 gap-1 overflow-hidden ${isHit ? 'active' : ''}`}
            style={{
              background: isHit
                ? `linear-gradient(135deg, ${drum.color}44, ${drum.color}22)`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isHit ? drum.color + 'aa' : 'rgba(99,102,241,0.15)'}`,
              boxShadow: isHit ? `0 0 25px ${drum.color}66, inset 0 0 15px ${drum.color}22` : 'none',
              transform: isHit ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.08s cubic-bezier(0.4,0,0.2,1)',
            }}
            whileHover={{ scale: isHit ? 0.95 : 1.03 }}
            whileTap={{ scale: 0.92 }}
          >
            {/* Ripple on hit */}
            <AnimatePresence>
              {isHit && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: `2px solid ${drum.color}` }}
                  initial={{ opacity: 1, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            <motion.span
              className="text-2xl"
              animate={isHit ? { scale: [1, 1.3, 1], rotate: [-5, 5, 0] } : {}}
              transition={{ duration: 0.15 }}
            >
              {drum.icon}
            </motion.span>
            <span className="text-xs font-semibold text-slate-300">{drum.label}</span>
            <span className="text-xs font-mono" style={{ color: drum.color + 'aa' }}>
              MIDI {drum.midi}
            </span>

            {/* Corner accent */}
            <div
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{
                background: drum.color,
                boxShadow: isHit ? `0 0 6px ${drum.color}` : 'none',
                opacity: isHit ? 1 : 0.4,
              }}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
