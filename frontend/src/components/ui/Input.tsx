import { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string }

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, id, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input
        ref={ref}
        id={id}
        className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2 outline-none focus:border-accent"
        {...props}
      />
    </label>
  )
})