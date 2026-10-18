import { motion } from 'motion/react'
import { fadeUp } from './motion'

export default function Card({ step, title, action, className = '', children }) {
  return (
    <motion.section
      {...fadeUp}
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-soft sm:p-6 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-base">
            {step && (
              <span className="grid size-6 place-items-center rounded-full bg-zinc-100 font-mono text-xs text-zinc-600">
                {step}
              </span>
            )}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  )
}
