export const MAX_TOPIC = 120

const SUGGESTIONS = ['Photosynthesis', 'TCP handshake', "Newton's laws", 'Mitosis', 'Supply and demand']

export default function TopicForm({ value, onChange }) {
  return (
    <div>
      <label htmlFor="topic" className="mb-2 block font-display text-[15px] font-semibold">
        What did you learn today?
      </label>
      <input
        id="topic"
        name="topic"
        value={value}
        maxLength={MAX_TOPIC}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a topic, like Photosynthesis…"
        autoComplete="off"
        className="h-14 w-full rounded-2xl border-2 border-ink bg-white px-4 font-display text-lg font-medium text-ink
          placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-faint
          transition-shadow duration-150 focus:shadow-chunky-sm focus:outline-none focus:ring-4 focus:ring-pen/25"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-hand text-[1.25rem] leading-none text-ink-soft">or try</span>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-pressed={value === s}
            className={`press lift rounded-full border-2 px-3 py-1 text-sm font-bold focus-ring
              ${i % 2 ? 'rotate-1' : '-rotate-1'}
              ${value === s ? 'border-ink bg-pen text-white shadow-chunky-sm' : 'border-ink/20 bg-white text-ink-soft hover:border-ink hover:text-ink'}`}
          >
            {s}
          </button>
        ))}
      </div>
      {value.length > MAX_TOPIC - 20 && (
        <p className="mt-1 text-right text-xs tabular-nums text-ink-faint">
          {value.length}/{MAX_TOPIC}
        </p>
      )}
    </div>
  )
}
