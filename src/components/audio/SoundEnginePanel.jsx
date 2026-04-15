import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, ChevronLeft, ChevronRight } from 'lucide-react'

const PRESETS = ['Grand Piano', 'Strings Ensemble', 'Electric Guitar', 'Synth Pad', 'Flute', 'Bass Guitar', 'Vibraphone']

export function SoundEnginePanel({ mode, preset, gesture, onCyclePreset }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-slate-200">Sound Engine</span>
        <span className="text-xs text-slate-500 font-mono ml-auto">FluidSynth + SoundFont</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Mode */}
        <div className="glass-card-dark p-3 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">Current Mode</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{mode === 'piano' ? '🎹' : '🥁'}</span>
            <span className="font-semibold text-slate-200 capitalize">{mode}</span>
          </div>
        </div>

        {/* Preset */}
        <div className="glass-card-dark p-3 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">SoundFont Preset</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={preset}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-semibold text-sm text-cyan-300 truncate"
            >
              {PRESETS[preset]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Preset Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCyclePreset(-1)}
          className="flex-none w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-slate-500 mb-1">Change via gesture</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm">👍 Next</span>
            <span className="text-sm">👎 Prev</span>
          </div>
        </div>
        <button
          onClick={() => onCyclePreset(1)}
          className="flex-none w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Preset dots */}
      <div className="flex items-center justify-center gap-1.5">
        {PRESETS.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full transition-all"
            animate={{
              width: i === preset ? 16 : 6,
              height: 6,
              backgroundColor: i === preset ? '#06b6d4' : 'rgba(148,163,184,0.3)',
            }}
            transition={{ type: 'spring', damping: 20 }}
          />
        ))}
      </div>
    </div>
  )
}
