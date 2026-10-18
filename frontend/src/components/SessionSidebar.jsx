import { NotebookIcon, Trash } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { scoreTone, tones } from './ui/Badge'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'

const time = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export default function SessionSidebar({ sessions, activeId, onOpen, onDelete, onDiary, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false)
  useEffect(() => {
    if (!confirmClear) return
    const t = setTimeout(() => setConfirmClear(false), 3000)
    return () => clearTimeout(t)
  }, [confirmClear])

  const avg = sessions.length ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length) : null

  return (
    <aside className="rounded-[28px] border-2 border-ink bg-white p-4 shadow-chunky sm:p-5 md:sticky md:top-6" aria-label="Today's notebook">
      <h2 className="text-xl">Today’s notebook</h2>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-pen-50 px-3 py-2">
          <dt className="text-xs font-bold text-pen-dark">Topics</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{sessions.length}</dd>
        </div>
        <div className="rounded-2xl bg-sun-50 px-3 py-2">
          <dt className="text-xs font-bold text-hi-700">Average</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{avg ?? '–'}</dd>
        </div>
      </dl>

      <div className="mt-4">
        {sessions.length === 0 ? (
          <EmptyState icon={NotebookIcon}>Topics you teach today land here.</EmptyState>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {sessions.map((s) => (
                <motion.li
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                  className="group relative"
                >
                  <button
                    type="button"
                    onClick={() => onOpen(s)}
                    aria-current={s.id === activeId ? 'true' : undefined}
                    className={`press flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 pr-11 text-left focus-ring
                      ${s.id === activeId ? 'border-ink bg-pen-50 shadow-chunky-sm' : 'border-ink/15 bg-white hover:border-ink'}`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-[15px] font-bold tabular-nums ${tones[scoreTone(s.score)].fill}`}
                    >
                      {s.score}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{s.topic}</span>
                      <span className="block text-xs text-ink-soft">{time(s.createdAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    aria-label={`Delete ${s.topic}`}
                    className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-xl text-ink-faint transition-opacity duration-150
                      hover:bg-redpen-50 hover:text-redpen-700 focus-ring md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  >
                    <Trash className="size-4" weight="bold" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <Button variant="sun" className="mt-5 w-full" onClick={onDiary} disabled={sessions.length === 0}>
        <NotebookIcon className="size-5" weight="bold" aria-hidden />
        Write today’s diary
      </Button>
      {sessions.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (confirmClear) {
              setConfirmClear(false)
              onClear()
            } else setConfirmClear(true)
          }}
          className={`mt-2 w-full rounded-xl py-1.5 text-sm font-semibold focus-ring ${confirmClear ? 'bg-redpen-50 text-redpen-700' : 'text-ink-faint hover:text-redpen-700'}`}
        >
          {confirmClear ? 'Tap again to clear today' : 'Clear today'}
        </button>
      )}
    </aside>
  )
}
