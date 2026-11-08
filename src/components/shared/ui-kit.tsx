import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock3,
  Database,
  Eye,
  FlaskConical,
  Loader2,
  OctagonAlert,
  PackageCheck,
  Send,
  ShieldCheck,
  Siren,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExceptionStatus, MaterialStatus, POStatus, PurchaseOrder } from '@/data/types'

/* ------------------------------------------------------------------ Status chips */
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'neutral'

const TONE: Record<Tone, string> = {
  success: 'bg-success-soft text-success ring-success/15',
  warning: 'bg-warning-soft text-warning ring-warning/15',
  danger: 'bg-danger-soft text-danger ring-danger/15',
  info: 'bg-brand-soft text-brand ring-brand/15',
  teal: 'bg-teal-soft text-teal ring-teal/15',
  neutral: 'bg-neutral-soft text-fg-muted ring-fg/5',
}

export function Chip({ tone = 'neutral', icon: Icon, children, className }: { tone?: Tone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset', TONE[tone], className)}>
      {Icon && <Icon className="size-3.5" strokeWidth={2.2} aria-hidden />}
      {children}
    </span>
  )
}

const MAT: Record<MaterialStatus, { tone: Tone; icon: LucideIcon }> = {
  Aman: { tone: 'success', icon: ShieldCheck },
  Waspada: { tone: 'warning', icon: AlertTriangle },
  Shortage: { tone: 'danger', icon: OctagonAlert },
}
export function MaterialStatusBadge({ status, className }: { status: MaterialStatus; className?: string }) {
  const s = MAT[status]
  return (
    <Chip tone={s.tone} icon={s.icon} className={className}>
      {status}
    </Chip>
  )
}

const POS: Record<POStatus, { tone: Tone; icon: LucideIcon }> = {
  Diterbitkan: { tone: 'neutral', icon: Send },
  Dikonfirmasi: { tone: 'info', icon: CheckCircle2 },
  Diproses: { tone: 'teal', icon: Loader2 },
  Dikirim: { tone: 'teal', icon: Truck },
  Diterima: { tone: 'success', icon: PackageCheck },
}
export function POStatusBadge({ po }: { po: Pick<PurchaseOrder, 'status' | 'partial'> }) {
  if (po.partial) return <Chip tone="warning" icon={CircleDot}>Dikonfirmasi sebagian</Chip>
  const s = POS[po.status]
  return <Chip tone={s.tone} icon={s.icon}>{po.status === 'Diterbitkan' ? 'Menunggu konfirmasi' : po.status}</Chip>
}

const EXC: Record<ExceptionStatus, { tone: Tone; icon: LucideIcon }> = {
  Terbuka: { tone: 'info', icon: CircleDashed },
  Ditangani: { tone: 'teal', icon: Clock3 },
  Eskalasi: { tone: 'danger', icon: Siren },
  Selesai: { tone: 'success', icon: CheckCircle2 },
}
export function ExceptionStatusBadge({ status }: { status: ExceptionStatus }) {
  const s = EXC[status]
  return <Chip tone={s.tone} icon={s.icon}>{status}</Chip>
}

export function AlertCodeTag({ code }: { code: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-md bg-ink px-1.5 font-mono text-[10.5px] font-semibold tracking-wide text-white">
      {code}
    </span>
  )
}

/* ------------------------------------------------------------------ Demo / provenance tags */
export function SimTag({ className, label = 'Data simulasi' }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border border-dashed border-fg-subtle/40 px-1.5 py-0.5 text-[11px] font-medium text-fg-muted', className)}>
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  )
}
export function PhaseTag({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-phase-soft px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-phase', className)}>
      Fase 2
    </span>
  )
}
export function ReadOnlyTag({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md bg-neutral-soft px-1.5 py-0.5 text-[11px] font-semibold text-fg-muted', className)}>
      <Eye className="size-3" aria-hidden />
      Read-only
    </span>
  )
}
export function SapTag({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-fg-subtle', className)}>
      <Database className="size-3" aria-hidden />
      Sumber konseptual: SAP · tidak terhubung
    </span>
  )
}

/* ------------------------------------------------------------------ Surfaces */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  icon: Icon,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  icon?: LucideIcon
}) {
  return (
    <section className={cn('min-w-0 rounded-xl border bg-surface shadow-[var(--shadow-card)]', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
              {Icon && <Icon className="size-4 text-fg-subtle" aria-hidden />}
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('px-5 pb-5', !title && !actions && 'pt-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-fg-muted">{eyebrow}</div>}
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-fg">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-fg-muted">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ Data bits */
export function Meter({ value, tone = 'info', className, label }: { value: number; tone?: Tone; className?: string; label?: string }) {
  const bar: Record<Tone, string> = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-brand', teal: 'bg-teal', neutral: 'bg-fg-subtle' }
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-soft', className)} role="meter" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn('h-full rounded-full transition-[width] duration-200', bar[tone])} style={{ width: `${v}%` }} />
    </div>
  )
}

export const statusTone = (s: MaterialStatus): Tone => (s === 'Aman' ? 'success' : s === 'Waspada' ? 'warning' : 'danger')

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[12.5px] tracking-tight whitespace-nowrap', className)}>{children}</span>
}

export function Avatar({ initials, className, tone = 'ink' }: { initials: string; className?: string; tone?: 'ink' | 'brand' | 'teal' | 'light' }) {
  const t = { ink: 'bg-ink text-white', brand: 'bg-brand text-white', teal: 'bg-teal text-white', light: 'bg-brand-soft text-brand' }[tone]
  return <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', t, className)}>{initials}</span>
}

/* ------------------------------------------------------------------ Table primitives */
export function DataTable({ children, className, minWidth = 720 }: { children: ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={cn('scrollbar-thin -mx-5 overflow-x-auto', className)}>
      <table className="w-full border-collapse text-[13px]" style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}
export function Th({ children, className, align = 'left' }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      className={cn(
        'border-y bg-sunken px-3 py-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-fg-muted uppercase first:pl-5 last:pr-5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  )
}
export function Td({ children, className, align = 'left' }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <td className={cn('border-b px-3 py-3 align-middle first:pl-5 last:pr-5', align === 'right' && 'tnum text-right', align === 'center' && 'text-center', className)}>
      {children}
    </td>
  )
}

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-neutral-soft text-fg-subtle">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-fg-muted">{text}</p>
    </div>
  )
}
