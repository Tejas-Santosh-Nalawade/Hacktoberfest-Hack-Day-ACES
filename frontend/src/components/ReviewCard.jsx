import { ArrowCounterClockwise, BookOpenText, Plus, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { canSpeak, speak, stopSpeaking } from '../lib/speak'
import BucketList from './BucketList'
import Badge, { scoreTone, tones } from './ui/Badge'
import Button from './ui/Button'
import Card from './ui/Card'
import Skeleton from './ui/Skeleton'

function GradeSticker({ score }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? score : 0)

  useEffect(() => {
    if (reduce) return
    const c = animate(0, score, { duration: 0.9, ease: [0.23, 1, 0.32, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [score, reduce])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.5, rotate: -24 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
      className={`grid size-28 shrink-0 place-items-center rounded-full border-2 border-ink shadow-chunky ${tones[scoreTone(score)].fill}`}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <div className="grid size-[5.6rem] place-items-center rounded-full border-2 border-dashed border-ink/40 text-center">
        <div>
          <p className="font-display text-[2.4rem] font-bold leading-none tabular-nums">{reduce ? score : shown}</p>
          <p className="font-hand text-lg leading-none text-ink-soft">out of 100</p>
        </div>
      </div>
    </motion.div>
  )
}

export function ReviewSkeleton() {
  return (
    <Card step={3} title="Review">
      <div className="flex items-center gap-5">
        <Skeleton className="size-28 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
    </Card>
  )
}

export default function ReviewCard({ review, onNewTopic, onRetry }) {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => stopSpeaking, [])

  function toggleSpeak() {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speak(`${review.summary} Revise next: ${review.next_step}`, { onEnd: () => setSpeaking(false) })
  }

  return (
    <Card
      step={3}
      title="Review"
      aria-label={`Review of ${review.topic}`}
      action={
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <ArrowCounterClockwise className="size-4" weight="bold" aria-hidden />
              Check again
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onNewTopic}>
            <Plus className="size-4" weight="bold" aria-hidden />
            New topic
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <GradeSticker score={review.score} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-2xl">{review.topic}</h3>
            {review.grounded && (
              <Badge tone="pen">
                <BookOpenText className="size-4" weight="bold" aria-hidden />
                Checked against your notes
              </Badge>
            )}
          </div>
          <p className="max-w-[60ch] text-[17px] leading-relaxed">{review.summary}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <BucketList kind="correct" items={review.correct} delay={0.25} />
        <BucketList kind="partial" items={review.partial} delay={0.32} />
        <BucketList kind="wrong" items={review.wrong} delay={0.39} />
        <BucketList kind="missed" items={review.missed} delay={0.46} />
      </div>

      {review.next_step && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.2, delay: 0.6 }}
          className="mt-5 flex flex-col gap-3 rounded-3xl border-2 border-ink bg-sun-50 p-4 sm:flex-row sm:items-center sm:p-5"
        >
          <div className="flex-1">
            <p className="font-display font-semibold">Revise next</p>
            <p className="font-hand text-[1.55rem] leading-snug text-ink">{review.next_step}</p>
          </div>
          {canSpeak && (
            <Button variant="sun" size="sm" onClick={toggleSpeak} aria-pressed={speaking}>
              {speaking ? <SpeakerSlash className="size-4" weight="bold" aria-hidden /> : <SpeakerHigh className="size-4" weight="bold" aria-hidden />}
              {speaking ? 'Stop' : 'Read it to me'}
            </Button>
          )}
        </motion.div>
      )}
    </Card>
  )
}
