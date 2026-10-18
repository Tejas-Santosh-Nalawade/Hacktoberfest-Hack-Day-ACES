export default function EmptyState({ icon: Icon, children, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400">
      {Icon && <Icon className="size-5" aria-hidden />}
      <p>{children}</p>
      {action}
    </div>
  )
}
