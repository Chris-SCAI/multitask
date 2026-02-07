'use client'

interface LogoProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ showText = true, size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { sparkle: 'text-sm', text: 'text-lg' },
    md: { sparkle: 'text-base', text: 'text-xl' },
    lg: { sparkle: 'text-xl', text: 'text-3xl' },
  }

  return (
    <div className={`flex items-center gap-1 font-bold ${sizes[size].text} ${className}`}>
      {/* Sparkle */}
      <span>✨</span>

      {showText && (
        <>
          {/* Multi - violet */}
          <span className="text-violet-400">Multi</span>
          {/* Tasks - yellow/gold gradient */}
          <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">Tasks</span>
        </>
      )}
    </div>
  )
}
