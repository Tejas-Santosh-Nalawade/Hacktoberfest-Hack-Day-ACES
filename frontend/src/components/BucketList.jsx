import { motion } from 'motion/react'

// Each bucket borrows a school supply: green tick, highlighter, red pen, sticky note.
const meta = {
  correct: { title: 'Got it right', icon: '✓', chip: 'bg-tick-500 text-white', panel: 'bg-white' },
  partial: { title: 'Almost there', icon: '½', chip: 'bg-hi-300 text-ink', panel: 'bg-white' },
  wrong: { title: 'Needs fixing', icon: '✗', chip: 'bg-redpen-500 text-white', panel: 'bg-white' },
  missed: { title: 'You skipped', icon: '?', chip: 'bg-sticky-200 text-ink', panel: 'bg-sticky-50' },
}

const list = (delay) => ({ animate: { transition: { staggerChildren: 0.07, delayChildren: delay } } })
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } },
}

function Tick({ delay }) {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-6 shrink-0" aria-hidden>
      <motion.path
        d="M4 13 L10 19 L20 5"
        fill="none"
        stroke="var(--color-tick-500)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  )
}

function Highlight({ children, delay }) {
  return (
    <motion.span
      className="box-decoration-clone rounded-sm bg-no-repeat px-0.5"
      style={{ backgroundImage: 'linear-gradient(var(--color-hi-300), var(--color-hi-300))' }}
      initial={{ backgroundSize: '0% 100%' }}
      animate={{ backgroundSize: '100% 100%' }}
      transition={{ duration: 0.5, delay, ease: [0.77, 0, 0.175, 1] }}
    >
      {children}
    </motion.span>
  )
}

// A red-pen line drawn through the words; background-based so it follows wrapped lines.
function Strike({ children, delay }) {
  return (
    <motion.del
      className="box-decoration-clone bg-no-repeat text-ink-soft no-underline"
      style={{
        textDecoration: 'none',
        backgroundImage: 'linear-gradient(var(--color-redpen-500), var(--color-redpen-500))',
        backgroundPosition: '0 58%',
      }}
      initial={{ backgroundSize: '0% 2.5px' }}
      animate={{ backgroundSize: '100% 2.5px' }}
      transition={{ duration: 0.45, delay, ease: [0.77, 0, 0.175, 1] }}
    >
      {children}
    </motion.del>
  )
}

function Row({ kind, it, delay }) {
  if (kind === 'correct')
    return (
      <div className="flex gap-2.5">
        <Tick delay={delay} />
        <div>
          <p className="font-bold">{it.concept}</p>
          <p className="text-[15px] text-ink-soft">{it.note}</p>
        </div>
      </div>
    )

  if (kind === 'partial')
    return (
      <div>
        <p className="font-bold">{it.concept}</p>
        <p className="mt-1 text-[15px]">
          <span className="text-ink-soft">You said </span>
          <Highlight delay={delay}>“{it.what_was_said}”</Highlight>
        </p>
        <p className="mt-1 font-hand text-[1.35rem] leading-snug text-pen-dark">{it.fix}</p>
      </div>
    )

  if (kind === 'wrong')
    return (
      <div>
        <p className="font-bold">{it.concept}</p>
        <p className="mt-1 text-[15px]">
          <Strike delay={delay}>“{it.what_was_said}”</Strike>
        </p>
        <motion.p
          className="mt-1 font-hand text-[1.4rem] leading-snug text-redpen-700"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.35 }}
        >
          {it.correct_version}
        </motion.p>
      </div>
    )

  return (
    <div>
      <p className="font-display font-semibold">{it.concept}</p>
      <p className="mt-0.5 text-[15px] text-ink-soft">{it.why_it_matters}</p>
    </div>
  )
}

export default function BucketList({ kind, items, delay = 0 }) {
  const m = meta[kind]
  const sticky = kind === 'missed'
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', duration: 0.45, bounce: 0.2, delay }}
      className={`rounded-3xl border-2 border-ink p-4 sm:p-5 ${m.panel}`}
    >
      <h3 className="mb-3 flex items-center gap-2.5 text-[17px]">
        <span className={`grid size-7 place-items-center rounded-full border-2 border-ink text-sm font-bold ${m.chip}`} aria-hidden>
          {m.icon}
        </span>
        {m.title}
        <span className="ml-auto rounded-full bg-ink/5 px-2 text-sm tabular-nums text-ink-soft">{items.length}</span>
      </h3>

      {items.length === 0 ? (
        <p className="font-hand text-[1.4rem] text-ink-faint">None 🎉</p>
      ) : (
        <motion.ul variants={list(delay + 0.1)} initial="initial" animate="animate" className={sticky ? 'grid gap-3' : 'space-y-4'}>
          {items.map((it, i) => (
            <motion.li
              key={i}
              variants={item}
              className={
                sticky
                  ? `rounded-md border border-sticky-200 bg-sticky-200/70 px-3.5 py-3 shadow-sticky ${i % 2 ? 'rotate-1' : '-rotate-1'}`
                  : ''
              }
            >
              <Row kind={kind} it={it} delay={delay + 0.2 + i * 0.07} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.section>
  )
}
