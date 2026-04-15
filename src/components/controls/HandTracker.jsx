import { motion } from 'framer-motion'
import { Hand } from 'lucide-react'

const GESTURE_ICONS = {
  Pinch: '👌', Palm: '✋', Fist: '✊',
  Peace: '✌️', 'Thumbs Up': '👍', 'Thumbs Down': '👎', Idle: '🖐️',
}

export function HandTracker({ hands }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Hand className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-slate-200">Hand Tracking</span>
        <span className="ml-auto text-xs font-mono text-slate-500">{hands.length} detected</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map(i => {
          const hand = hands[i]
          const colors = ['#06b6d4', '#a855f7']
          const col = colors[i]
          const labels = ['Right Hand', 'Left Hand']

          return (
            <motion.div
              key={i}
              className="rounded-xl p-3"
              style={{
                background: hand
                  ? `linear-gradient(135deg, ${col}15, ${col}08)`
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hand ? col + '44' : 'rgba(99,102,241,0.1)'}`,
                boxShadow: hand ? `0 0 15px ${col}22` : 'none',
              }}
              animate={{ opacity: hand ? 1 : 0.4 }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: col, boxShadow: hand ? `0 0 6px ${col}` : 'none' }}
                  animate={hand ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-semibold text-slate-300">{labels[i]}</span>
              </div>

              {hand ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{GESTURE_ICONS[hand.gesture] || '🖐️'}</span>
                    <span className="text-xs font-mono" style={{ color: col }}>
                      {hand.gesture}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono text-slate-500">
                    <span>x: {Math.round(hand.x * 100)}%</span>
                    <span>y: {Math.round(hand.y * 100)}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-10">
                  <span className="text-xs text-slate-600">Not detected</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
