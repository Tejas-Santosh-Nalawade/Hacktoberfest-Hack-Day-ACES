import { AnimatePresence, motion } from 'motion/react'
import { Mic, MicOff, Square } from 'lucide-react'
import Button from './ui/Button'

function Bars() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 rounded-full bg-rose-500"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

export default function VoiceRecorder({ supported, listening, error, onStart, onStop }) {
  if (!supported) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
        <MicOff className="size-4" aria-hidden />
        Voice works in Chrome or Edge — you can type below.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {listening ? (
        <Button variant="secondary" onClick={onStop}>
          <Square className="size-3.5 fill-current" aria-hidden />
          Stop
        </Button>
      ) : (
        <Button onClick={onStart}>
          <Mic className="size-4" aria-hidden />
          Start teaching
        </Button>
      )}

      <AnimatePresence>
        {listening && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-zinc-600"
            role="status"
          >
            <span className="relative flex size-2.5">
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-500/60"
                animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative size-2.5 rounded-full bg-rose-500" />
            </span>
            Listening
            <Bars />
          </motion.span>
        )}
      </AnimatePresence>

      {error && <p className="w-full text-sm text-rose-600">{error}</p>}
    </div>
  )
}
