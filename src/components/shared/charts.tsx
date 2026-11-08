import type { ReactNode } from 'react'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Chart palette — validated (blue/teal CVD ΔE 18). Gray is used only as a dashed, labelled reference. */
export const CHART = {
  blue: 'var(--accent-blue)',
  teal: 'var(--accent-teal)',
  ref: '#8593A8',
  base: '#C9D3E0',
  grid: '#E9EEF4',
  axis: '#8593A8',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  success: 'var(--success)',
}

export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 11.5 },
  tickLine: false,
  axisLine: false,
} as const

interface TipPayload {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  labelFormatter,
}: {
  active?: boolean
  payload?: TipPayload[]
  label?: string | number
  unit?: string
  labelFormatter?: (l: string | number | undefined, p?: TipPayload[]) => ReactNode
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[160px] rounded-lg border bg-surface px-3 py-2 text-xs shadow-[var(--shadow-pop)]">
      <div className="mb-1.5 font-semibold text-fg">{labelFormatter ? labelFormatter(label, payload) : label}</div>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-fg-muted">
              <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
              {p.name}
            </span>
            <span className="tnum font-medium text-fg">
              {typeof p.value === 'number' ? fmt(p.value) : p.value}
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Legend({ items, className }: { items: { label: string; color: string; dashed?: boolean; swatch?: 'line' | 'dot' }[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted', className)}>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          {i.swatch === 'dot' ? (
            <span className="size-2.5 rounded-sm" style={{ background: i.color }} aria-hidden />
          ) : (
            <svg width="16" height="6" aria-hidden>
              <line x1="0" y1="3" x2="16" y2="3" stroke={i.color} strokeWidth="2" strokeDasharray={i.dashed ? '3 3' : undefined} />
            </svg>
          )}
          {i.label}
        </span>
      ))}
    </div>
  )
}

/** Stacked coverage bar: on-hand + confirmed vs need, with an explicit hatched gap. */
export function CoverageBar({
  need,
  onHand,
  confirmed,
  unit,
  compact = false,
}: {
  need: number
  onHand: number
  confirmed: number
  unit: string
  compact?: boolean
}) {
  const gap = Math.max(0, need - onHand - confirmed)
  const total = Math.max(need, onHand + confirmed)
  const pct = (n: number) => `${(n / total) * 100}%`
  return (
    <div>
      <div className={cn('flex w-full gap-[2px] overflow-hidden rounded-md', compact ? 'h-2.5' : 'h-9')} role="img" aria-label={`Stok ${fmt(onHand)}, terkonfirmasi ${fmt(confirmed)}, kekurangan ${fmt(gap)} dari kebutuhan ${fmt(need)} ${unit}`}>
        <div className="flex items-center bg-ink px-2.5 text-[11.5px] font-semibold text-white" style={{ width: pct(onHand) }}>
          {!compact && onHand / total > 0.08 && <span className="tnum truncate">{fmt(onHand)}</span>}
        </div>
        <div className="flex items-center bg-teal px-2.5 text-[11.5px] font-semibold text-white" style={{ width: pct(confirmed) }}>
          {!compact && <span className="tnum truncate">{fmt(confirmed)} terkonfirmasi</span>}
        </div>
        {gap > 0 && (
          <div
            className="flex items-center justify-center text-[11.5px] font-semibold text-danger ring-1 ring-danger/30 ring-inset"
            style={{
              width: pct(gap),
              backgroundImage: 'repeating-linear-gradient(135deg, var(--danger-soft) 0 6px, #f6d9da 6px 8px)',
            }}
          >
            {!compact && <span className="tnum truncate">−{fmt(gap)}</span>}
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ink" aria-hidden />Stok on-hand</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teal" aria-hidden />Pasokan terkonfirmasi</span>
          {gap > 0 && <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger-soft ring-1 ring-danger/40" aria-hidden />Kekurangan</span>}
          <span className="ml-auto tnum">Kebutuhan 14 hari: <span className="font-semibold text-fg">{fmt(need)} {unit}</span></span>
        </div>
      )}
    </div>
  )
}
