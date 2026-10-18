import { motion } from 'motion/react'
import { MIN_WORDS, wordCount } from '../lib/words'

// While listening, words are "written" onto the page one by one.
// When stopped, the same page becomes an editable textarea.
function LivePage({ value, interim }) {
  const words = value.trim() ? value.trim().split(/\s+/) : []
  return (
    <div className="min-h-[13rem] px-14 py-[14px] text-[17px] leading-[32px]" aria-live="polite">
      {words.length === 0 && !interim && <span className="text-ink-faint">Start talking. Your words will appear here.</span>}
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block whitespace-pre"
        >
          {w}{' '}
        </motion.span>
      ))}
      {interim && <span className="font-hand text-[1.4rem] text-pen">{interim}</span>}
    </div>
  )
}

export default function TranscriptBox({ value, interim, listening, onChange, onClear }) {
  const words = wordCount(value)
  const progress = Math.min(words / MIN_WORDS, 1)
  const ready = words >= MIN_WORDS

  return (
    <div className="mt-5">
      <div className="ruled overflow-hidden rounded-2xl border-2 border-ink">
        {listening ? (
          <LivePage value={value} interim={interim} />
        ) : (
          <>
            <label htmlFor="transcript" className="sr-only">
              Your explanation
            </label>
            <textarea
              id="transcript"
              name="transcript"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={6}
              autoComplete="off"
              placeholder="Or type your explanation here, the way you’d say it out loud…"
              className="relative block min-h-[13rem] w-full resize-y bg-transparent px-14 py-[14px] text-[17px] leading-[32px] text-ink
                placeholder:text-ink-faint focus:outline-none"
            />
          </>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-ink bg-white" aria-hidden>
          <motion.div
            className={`h-full origin-left ${ready ? 'bg-tick-500' : 'bg-pen'}`}
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
          />
        </div>
        <span className={`text-sm font-bold tabular-nums ${ready ? 'text-tick-700' : 'text-ink-soft'}`}>
          {words} {words === 1 ? 'word' : 'words'}
        </span>
        {value && !listening && (
          <button type="button" onClick={onClear} className="rounded-lg px-2 py-1 text-sm font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink focus-ring">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
