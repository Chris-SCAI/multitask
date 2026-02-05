'use client'

import { cn } from '../../lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-slate-800/70 border border-slate-600',
          'text-slate-100 placeholder:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
export { Input }
