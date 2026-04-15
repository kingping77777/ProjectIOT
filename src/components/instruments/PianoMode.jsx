import { motion, AnimatePresence } from 'framer-motion'

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
const NOTE_COLORS = [
  '#06b6d4', '#00d4ff', '#8b5cf6', '#a855f7',
  '#06b6d4', '#4ade80', '#f472b6',
]

export function PianoMode({ activeNote, pitch, volume }) {
  const activeIdx = activeNote ? NOTES.indexOf(activeNote) : -1

  return (
    <div className="flex flex-col gap-3">
      {/* Note zones */}
      <div className="relative">
        <div className="flex rounded-xl overflow-hidden" style={{ height: 72 }}>
          {NOTES.map((note, i) => {
            const isActive = activeIdx === i
            return (
              <motion.div
                key={note}
                className={`piano-key flex-1 flex flex-col items-center justify-end pb-2 relative`}
                style={{
                  background: isActive
                    ? `linear-gradient(180deg, ${NOTE_COLORS[i]}cc, ${NOTE_COLORS[i]}66)`
                    : `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
                  borderRight: i < 6 ? '1px solid rgba(99,102,241,0.2)' : 'none',
                  boxShadow: isActive ? `0 0 20px ${NOTE_COLORS[i]}88, inset 0 0 10px ${NOTE_COLORS[i]}33` : 'none',
                  transition: 'all 0.08s ease',
                }}
                animate={isActive ? { y: [0, -2, 0] } : { y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-none"
                    style={{ background: `radial-gradient(circle, ${NOTE_COLORS[i]}44 0%, transparent 70%)` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.6] }}
                  />
                )}
                <span className={`font-mono text-xs font-semibold z-10 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {note}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Pitch indicator cursor */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent, #06b6d4, transparent)',
            boxShadow: '0 0 8px #06b6d4',
            left: 0,
          }}
          animate={{ left: `calc(${pitch * 100}% - 1px)` }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        />
      </div>

      {/* Velocity indicator */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500">VEL</span>
        <div className="flex-1 h-2 rounded-full bg-slate-800/60 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
            animate={{ width: `${Math.round(volume * 100)}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          />
        </div>
        <span className="text-xs font-mono text-cyan-400 w-8 text-right">
          {Math.round(volume * 127)}
        </span>
      </div>

      {/* Active note display */}
      <AnimatePresence>
        {activeNote && (
          <motion.div
            key={activeNote}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-3 py-2 rounded-xl"
            style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            <motion.span
              className="font-black text-3xl neon-text-cyan"
              animate={{ textShadow: ['0 0 10px #06b6d4', '0 0 20px #06b6d4', '0 0 10px #06b6d4'] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {activeNote}
            </motion.span>
            <div className="text-slate-500 text-xs">
              <p>MIDI: {36 + NOTES.indexOf(activeNote) + 24}</p>
              <p>Vel: {Math.round(volume * 127)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
