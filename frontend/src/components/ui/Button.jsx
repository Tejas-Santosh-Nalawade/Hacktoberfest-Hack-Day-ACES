import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-soft disabled:bg-indigo-300',
  secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-soft disabled:text-zinc-400',
  ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:text-zinc-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-soft',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) {
  const off = disabled || loading
  return (
    <motion.button
      whileTap={off ? undefined : { scale: 0.98 }}
      disabled={off}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
        disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </motion.button>
  )
}
