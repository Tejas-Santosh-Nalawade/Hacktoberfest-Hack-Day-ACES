export default function Card({ step, title, action, className = '', children, ...props }) {
  return (
    <section className={`rounded-[28px] border-2 border-ink bg-white p-5 shadow-chunky sm:p-7 ${className}`} {...props}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-xl">
            {step && (
              <span className="grid size-8 place-items-center rounded-full border-2 border-ink bg-sun text-[15px] leading-none">
                {step}
              </span>
            )}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
