import confetti from 'canvas-confetti'

const colors = ['#2F5BFF', '#FFD43B', '#2FB36B', '#E5484D', '#C4E3FF']

export function celebrate() {
  const base = { colors, disableForReducedMotion: true, ticks: 220, scalar: 1.1 }
  confetti({ ...base, particleCount: 70, spread: 70, angle: 60, origin: { x: 0, y: 0.7 } })
  confetti({ ...base, particleCount: 70, spread: 70, angle: 120, origin: { x: 1, y: 0.7 } })
}
