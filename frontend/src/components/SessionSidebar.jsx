import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, NotebookPen, Trash2 } from 'lucide-react'
import Badge, { scoreTone } from './ui/Badge'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'

const time = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export default function SessionSidebar({ sessions, activeId, onOpen, onDelete, onDiary, onClear }) {
  return (
    <aside className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 md:sticky md:top-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm">Today's sessions</h2>
        <span className="font-mono text-xs text-zinc-400">{sessions.length}</span>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={BookOpen}>Your reviewed topics will show up here.</EmptyState>
      ) : (
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {sessions.map((s) => (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => onOpen(s)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 pr-9 text-left transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                    ${s.id === activeId ? 'border-indigo-200 bg-white shadow-soft' : 'border-transparent hover:border-zinc-200 hover:bg-white'}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{s.topic}</p>
                    <p className="font-mono text-xs text-zinc-400">{time(s.createdAt)}</p>
                  </div>
                  <Badge tone={scoreTone(s.score)} mono>
                    {s.score}
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  aria-label={`Delete ${s.topic}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition
                    hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                    md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Button className="mt-4 w-full" onClick={onDiary} disabled={sessions.length === 0}>
        <NotebookPen className="size-4" aria-hidden />
        Generate today's diary
      </Button>
      {sessions.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full rounded py-1 text-xs text-zinc-400 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          Clear today
        </button>
      )}
    </aside>
  )
}
