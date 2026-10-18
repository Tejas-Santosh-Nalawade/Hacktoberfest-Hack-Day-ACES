import { motion } from 'motion/react'
import { ArrowRight, BookCheck, Plus, RotateCcw } from 'lucide-react'
import BucketList from './BucketList'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Card from './ui/Card'
import ScoreRing from './ui/ScoreRing'
import Skeleton from './ui/Skeleton'
import { fadeUp } from './ui/motion'

export function ReviewSkeleton() {
  return (
    <Card step={3} title="Review">
      <div className="flex items-center gap-5">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500" role="status">
        Checking your concepts…
      </p>
    </Card>
  )
}

export default function ReviewCard({ review, onNewTopic, onRetry }) {
  return (
    <Card
      step={3}
      title="Review"
      action={
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RotateCcw className="size-3.5" aria-hidden />
              Re-check
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onNewTopic}>
            <Plus className="size-3.5" aria-hidden />
            New topic
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={review.score} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="text-lg">{review.topic}</h3>
            {review.grounded && (
              <Badge tone="indigo">
                <BookCheck className="size-3" aria-hidden />
                Checked against your notes
              </Badge>
            )}
          </div>
          <p className="leading-relaxed">{review.summary}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <BucketList kind="correct" title="✅ Correct" items={review.correct} />
        <BucketList kind="partial" title="⚠️ Partially correct" items={review.partial} />
        <BucketList kind="wrong" title="❌ Wrong" items={review.wrong} />
        <BucketList kind="missed" title="🕳️ Missed" items={review.missed} />
      </div>

      {review.next_step && (
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mt-4 flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
        >
          <ArrowRight className="mt-0.5 size-4 shrink-0 text-indigo-600" aria-hidden />
          <p className="text-sm">
            <span className="font-medium text-zinc-900">Revise next: </span>
            {review.next_step}
          </p>
        </motion.div>
      )}
    </Card>
  )
}
