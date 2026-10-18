import { AnimatePresence, motion } from 'motion/react'
import { FileText, Loader2, Upload, X } from 'lucide-react'
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
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) return setError('Upload a PDF, DOCX or TXT file.')
    if (file.size > MAX_BYTES) return setError('That file is larger than 10 MB.')
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
    <div className="mt-4">
      <p className="mb-1.5 text-sm font-medium text-zinc-900">
        Your notes <span className="font-normal text-zinc-400">— optional</span>
      </p>
      <AnimatePresence mode="wait" initial={false}>
        {reference ? (
          <motion.div
            key="chip"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5"
          >
            <FileText className="size-4 shrink-0 text-indigo-600" aria-hidden />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-zinc-900">{reference.filename}</p>
              <p className="text-xs text-zinc-500">
                Notes loaded · {reference.pages ? `${reference.pages} page${reference.pages === 1 ? '' : 's'} · ` : ''}
                {reference.chars.toLocaleString()} chars{reference.truncated && ' (trimmed)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove notes"
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="drop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
              ${drag ? 'border-indigo-400 bg-indigo-50/60 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'}`}
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
            {busy ? 'Reading your notes…' : 'Drop a PDF, DOCX or TXT — or click to browse'}
          </motion.button>
        )}
      </AnimatePresence>
      <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  )
}
