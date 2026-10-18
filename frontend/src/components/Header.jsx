import { Check } from 'lucide-react'

export default function Header() {
  const date = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <header className="hero-glow border-b border-zinc-100">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-soft">
            <Check className="size-4" strokeWidth={3} aria-hidden />
          </span>
          <div>
            <h1 className="text-[15px] leading-tight">Recap Buddy</h1>
            <p className="text-xs text-zinc-500">Teach it. We'll check it.</p>
          </div>
        </div>
        <time className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-500">{date}</time>
      </div>
    </header>
  )
}
