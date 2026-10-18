import { Microphone, MicrophoneSlash, Stop } from '@phosphor-icons/react'
import { motion, useTransform } from 'motion/react'

function Ring({ level, i }) {
  const scale = useTransform(level, [0, 1], [1, 1.35 + i * 0.3])
  const opacity = useTransform(level, [0, 0.05, 1], [0, 0.45 - i * 0.1, 0.7 - i * 0.15])
  return <motion.span style={{ scale, opacity }} className="absolute inset-0 rounded-full bg-redpen-500" aria-hidden />
}

export default function VoiceRecorder({ supported, listening, error, level, onStart, onStop }) {
  if (!supported) {
    return (
      <p className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 bg-white px-4 py-3 text-[15px] text-ink-soft">
        <MicrophoneSlash className="size-5 shrink-0" weight="bold" aria-hidden />
        Voice works in Chrome or Edge. You can type your explanation below instead.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative grid size-24 place-items-center">
        {listening && [0, 1, 2].map((i) => <Ring key={i} level={level} i={i} />)}
        <button
          type="button"
          onClick={listening ? onStop : onStart}
          aria-label={listening ? 'Stop teaching' : 'Start teaching'}
          aria-pressed={listening}
          className={`press relative grid size-24 place-items-center rounded-full border-2 border-ink shadow-chunky focus-ring
            ${listening ? 'bg-redpen-500 text-white' : 'bg-pen text-white hover:bg-pen-dark'}`}
        >
          <motion.span
            key={listening ? 'stop' : 'mic'}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.4 }}
          >
            {listening ? <Stop className="size-9" weight="fill" /> : <Microphone className="size-10" weight="fill" />}
          </motion.span>
        </button>
      </div>
      <p className="font-display text-[15px] font-semibold text-ink" role="status">
        {listening ? 'I’m listening. Tap to stop.' : 'Tap the mic and explain it like I’m new to it'}
      </p>
      {error && <p className="text-center text-sm font-semibold text-redpen-700">{error}</p>}
    </div>
  )
}
