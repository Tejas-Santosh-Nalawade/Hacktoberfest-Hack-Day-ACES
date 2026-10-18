import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { scoreTone } from './Badge'

const stroke = { emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e' }

export default function ScoreRing({ score = 0, size = 96 }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? score : 0)
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r

  useEffect(() => {
    if (reduce) {
      setShown(score)
      return
    }
    const controls = animate(0, score, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [score, reduce])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth="8" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke[scoreTone(score)]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-2xl text-zinc-900">{shown}</span>
      </div>
    </div>
  )
}
