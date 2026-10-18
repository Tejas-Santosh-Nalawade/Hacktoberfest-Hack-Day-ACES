import { BuddyFace } from './Buddy'

export default function Header() {
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 pt-5 sm:px-6 sm:pt-7">
      <div className="flex items-center gap-3">
        <BuddyFace size={44} />
        <div>
          <h1 className="text-[1.45rem] font-bold leading-none" translate="no">
            Recap Buddy
          </h1>
          <p className="font-hand text-[1.25rem] leading-tight text-ink-soft">Teach it. I'll check it.</p>
        </div>
      </div>
      <p className="hidden -rotate-2 rounded-lg border-2 border-ink bg-white px-3 py-1 font-hand text-[1.3rem] leading-none shadow-chunky-sm sm:block">
        {date}
      </p>
    </header>
  )
}
