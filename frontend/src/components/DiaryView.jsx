import { ArrowLeft, Download, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getReport } from '../api'
import { today } from '../storage'
import Button from './ui/Button'
import Card from './ui/Card'
import Skeleton from './ui/Skeleton'

export default function DiaryView({ sessions, onBack }) {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const date = today()

  const generate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getReport({ date, reviews: sessions.map((s) => s.review) })
      setMarkdown(res.markdown)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [date, sessions])

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
    <Card
      title="Today's learning diary"
      action={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-3.5" aria-hidden />
            Back
          </Button>
          <Button size="sm" onClick={download} disabled={!markdown || loading}>
            <Download className="size-3.5" aria-hidden />
            Download .md
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-3" role="status">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <p className="pt-2 text-center text-sm text-zinc-500">Writing your diary from {sessions.length} topic{sessions.length === 1 ? '' : 's'}…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <Button variant="secondary" size="sm" onClick={generate}>
            <RotateCcw className="size-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      ) : (
        <article className="prose-diary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>
      )}
    </Card>
  )
}
