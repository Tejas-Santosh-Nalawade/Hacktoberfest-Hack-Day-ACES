import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'

// Buddy: the listener. Mood drives face + body; `level` (0–1 motion value)
// makes the mouth and body follow the student's voice while listening.

const look = {
  thinking: { x: 3, y: -4 },
  listening: { x: 0, y: 1 },
}

const bodyMotion = {
  idle: { animate: { y: [0, -3, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  listening: { animate: { rotate: [-3, 3, -3] }, transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  thinking: { animate: { rotate: [-4, 4] }, transition: { duration: 1.1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
  happy: { animate: { y: [0, -18, 0, -8, 0] }, transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1], repeat: Infinity, repeatDelay: 2.2 } },
  proud: { animate: { y: [0, -6, 0] }, transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2.5 } },
  encouraging: { animate: { rotate: [0, -6, 6, -3, 0] }, transition: { duration: 0.9, repeat: Infinity, repeatDelay: 3 } },
}

function Mouth({ mood, level }) {
  const ry = useTransform(level, [0, 1], [2.5, 11])
  if (mood === 'listening') return <motion.ellipse cx="60" cy="78" rx="8" style={{ ry }} fill="var(--color-ink)" />
  if (mood === 'happy')
    return (
      <g>
        <path d="M43 72 Q60 96 77 72 Z" fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M52 84 Q60 90 68 84 Q60 80 52 84Z" fill="#ff7a8a" />
      </g>
    )
  if (mood === 'thinking') return <ellipse cx="67" cy="79" rx="4.5" ry="4" fill="var(--color-ink)" />
  if (mood === 'encouraging') return <path d="M50 78 Q60 84 70 78" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
  return <path d="M47 74 Q60 86 73 74" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
}

export function BuddyFace({ mood = 'idle', level, size = 112, className = '' }) {
  const fallback = useMotionValue(0)
  const lvl = level ?? fallback
  const scale = useTransform(lvl, [0, 1], [1, 1.08])
  const eye = look[mood] ?? { x: 0, y: 0 }
  const body = bodyMotion[mood] ?? bodyMotion.idle

  return (
    <motion.div style={{ width: size, height: size, scale }} className={`shrink-0 ${className}`} aria-hidden>
      <motion.svg key={mood} viewBox="0 0 120 120" width={size} height={size} style={{ originY: 1 }} {...body} className="overflow-visible">
        {/* cowlick */}
        <path d="M58 12 C54 2 66 0 64 9" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
        {/* body */}
        <path
          d="M60 10 C90 10 111 30 111 60 C111 92 88 112 60 112 C32 112 9 92 9 60 C9 30 30 10 60 10Z"
          fill="var(--color-sun)"
          stroke="var(--color-ink)"
          strokeWidth="4"
        />
        {/* cheeks */}
        <ellipse cx="30" cy="70" rx="8" ry="5" fill="#ff9db0" opacity="0.65" />
        <ellipse cx="90" cy="70" rx="8" ry="5" fill="#ff9db0" opacity="0.65" />
        {/* eyes: blink + look */}
        <motion.g animate={{ x: eye.x, y: eye.y }} transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}>
          <motion.g
            animate={mood === 'happy' ? { scaleY: 1 } : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
            style={{ transformBox: 'fill-box', originY: 0.5 }}
          >
            {mood === 'happy' ? (
              <>
                <path d="M36 54 Q43 44 50 54" fill="none" stroke="var(--color-ink)" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M70 54 Q77 44 84 54" fill="none" stroke="var(--color-ink)" strokeWidth="4.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="43" cy="52" rx="6.5" ry="8.5" fill="var(--color-ink)" />
                <ellipse cx="77" cy="52" rx="6.5" ry="8.5" fill="var(--color-ink)" />
                <circle cx="45.5" cy="48.5" r="2.2" fill="#fff" />
                <circle cx="79.5" cy="48.5" r="2.2" fill="#fff" />
              </>
            )}
          </motion.g>
        </motion.g>
        <Mouth mood={mood} level={lvl} />
      </motion.svg>
    </motion.div>
  )
}

function ThinkingDots() {
  return (
    <span className="ml-1 inline-flex gap-1 align-middle" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-ink"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  )
}

export default function BuddyStage({ mood, line, level, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border-2 border-ink bg-sun-50 p-4 shadow-chunky sm:p-5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <BuddyFace mood={mood} level={level} size={96} className="sm:hidden" />
        <BuddyFace mood={mood} level={level} size={116} className="hidden sm:block" />
        <div className="relative min-w-0 flex-1 rounded-[22px] border-2 border-ink bg-white px-4 py-3 shadow-chunky-sm sm:px-5">
          {/* bubble tail */}
          <span className="absolute -left-[9px] top-1/2 size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-ink bg-white" aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(2px)' }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative font-hand text-[1.6rem] leading-[1.15] text-ink sm:text-[1.8rem]"
              aria-live="polite"
            >
              {line}
              {mood === 'thinking' && <ThinkingDots />}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      {children}
    </div>
  )
}
