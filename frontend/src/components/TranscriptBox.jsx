import { MIN_WORDS, wordCount } from '../lib/words'

export default function TranscriptBox({ value, interim, listening, onChange, onClear }) {
  const words = wordCount(value + ' ' + interim)
  return (
    <div className="mt-4">
      <label htmlFor="transcript" className="sr-only">
        Your explanation
      </label>
      <textarea
        id="transcript"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        placeholder="Press Start teaching and explain the topic as if to a friend — or just type here."
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-zinc-900
          placeholder:text-zinc-400 transition-colors hover:border-zinc-300
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
      {listening && interim && (
        <p className="mt-1 line-clamp-2 text-sm italic text-zinc-400" aria-live="polite">
          {interim}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span className={`font-mono ${words >= MIN_WORDS ? 'text-emerald-600' : ''}`}>
          {words} {words === 1 ? 'word' : 'words'}
        </span>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="rounded px-1 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
