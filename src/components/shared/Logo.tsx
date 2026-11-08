import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#3467D5" />
      <path d="M16 16 9 9.5M16 16l7.5-5M16 16v8" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="9.5" r="2.6" fill="#fff" />
      <circle cx="23.5" cy="11" r="2.6" fill="#7FE0D6" />
      <circle cx="16" cy="24" r="2.6" fill="#fff" />
      <circle cx="16" cy="16" r="3.6" fill="#101C32" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

export function Logo({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="leading-none">
        <div className={cn('text-[15px] font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-fg')}>
          SCC<span className={tone === 'light' ? 'text-mint' : 'text-teal'}>Hub</span>
        </div>
        <div className={cn('mt-1 text-[10.5px] font-medium tracking-wide', tone === 'light' ? 'text-ink-muted' : 'text-fg-subtle')}>
          Collaboration hub
        </div>
      </div>
    </div>
  )
}
