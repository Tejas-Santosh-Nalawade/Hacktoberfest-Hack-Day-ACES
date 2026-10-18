import { Check } from '@phosphor-icons/react'
import { motion } from 'motion/react'

const STEPS = ['Topic', 'Teach', 'Review']

export default function Stepper({ current }) {
  return (
    <ol className="flex shrink-0 items-center gap-1 self-start rounded-full border-2 border-ink bg-white p-1 lg:self-center" aria-label="Progress">
      {STEPS.map((label, i) => {
        const active = i === current
        const done = i < current
        return (
          <li key={label} className="relative" aria-current={active ? 'step' : undefined}>
            {active && (
              <motion.span
                layoutId="step-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
              />
            )}
            <span
              className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-colors duration-200
                ${active ? 'text-white' : done ? 'text-tick-700' : 'text-ink-faint'}`}
            >
              {done ? <Check className="size-3.5" weight="bold" aria-hidden /> : <span aria-hidden>{i + 1}</span>}
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
