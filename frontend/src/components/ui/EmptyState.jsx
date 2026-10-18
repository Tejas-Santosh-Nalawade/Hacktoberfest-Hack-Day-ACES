export default function EmptyState({ icon: Icon, children, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-rule px-4 py-7 text-center">
      {Icon && <Icon className="size-7 text-ink-faint" weight="duotone" aria-hidden />}
      <p className="font-hand text-[1.35rem] leading-tight text-ink-soft">{children}</p>
      {action}
    </div>
  )
}
