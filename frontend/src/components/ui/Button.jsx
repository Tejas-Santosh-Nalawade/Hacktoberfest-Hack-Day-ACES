import { CircleNotch } from '@phosphor-icons/react'

const variants = {
  primary: 'bg-pen text-white border-ink shadow-chunky hover:bg-pen-dark disabled:bg-pen/40 disabled:text-white/90',
  sun: 'bg-sun text-ink border-ink shadow-chunky hover:bg-hi-300 disabled:bg-sun-50 disabled:text-ink-faint',
  secondary: 'bg-white text-ink border-ink shadow-chunky hover:bg-pen-50 disabled:text-ink-faint',
  ghost: 'border-transparent text-ink-soft hover:text-ink hover:bg-ink/5 disabled:text-ink-faint',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-2xl',
  lg: 'h-13 px-6 text-base gap-2 rounded-2xl',
}

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }) {
  const off = disabled || loading
  return (
    <button
      type="button"
      disabled={off}
      className={`press inline-flex items-center justify-center border-2 font-display font-semibold tracking-[0.01em]
        disabled:cursor-not-allowed disabled:shadow-none focus-ring ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden />}
      {children}
    </button>
  )
}
