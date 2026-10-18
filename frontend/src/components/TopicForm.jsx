export const MAX_TOPIC = 120

export default function TopicForm({ value, onChange }) {
  return (
    <div>
      <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-zinc-900">
        What are you teaching?
      </label>
      <input
        id="topic"
        value={value}
        maxLength={MAX_TOPIC}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Photosynthesis, TCP handshake, Newton's laws"
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900
          placeholder:text-zinc-400 transition-colors hover:border-zinc-300
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
      {value.length > MAX_TOPIC - 20 && (
        <p className="mt-1 text-right font-mono text-xs text-zinc-400">
          {value.length}/{MAX_TOPIC}
        </p>
      )}
    </div>
  )
}
