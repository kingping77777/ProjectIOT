import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Radio } from 'lucide-react'
import { Header } from './components/layout/Header'
import { CameraFeed } from './components/camera/CameraFeed'
import { AudioVisualizer } from './components/audio/AudioVisualizer'
import { SoundEnginePanel } from './components/audio/SoundEnginePanel'
import { GesturePanel } from './components/gestures/GesturePanel'
import { PianoMode } from './components/instruments/PianoMode'
import { DrumMode } from './components/instruments/DrumMode'
import { ModeSwitch } from './components/instruments/ModeSwitch'
import { XYPad } from './components/controls/XYPad'
import { HandTracker } from './components/controls/HandTracker'

import { useBackend } from './hooks/useBackend'

const WS_STATUS_COLORS = {
  connected:    { bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.4)',  text: '#4ade80' },
  connecting:   { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.4)',  text: '#fbbf24' },
  disconnected: { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.3)',   text: '#f87171' },
  error:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.5)',   text: '#ef4444' },
}

// ── Connection settings panel ──────────────────────────────────────
function ConnectionPanel({ wsUrl, setWsUrl, mode, onToggleMode, wsStatus }) {
  const col = WS_STATUS_COLORS[wsStatus] ?? WS_STATUS_COLORS.disconnected
  return (
    <motion.div
      className="glass-card mx-4 mt-2 px-4 py-2 flex items-center gap-3 flex-wrap"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* WS URL input */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Wifi className="w-3.5 h-3.5 text-slate-400 flex-none" />
        <input
          type="text"
          value={wsUrl}
          onChange={e => setWsUrl(e.target.value)}
          placeholder="ws://192.168.1.xx:5000"
          className="flex-1 min-w-0 text-xs font-mono bg-transparent text-slate-300 outline-none border-b border-slate-700 focus:border-cyan-500 transition-colors py-0.5"
          spellCheck={false}
        />
      </div>

      {/* WS status */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono flex-none"
        style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: col.text }}
          animate={wsStatus === 'connecting' ? { opacity: [1,0.3,1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        {wsStatus.toUpperCase()}
      </div>
    </motion.div>
  )
}

// ── Root App ───────────────────────────────────────────────────────
export default function App() {
  const [wsUrl, setWsUrl] = useState('ws://localhost:5000')

  const live = useBackend(wsUrl)
  const { handState, wsStatus, setMode, cyclePreset } = live

  const {
    hands, gesture, fps, latency, systemActive,
    activeNote, volume, pitch, preset, mode, handCount,
  } = handState

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid relative overflow-hidden">
      {/* Ambient globs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', top: '10%', left: '5%' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '10%', right: '5%' }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f472b6, transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Header */}
      <Header fps={fps} latency={latency} systemActive={systemActive} />

      {/* Connection bar */}
      <ConnectionPanel
        wsUrl={wsUrl}
        setWsUrl={setWsUrl}
        wsStatus={wsStatus ?? 'disconnected'}
      />

      {/* Main grid */}
      <main className="relative z-10 p-4 pt-3">
        <div className="max-w-[1600px] mx-auto">

          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-4 mb-4" style={{ minHeight: 380 }}>
            <motion.div className="col-span-12 lg:col-span-5"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <CameraFeed hands={hands} gesture={gesture} handCount={handCount} />
            </motion.div>
            <motion.div className="col-span-12 lg:col-span-4 flex flex-col"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AudioVisualizer gesture={gesture} volume={volume} pitch={pitch} handCount={handCount} activeNote={activeNote} />
            </motion.div>
            <motion.div className="col-span-12 lg:col-span-3 flex flex-col"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GesturePanel activeGesture={gesture} />
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-12 gap-4">
            <motion.div className="col-span-12 lg:col-span-6 glass-card p-4 flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-200">
                    {mode === 'piano' ? '🎹 Piano Mode' : '🥁 Drum Mode'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'piano' ? 'X-axis → note · Y-axis → velocity' : 'Pinch in zone → trigger drum'}
                  </p>
                </div>
                <ModeSwitch mode={mode} onSetMode={setMode} />
              </div>
              <AnimatePresence mode="wait">
                {mode === 'piano' ? (
                  <motion.div key="piano"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <PianoMode activeNote={activeNote} pitch={pitch} volume={volume} />
                  </motion.div>
                ) : (
                  <motion.div key="drums"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <DrumMode gesture={gesture} pitch={pitch} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="col-span-12 lg:col-span-3 flex flex-col"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <XYPad pitch={pitch} volume={volume} hands={hands} />
            </motion.div>

            <motion.div className="col-span-12 lg:col-span-3 flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <HandTracker hands={hands} />
              <SoundEnginePanel mode={mode} preset={preset} gesture={gesture} onCyclePreset={cyclePreset} />
            </motion.div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-700 font-mono">
              FigureFlow · MediaPipe Hands + FluidSynth · Raspberry Pi 4 (8GB)
              {` · Live: ${wsUrl}`}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
