import { forwardRef } from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', className = '', ...props },
  ref
) {
  const base =
    variant === 'primary'
      ? 'bg-accent text-white hover:opacity-90'
      : 'bg-transparent text-ink hover:bg-surface-raised/60'
  return <button ref={ref} className={`rounded-lg px-4 py-2 font-medium transition ${base} ${className}`} {...props} />
})