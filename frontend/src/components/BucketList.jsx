import { motion } from 'motion/react'
import { stagger, staggerItem } from './ui/motion'

const tones = {
  correct: { box: 'bg-emerald-50/60 border-emerald-500', label: 'text-emerald-700' },
  partial: { box: 'bg-amber-50/60 border-amber-500', label: 'text-amber-700' },
  wrong: { box: 'bg-rose-50/60 border-rose-500', label: 'text-rose-700' },
  missed: { box: 'bg-sky-50/60 border-sky-500', label: 'text-sky-700' },
}

function Item({ kind, item }) {
  if (kind === 'correct') return <p>{item.note}</p>
  if (kind === 'missed') return <p>{item.why_it_matters}</p>
  return (
    <div className="space-y-1">
      <p className="text-zinc-500">
        <span className="text-zinc-400">You said:</span> “{item.what_was_said}”
      </p>
      <p>
        <span className="font-medium text-zinc-900">{kind === 'wrong' ? 'Actually: ' : 'Fix: '}</span>
        {kind === 'wrong' ? item.correct_version : item.fix}
      </p>
    </div>
  )
}

export default function BucketList({ kind, title, items }) {
  const t = tones[kind]
  return (
    <section className={`rounded-lg border-l-4 px-4 py-3 ${t.box}`}>
      <h3 className={`mb-2 flex items-center justify-between text-sm ${t.label}`}>
        {title}
        <span className="font-mono text-xs font-medium opacity-70">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">None 🎉</p>
      ) : (
        <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {items.map((item, i) => (
            <motion.li key={i} variants={staggerItem} className="text-sm leading-relaxed text-zinc-600">
              <p className="font-medium text-zinc-900">{item.concept}</p>
              <Item kind={kind} item={item} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  )
}
