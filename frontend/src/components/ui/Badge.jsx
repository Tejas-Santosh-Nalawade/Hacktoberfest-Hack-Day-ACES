export const tones = {
  tick: { badge: 'bg-tick-50 text-tick-700 border-tick-500', fill: 'bg-tick-50' },
  hi: { badge: 'bg-hi-50 text-hi-700 border-hi-300', fill: 'bg-hi-50' },
  redpen: { badge: 'bg-redpen-50 text-redpen-700 border-redpen-500', fill: 'bg-redpen-50' },
  pen: { badge: 'bg-pen-50 text-pen-dark border-pen', fill: 'bg-pen-50' },
}

export function scoreTone(score) {
  if (score >= 80) return 'tick'
  if (score >= 50) return 'hi'
  return 'redpen'
}

export default function Badge({ tone = 'pen', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border-2 px-2 py-0.5 text-[13px] font-bold ${tones[tone].badge} ${className}`}>
      {children}
    </span>
  )
}
