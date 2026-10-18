import { useMotionValue } from 'motion/react'
import { useEffect } from 'react'

// Live microphone loudness (0–1) as a motion value, so animations follow the
// voice without re-rendering React 60 times a second. Falls back to a gentle
// fake pulse if the mic can't be opened.
export default function useMicLevel(active) {
  const level = useMotionValue(0)

  useEffect(() => {
    if (!active) {
      level.set(0)
      return
    }
    let raf = 0
    let stream = null
    let ctx = null
    let cancelled = false
    let smooth = 0

    const fake = () => {
      const t = performance.now() / 1000
      level.set(0.25 + 0.15 * Math.sin(t * 5) + 0.1 * Math.sin(t * 11))
      raf = requestAnimationFrame(fake)
    }

    async function open() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        const AC = window.AudioContext || window.webkitAudioContext
        ctx = new AC()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        ctx.createMediaStreamSource(stream).connect(analyser)
        const data = new Uint8Array(analyser.fftSize)
        const tick = () => {
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.min(1, Math.sqrt(sum / data.length) * 4)
          smooth += (rms - smooth) * (rms > smooth ? 0.5 : 0.12) // fast attack, slow release
          level.set(smooth)
          raf = requestAnimationFrame(tick)
        }
        tick()
      } catch {
        if (!cancelled) fake()
      }
    }
    open()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      ctx?.close().catch(() => {})
      level.set(0)
    }
  }, [active, level])

  return level
}
