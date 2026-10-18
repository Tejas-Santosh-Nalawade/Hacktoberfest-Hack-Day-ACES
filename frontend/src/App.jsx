import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { AlertCircle, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getHealth, getReview } from './api'
import DiaryView from './components/DiaryView'
import Header from './components/Header'
import ReferenceUpload from './components/ReferenceUpload'
import ReviewCard, { ReviewSkeleton } from './components/ReviewCard'
import SessionSidebar from './components/SessionSidebar'
import TopicForm from './components/TopicForm'
import TranscriptBox from './components/TranscriptBox'
import VoiceRecorder from './components/VoiceRecorder'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import useSpeech from './hooks/useSpeech'
import { MIN_WORDS, wordCount } from './lib/words'
import sampleReview from './sampleReview'
import { clearToday, deleteSession, loadToday, saveSession } from './storage'

const REPO_URL = 'https://github.com/Tejas-Santosh-Nalawade/Hacktoberfest-Hack-Day-ACES'
const demo = import.meta.env.DEV && new URLSearchParams(location.search).has('demo')

export default function App() {
  const speech = useSpeech()
  const [topic, setTopic] = useState(demo ? sampleReview.topic : '')
  const [reference, setReference] = useState(null)
  const [review, setReview] = useState(demo ? sampleReview : null)
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null) // { message, retry }
  const [sessions, setSessions] = useState(loadToday)
  const [view, setView] = useState('teach')
  const [health, setHealth] = useState(null)
  const reviewRef = useRef(null)

  const transcript = speech.finalText
  const words = wordCount(transcript)
  const canReview = topic.trim() && words >= MIN_WORDS && !loading

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null))
  }, [])

  async function runReview() {
    speech.stop()
    setLoading(true)
    setError(null)
    setReview(null)
    setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    try {
      const result = await getReview({ topic: topic.trim(), transcript, reference: reference?.text })
      const session = saveSession(result)
      setReview(result)
      setActiveId(session.id)
      setSessions(loadToday())
    } catch (e) {
      setError({ message: e.message, retry: runReview })
    } finally {
      setLoading(false)
    }
  }

  function newTopic() {
    speech.stop()
    speech.reset()
    setTopic('')
    setReference(null)
    setReview(null)
    setActiveId(null)
    setError(null)
    setView('teach')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openSession(s) {
    setReview(s.review)
    setTopic(s.topic)
    setActiveId(s.id)
    setView('teach')
    setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function removeSession(id) {
    setSessions(deleteSession(id))
    if (id === activeId) {
      setReview(null)
      setActiveId(null)
    }
  }

  function clearAll() {
    if (!window.confirm("Clear all of today's sessions?")) return
    setSessions(clearToday())
    setReview(null)
    setActiveId(null)
    setView('teach')
  }

  const hint = !topic.trim()
    ? 'Add a topic first'
    : words < MIN_WORDS
      ? `Explain a bit more — ${MIN_WORDS - words} more word${MIN_WORDS - words === 1 ? '' : 's'}`
      : reference
        ? 'Will be checked against your notes'
        : 'Will be checked against textbook knowledge'

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="mx-auto grid w-full max-w-[1120px] flex-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[280px_1fr] md:py-8">
          <main className="min-w-0 space-y-4 md:col-start-2 md:row-start-1">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p className="flex-1">{error.message}</p>
                  {error.retry && (
                    <button type="button" onClick={error.retry} className="font-medium underline-offset-2 hover:underline">
                      Retry
                    </button>
                  )}
                  <button type="button" onClick={() => setError(null)} aria-label="Dismiss" className="text-rose-400 hover:text-rose-700">
                    <X className="size-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {view === 'diary' ? (
                <motion.div key="diary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <DiaryView sessions={sessions} onBack={() => setView('teach')} />
                </motion.div>
              ) : (
                <motion.div
                  key="teach"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Card step={1} title="Topic & notes">
                    <TopicForm value={topic} onChange={setTopic} />
                    <ReferenceUpload reference={reference} onChange={setReference} />
                  </Card>

                  <Card step={2} title="Teach it">
                    <VoiceRecorder
                      supported={speech.supported}
                      listening={speech.listening}
                      error={speech.error}
                      onStart={speech.start}
                      onStop={speech.stop}
                    />
                    <TranscriptBox
                      value={transcript}
                      interim={speech.interim}
                      listening={speech.listening}
                      onChange={speech.setFinalText}
                      onClear={speech.reset}
                    />
                    <div className="mt-4 flex flex-col-reverse items-stretch gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-center text-xs text-zinc-400 sm:text-left">{hint}</p>
                      <Button onClick={runReview} disabled={!canReview} loading={loading}>
                        {!loading && <Sparkles className="size-4" aria-hidden />}
                        {loading ? 'Reviewing…' : 'Get review'}
                      </Button>
                    </div>
                  </Card>

                  <div ref={reviewRef} className="scroll-mt-6">
                    {loading ? (
                      <ReviewSkeleton />
                    ) : (
                      review && <ReviewCard key={activeId || 'review'} review={review} onNewTopic={newTopic} onRetry={canReview ? runReview : null} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <div className="md:col-start-1 md:row-start-1">
            <SessionSidebar
              sessions={sessions}
              activeId={activeId}
              onOpen={openSession}
              onDelete={removeSession}
              onDiary={() => setView('diary')}
              onClear={clearAll}
            />
          </div>
        </div>

        <footer className="border-t border-zinc-100">
          <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-5 text-xs text-zinc-400 sm:px-6">
            <span>
              Powered by open-weight <span className="font-mono text-zinc-600">{health?.model ?? '…'}</span> on DigitalOcean
            </span>
            <span aria-hidden>·</span>
            <span>MIT licensed</span>
            <span aria-hidden>·</span>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-700">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
