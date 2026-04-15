import { motion } from 'framer-motion'
import { Music, Drum } from 'lucide-react'

export function ModeSwitch({ mode, onSetMode }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(99,102,241,0.2)' }}>
      {[
        { id: 'piano', icon: '🎹', label: 'Piano' },
        { id: 'drums', icon: '🥁', label: 'Drums' },
      ].map(({ id, icon, label }) => (
        <motion.button
          key={id}
          onClick={() => onSetMode(id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-colors relative overflow-hidden"
          style={{
            color: mode === id ? 'white' : 'rgba(148,163,184,0.8)',
          }}
        >
          {mode === id && (
            <motion.div
              layoutId="modeIndicator"
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.2))',
                border: '1px solid rgba(6,182,212,0.4)',
                boxShadow: '0 0 15px rgba(6,182,212,0.2)',
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10 text-base">{icon}</span>
          <span className="relative z-10">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
