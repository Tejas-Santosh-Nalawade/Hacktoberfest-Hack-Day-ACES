import { ArrowCounterClockwise, ArrowLeft, DownloadSimple, Printer } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getReport } from '../api'
import { today } from '../storage'
import Button from './ui/Button'

function WritingLines() {
  return (
    <div className="space-y-5 py-4" role="status" aria-label="Writing your diary">
      {[0.55, 0.9, 0.8, 0.95, 0.6, 0.85].map((w, i) => (
        <motion.div
          key={i}
          className="h-3 origin-left rounded-full bg-pen/25"
          style={{ width: `${w * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1] }}
          transition={{ duration: 1.8, times: [0, 0.4, 1], delay: i * 0.25, repeat: Infinity, repeatDelay: 0.6 }}
        />
      ))}
    </div>
  )
}

export default function DiaryView({ sessions, onBack, onState }) {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const date = today()
  const pretty = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const generate = useCallback(async () => {
    setLoading(true)
    setError('')
    onState?.('writing')
    try {
      const res = await getReport({ date, reviews: sessions.map((s) => s.review) })
      setMarkdown(res.markdown)
      onState?.('done')
    } catch (e) {
      setError(e.message)
      onState?.('error')
    } finally {
      setLoading(false)
    }
  }, [date, sessions, onState])

  useEffect(() => {
    generate()
  }, [generate])

  function download() {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `recap-diary-${date}.md` })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" weight="bold" aria-hidden />
          Back to teaching
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()} disabled={!markdown || loading}>
            <Printer className="size-4" weight="bold" aria-hidden />
            Print
          </Button>
          <Button size="sm" onClick={download} disabled={!markdown || loading}>
            <DownloadSimple className="size-4" weight="bold" aria-hidden />
            Download .md
          </Button>
        </div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 16, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        className="print-page ruled relative rounded-[24px] border-2 border-ink px-5 pb-10 pt-12 shadow-chunky sm:px-0"
        aria-label={`Learning diary for ${pretty}`}
      >
        <span className="tape absolute -top-3 left-1/2 h-7 w-32 -translate-x-1/2 rotate-2 rounded-sm" aria-hidden />
        <div className="relative sm:pl-16 sm:pr-10">
          <p className="font-hand text-[1.6rem] leading-[32px] text-ink-soft">{pretty}</p>

          {loading ? (
            <>
              <p className="mt-2 font-hand text-[1.6rem] leading-[32px] text-pen">
                Writing up {sessions.length} topic{sessions.length === 1 ? '' : 's'}…
              </p>
              <WritingLines />
            </>
          ) : error ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="font-semibold text-redpen-700">{error}</p>
              <Button variant="secondary" size="sm" onClick={generate}>
                <ArrowCounterClockwise className="size-4" weight="bold" aria-hidden />
                Try again
              </Button>
            </div>
          ) : (
            <motion.div
              className="diary mt-2 text-[17px]"
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </motion.article>
    </div>
  )
}
