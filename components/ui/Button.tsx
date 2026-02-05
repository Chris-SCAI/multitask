'use client'

import { cn } from '../../lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'btn-gradient hover:shadow-lg hover:shadow-indigo-500/25':
              variant === 'primary',
            'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-slate-600 focus:ring-slate-500':
              variant === 'secondary',
            'bg-transparent text-white hover:text-white hover:bg-slate-800/70 focus:ring-slate-500':
              variant === 'ghost',
            'bg-red-500/20 text-rose-300 border border-red-500/30 hover:bg-red-500/30 focus:ring-red-500':
              variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
