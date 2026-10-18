import { Sparkle, WarningCircle, X } from '@phosphor-icons/react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { getHealth, getReview } from './api'
import BuddyStage from './components/Buddy'
import DiaryView from './components/DiaryView'
import Header from './components/Header'
import ReferenceUpload from './components/ReferenceUpload'
import ReviewCard, { ReviewSkeleton } from './components/ReviewCard'
import SessionSidebar from './components/SessionSidebar'
import Stepper from './components/Stepper'
import TopicForm from './components/TopicForm'
import TranscriptBox from './components/TranscriptBox'
import VoiceRecorder from './components/VoiceRecorder'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import useMicLevel from './hooks/useMicLevel'
import useSpeech from './hooks/useSpeech'
import { celebrate } from './lib/celebrate'
import { stopSpeaking } from './lib/speak'
import { MIN_WORDS, wordCount } from './lib/words'
import sampleReview from './sampleReview'
import { clearToday, deleteSession, loadToday, saveSession } from './storage'

const REPO_URL = 'https://github.com/Tejas-Santosh-Nalawade/Hacktoberfest-Hack-Day-ACES'
const demo = import.meta.env.DEV && new URLSearchParams(location.search).has('demo')

const LISTENING_LINES = ['Mm-hm, keep going.', 'Ooh, tell me more.', 'I’m following you.', 'Nice. What happens next?', 'Got it. And then?']

function buddyFor({ view, diaryState, loading, error, review, listening, listenTick, topic, words, sessions }) {
  if (view === 'diary') {
    if (diaryState === 'writing') return { mood: 'thinking', line: 'Writing today’s diary for you' }
    if (diaryState === 'error') return { mood: 'encouraging', line: 'My pen slipped. Try again?' }
    return { mood: 'proud', line: `${sessions} topic${sessions === 1 ? '' : 's'} today. Here’s your page.` }
  }
  if (loading) return { mood: 'thinking', line: 'Checking your concepts' }
  if (error) return { mood: 'encouraging', line: 'That didn’t go through. Let’s try again.' }
  if (listening) return { mood: 'listening', line: LISTENING_LINES[listenTick % LISTENING_LINES.length] }
  if (review) {
    if (review.score >= 80) return { mood: 'happy', line: `You really know ${review.topic}!` }
    if (review.score >= 50) return { mood: 'proud', line: 'Solid. A few things to tidy up below.' }
    return { mood: 'encouraging', line: 'Good start. Let’s fix these together.' }
  }
  if (words >= MIN_WORDS) return { mood: 'idle', line: 'Done explaining? Hit “Check my explanation”.' }
  if (words > 0) return { mood: 'idle', line: 'Keep going, I need a bit more to go on.' }
  if (topic.trim()) return { mood: 'idle', line: `Teach me ${topic.trim()}. Pretend I’ve never heard of it.` }
  return { mood: 'idle', line: 'Hi! What did you learn today?' }
}

export default function App() {
  const speech = useSpeech()
  const level = useMicLevel(speech.listening)
  const [topic, setTopic] = useState(demo ? sampleReview.topic : '')
  const [reference, setReference] = useState(null)
  const [review, setReview] = useState(demo ? sampleReview : null)
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null) // { message, retry }
  const [sessions, setSessions] = useState(loadToday)
  const [view, setView] = useState('teach')
  const [diaryState, setDiaryState] = useState('writing')
  const [health, setHealth] = useState(null)
  const [listenTick, setListenTick] = useState(0)
  const reviewRef = useRef(null)

  const transcript = speech.finalText
  const words = wordCount(transcript)
  const canReview = topic.trim() && words >= MIN_WORDS && !loading
  const step = loading || review ? 2 : words > 0 || speech.listening ? 1 : 0

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null))
  }, [])

  // rotate Buddy's "I'm listening" lines
  useEffect(() => {
    if (!speech.listening) return
    const t = setInterval(() => setListenTick((n) => n + 1), 4000)
    return () => clearInterval(t)
  }, [speech.listening])

  const scrollToReview = () => setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)

  async function runReview() {
    speech.stop()
    stopSpeaking()
    setLoading(true)
    setError(null)
    setReview(null)
    scrollToReview()
    try {
      const result = await getReview({ topic: topic.trim(), transcript, reference: reference?.text })
      const session = saveSession(result)
      setReview(result)
      setActiveId(session.id)
      setSessions(loadToday())
      if (result.score >= 80) setTimeout(celebrate, 450)
    } catch (e) {
      setError({ message: e.message, retry: runReview })
    } finally {
      setLoading(false)
    }
  }

  function newTopic() {
    speech.stop()
    speech.reset()
    stopSpeaking()
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
    setError(null)
    setView('teach')
    scrollToReview()
  }

  function removeSession(id) {
    setSessions(deleteSession(id))
    if (id === activeId) {
      setReview(null)
      setActiveId(null)
    }
  }

  function clearAll() {
    setSessions(clearToday())
    setReview(null)
    setActiveId(null)
    setView('teach')
  }

  const buddy = buddyFor({
    view,
    diaryState,
    loading,
    error,
    review,
    listening: speech.listening,
    listenTick,
    topic,
    words,
    sessions: sessions.length,
  })

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <div className="no-print">
          <Header />
        </div>

        <div className="mx-auto grid w-full max-w-[1180px] flex-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[1fr_300px] md:py-8">
          <main id="main" className="min-w-0 space-y-5">
            <div className="no-print">
              <BuddyStage mood={buddy.mood} line={buddy.line} level={level}>
                {view === 'teach' && <Stepper current={step} />}
              </BuddyStage>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border-2 border-redpen-500 bg-redpen-50 px-4 py-3 text-redpen-700"
                >
                  <WarningCircle className="mt-0.5 size-5 shrink-0" weight="bold" aria-hidden />
                  <p className="flex-1 font-semibold">{error.message}</p>
                  {error.retry && (
                    <button type="button" onClick={error.retry} className="rounded-lg px-2 font-bold underline-offset-2 hover:underline focus-ring">
                      Retry
                    </button>
                  )}
                  <button type="button" onClick={() => setError(null)} aria-label="Dismiss" className="rounded-lg p-0.5 hover:bg-redpen-500/10 focus-ring">
                    <X className="size-4" weight="bold" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {view === 'diary' ? (
                <motion.div
                  key="diary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <DiaryView sessions={sessions} onBack={() => setView('teach')} onState={setDiaryState} />
                </motion.div>
              ) : (
                <motion.div
                  key="teach"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <Card step={1} title="Pick a topic">
                    <TopicForm value={topic} onChange={setTopic} />
                    <ReferenceUpload reference={reference} onChange={setReference} />
                  </Card>

                  <Card step={2} title="Teach it out loud">
                    <VoiceRecorder
                      supported={speech.supported}
                      listening={speech.listening}
                      error={speech.error}
                      level={level}
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
                    <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-center text-sm text-ink-soft sm:text-left">
                        {!topic.trim()
                          ? 'Pick a topic first.'
                          : words < MIN_WORDS
                            ? `Say about ${MIN_WORDS - words} more word${MIN_WORDS - words === 1 ? '' : 's'} so I have enough to check.`
                            : reference
                              ? 'I’ll check it against your notes.'
                              : 'I’ll check it against textbook knowledge.'}
                      </p>
                      <Button size="lg" onClick={runReview} disabled={!canReview} loading={loading}>
                        {!loading && <Sparkle className="size-5" weight="fill" aria-hidden />}
                        {loading ? 'Checking…' : 'Check my explanation'}
                      </Button>
                    </div>
                  </Card>

                  <div ref={reviewRef} className="scroll-mt-6">
                    {loading ? (
                      <ReviewSkeleton />
                    ) : (
                      review && (
                        <ReviewCard key={activeId || 'review'} review={review} onNewTopic={newTopic} onRetry={canReview ? runReview : null} />
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <div className="no-print">
            <SessionSidebar
              sessions={sessions}
              activeId={activeId}
              onOpen={openSession}
              onDelete={removeSession}
              onDiary={() => {
                setDiaryState('writing')
                setView('diary')
              }}
              onClear={clearAll}
            />
          </div>
        </div>

        <footer className="no-print mx-auto w-full max-w-[1180px] px-4 pb-8 pt-2 text-center text-sm text-ink-soft sm:px-6">
          Reviews by the open-weight <strong className="font-bold text-ink">{health?.model ?? 'Gemma'}</strong> model on DigitalOcean. MIT licensed,{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-bold text-pen underline-offset-2 hover:underline focus-ring">
            source on GitHub
          </a>
          .
        </footer>
      </div>
    </MotionConfig>
  )
}
