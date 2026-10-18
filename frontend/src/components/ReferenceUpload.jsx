import { CircleNotch, FileText, Paperclip, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { extractFile } from '../api'

const ACCEPT = '.pdf,.docx,.txt'
const MAX_BYTES = 10 * 1024 * 1024

export default function ReferenceUpload({ reference, onChange }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  async function handle(file) {
    if (!file) return
    setError('')
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) return setError('That file type won’t work. Use a PDF, DOCX or TXT.')
    if (file.size > MAX_BYTES) return setError('That file is over 10 MB. Try a shorter set of notes.')
    setBusy(true)
    try {
      const res = await extractFile(file)
      onChange({ filename: res.filename, pages: res.pages, chars: res.chars, text: res.text, truncated: res.truncated })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="mt-6">
      <p className="mb-2 font-display text-[15px] font-semibold">
        Got notes? <span className="font-sans font-normal text-ink-soft">I’ll check you against them. Optional.</span>
      </p>
      <AnimatePresence mode="wait" initial={false}>
        {reference ? (
          <motion.div
            key="chip"
            initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className="relative flex items-center gap-3 rounded-2xl border-2 border-ink bg-sticky-50 px-4 py-3 shadow-chunky-sm"
          >
            <Paperclip className="absolute -top-3 left-5 size-7 -rotate-12 text-ink" weight="bold" aria-hidden />
            <FileText className="size-6 shrink-0 text-sticky-700" weight="duotone" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{reference.filename}</p>
              <p className="text-sm text-ink-soft">
                Notes loaded{reference.pages ? `, ${reference.pages} page${reference.pages === 1 ? '' : 's'}` : ''}
                {reference.truncated && ' (I read the first part)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove notes"
              className="press grid size-9 place-items-center rounded-xl border-2 border-transparent text-ink-soft hover:border-ink hover:bg-white hover:text-ink focus-ring"
            >
              <X className="size-4" weight="bold" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="drop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: drag ? 1.02 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.3 }}
            disabled={busy}
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              handle(e.dataTransfer.files?.[0])
            }}
            className={`flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-5 text-[15px] font-semibold
              transition-colors duration-150 focus-ring
              ${drag ? 'border-pen bg-pen-50 text-pen-dark' : 'border-ink/30 bg-white/70 text-ink-soft hover:border-ink hover:text-ink'}`}
          >
            {busy ? (
              <CircleNotch className="size-5 animate-spin" weight="bold" aria-hidden />
            ) : (
              <Paperclip className="size-5" weight="bold" aria-hidden />
            )}
            {busy ? 'Reading your notes…' : drag ? 'Drop it here' : 'Drop a PDF, DOCX or TXT, or click to choose'}
          </motion.button>
        )}
      </AnimatePresence>
      <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {error && <p className="mt-2 text-sm font-semibold text-redpen-700">{error}</p>}
    </div>
  )
}
