import { motion } from 'framer-motion'
import { Activity, Wifi, Clock, Zap } from 'lucide-react'

export function Header({ fps, latency, systemActive }) {
  return (
    <header className="relative z-50 w-full">
      <div className="glass-card mx-4 mt-4 px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                boxShadow: '0 0 20px rgba(6,182,212,0.5)',
              }}
              animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.5)', '0 0 30px rgba(139,92,246,0.7)', '0 0 20px rgba(6,182,212,0.5)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white font-black text-sm">FF</span>
            </motion.div>
          </div>
          <div>
            <h1 className="gradient-text font-black text-xl tracking-tight">FigureFlow</h1>
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">Gesture Music System</p>
          </div>
        </motion.div>

        {/* Status Indicators */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* System Active */}
          <div className="flex items-center gap-2 glass-card-dark px-3 py-1.5">
            <motion.div
              className={`status-dot ${systemActive ? 'active' : 'inactive'}`}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-slate-300">
              {systemActive ? 'SYSTEM ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* FPS */}
          <div className="flex items-center gap-1.5 glass-card-dark px-3 py-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">{fps} FPS</span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1.5 glass-card-dark px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-mono text-violet-400">{latency}ms</span>
          </div>

          {/* Connection */}
          <div className="flex items-center gap-1.5 glass-card-dark px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-neon-green" style={{ color: '#4ade80' }} />
            <span className="text-xs font-mono" style={{ color: '#4ade80' }}>Pi4 Connected</span>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
