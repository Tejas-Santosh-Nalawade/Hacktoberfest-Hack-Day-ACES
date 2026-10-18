const tones = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  zinc: 'bg-zinc-50 text-zinc-600 ring-zinc-500/20',
}

export function scoreTone(score) {
  if (score >= 80) return 'emerald'
  if (score >= 50) return 'amber'
  return 'rose'
}

export default function Badge({ tone = 'zinc', mono = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
        ${mono ? 'font-mono' : ''} ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
