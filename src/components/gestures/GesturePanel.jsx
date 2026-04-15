import { motion } from 'framer-motion'

const GESTURES = [
  { id: 'Pinch', icon: '👌', label: 'Pinch', action: 'Play Note', color: '#06b6d4', desc: 'Trigger MIDI note on' },
  { id: 'Palm', icon: '✋', label: 'Open Palm', action: 'Mute / Stop', color: '#f472b6', desc: 'Silence all output' },
  { id: 'Fist', icon: '✊', label: 'Fist', action: 'Record Loop', color: '#ef4444', desc: 'Start loop recording' },
  { id: 'Peace', icon: '✌️', label: 'Peace', action: 'Calibrate', color: '#4ade80', desc: 'Re-run calibration' },
  { id: 'Thumbs Up', icon: '👍', label: 'Thumbs Up', action: 'Next Preset', color: '#f59e0b', desc: 'Cycle sound preset +1' },
  { id: 'Thumbs Down', icon: '👎', label: 'Thumbs Down', action: 'Prev Preset', color: '#8b5cf6', desc: 'Cycle sound preset -1' },
]

export function GesturePanel({ activeGesture }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">Gesture Controls</span>
        <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          6 gestures
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {GESTURES.map((g, i) => {
          const isActive = activeGesture === g.id
          return (
            <motion.div
              key={g.id}
              className={`gesture-card rounded-xl p-3 cursor-default ${isActive ? 'active' : ''}`}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${g.color}22, ${g.color}11)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? g.color + '88' : 'rgba(99,102,241,0.15)'}`,
                boxShadow: isActive ? `0 0 20px ${g.color}44` : 'none',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-2">
                <motion.span
                  className="text-2xl flex-none"
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, repeat: isActive ? Infinity : 0 }}
                >
                  {g.icon}
                </motion.span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{g.label}</p>
                  <p className="text-xs font-mono" style={{ color: g.color }}>
                    {g.action}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight hidden xl:block">{g.desc}</p>
                </div>
              </div>
              {isActive && (
                <motion.div
                  className="mt-1.5 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${g.color}, transparent)` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
