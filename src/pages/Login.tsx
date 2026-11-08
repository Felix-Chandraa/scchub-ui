import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Building2, Check, Database, FlaskConical, GitMerge, ShieldAlert, Unplug, Waypoints } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from '@/components/shared/ui-kit'
import { USERS } from '@/data/mock'
import type { DemoUser, RoleId } from '@/data/types'
import { homePathFor, useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

const FOCUS: Record<RoleId, string> = {
  marketing: 'Demand, promo/NPD & kesiapan produk',
  planner: 'Material alignment & shortage',
  ppic: 'Jadwal produksi & kesiapan batch',
  warehouse: 'Stok, in-transit & penerimaan',
  procurement: 'PO, konfirmasi & ETA supplier',
  manager: 'KPI rantai pasok & eskalasi',
  admin: 'Konfigurasi & kesehatan data',
  supplier: 'PO & konfirmasi milik sendiri',
}

/** Hub diagram echoing the PDF's "8 peran, 1 hub" map (p. 1). */
function HubDiagram() {
  const roles = ['Marketing', 'Planner', 'PPIC', 'Warehouse', 'Procurement', 'SC Manager', 'Admin', 'Supplier']
  const cx = 210
  const cy = 170
  const r = 128
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full max-w-[440px]" role="img" aria-label="Diagram: delapan peran terhubung ke satu hub SCCHub, SAP sebagai sumber data">
      <defs>
        <radialGradient id="hubglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity=".35" />
          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-line)" strokeDasharray="2 6" />
      <circle cx={cx} cy={cy} r="74" fill="url(#hubglow)" />
      {roles.map((label, i) => {
        const a = (i / roles.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        const ext = label === 'Supplier'
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={ext ? 'var(--hub-mint)' : 'var(--ink-muted)'} strokeOpacity={ext ? 0.6 : 0.35} strokeWidth="1.2" strokeDasharray={ext ? '4 4' : undefined} />
            <rect x={x - 42} y={y - 13} width="84" height="26" rx="13" fill="var(--ink-hover)" stroke={ext ? 'var(--hub-mint)' : 'var(--ink-line)'} strokeOpacity={ext ? 0.7 : 1} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="500" fill={ext ? 'var(--hub-mint)' : 'var(--ink-text)'}>
              {label}
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="34" fill="var(--accent-blue)" />
      <circle cx={cx} cy={cy} r="34" fill="none" stroke="white" strokeOpacity=".25" strokeWidth="6" />
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="white">SCCHub</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8.5" fill="white" fillOpacity=".75">1 versi angka</text>
    </svg>
  )
}

function AccountCard({ u, selected, onSelect, onEnter }: { u: DemoUser; selected: boolean; onSelect: () => void; onEnter: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onDoubleClick={onEnter}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl border bg-surface p-3 text-left transition-all duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
        selected ? 'border-brand shadow-[0_0_0_1px_var(--accent-blue)]' : 'hover:border-fg-subtle/40 hover:bg-sunken',
      )}
    >
      <Avatar initials={u.initials} tone={u.internal ? (selected ? 'brand' : 'ink') : 'teal'} className="size-9 text-xs" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-semibold text-fg">{u.name}</span>
        </span>
        <span className="block truncate text-xs font-medium text-fg-muted">{u.roleLabel}</span>
        <span className="mt-0.5 block truncate text-[11.5px] text-fg-subtle">{FOCUS[u.id]}</span>
      </span>
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-brand bg-brand text-white' : 'border-input bg-surface text-transparent',
        )}
        aria-hidden
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    </button>
  )
}

export function Login() {
  const { user, signIn } = useSession()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<RoleId>(user?.id ?? 'planner')
  const internal = USERS.filter((u) => u.internal)
  const supplier = USERS.filter((u) => !u.internal)
  const sel = USERS.find((u) => u.id === selected)!

  const enter = (id: RoleId = selected) => {
    signIn(id)
    navigate(homePathFor(id), { replace: true })
  }

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(420px,5fr)_7fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--ink-muted)_1px,transparent_1px),linear-gradient(90deg,var(--ink-muted)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden />
        <div className="relative flex flex-1 flex-col px-10 py-9 xl:px-14">
          <Logo />
          <div className="mt-10 max-w-md">
            <p className="text-xs font-semibold tracking-[0.14em] text-mint uppercase">Konsep A · Platform terpadu</p>
            <h1 className="mt-3 text-[34px] leading-[1.12] font-semibold tracking-[-0.025em]">
              Satu versi angka untuk seluruh rantai pasok.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-text">
              Lapisan kolaborasi di atas SAP yang menyatukan kebutuhan material, stok, PO, call-off, dan konfirmasi supplier — dalam tampilan sesuai peran.
            </p>
          </div>
          <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
            <HubDiagram />
          </div>
          <ul className="mt-6 grid grid-cols-3 gap-3 text-[12px] leading-snug text-ink-text">
            {[
              { icon: GitMerge, t: 'Single source of truth', d: 'Satu pemilik per data' },
              { icon: ShieldAlert, t: 'Alert berbasis aturan', d: 'A1–A6, tanpa AI' },
              { icon: Waypoints, t: 'Ruang koordinasi', d: 'PIC, tindakan, riwayat' },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="rounded-xl border border-ink-line bg-ink-hover/50 p-3">
                <Icon className="mb-2 size-4 text-mint" aria-hidden />
                <div className="font-semibold text-white">{t}</div>
                <div className="mt-0.5 text-ink-muted">{d}</div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Account selection */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 sm:px-10 lg:justify-end">
          <Logo tone="dark" className="lg:hidden" />
          <div className="flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning-soft px-3 py-1 text-xs font-medium text-warning">
            <FlaskConical className="size-3.5" aria-hidden />
            Prototipe demo
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-center px-5 py-6 sm:px-10">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-fg">Masuk ke SCCHub</h2>
          <p className="mt-2 text-[15px] text-fg-muted">
            Pilih salah satu dari delapan akun demo untuk melihat tampilan sesuai peran.
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-fg-subtle/40 bg-surface px-4 py-3 text-[13px] text-fg-muted">
            <Unplug className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
            <p>
              <span className="font-medium text-fg">Bukan autentikasi sungguhan.</span> Tidak ada kata sandi, akun nyata, atau koneksi SAP. Semua data adalah simulasi untuk keperluan akademik.
            </p>
          </div>

          <section className="mt-7" aria-labelledby="internal-label">
            <div className="mb-2.5 flex items-baseline justify-between">
              <h3 id="internal-label" className="text-xs font-semibold tracking-[0.08em] text-fg-muted uppercase">Pengguna internal</h3>
              <span className="text-xs text-fg-subtle">7 peran · akses Integrated Overview</span>
            </div>
            <div role="radiogroup" aria-labelledby="internal-label" className="grid gap-2.5 sm:grid-cols-2">
              {internal.map((u) => (
                <AccountCard key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} onEnter={() => enter(u.id)} />
              ))}
            </div>
          </section>

          <section className="mt-6" aria-labelledby="external-label">
            <div className="mb-2.5 flex items-baseline justify-between">
              <h3 id="external-label" className="text-xs font-semibold tracking-[0.08em] text-fg-muted uppercase">Mitra eksternal</h3>
              <span className="flex items-center gap-1 text-xs text-fg-subtle">
                <Building2 className="size-3.5" aria-hidden /> Portal terpisah
              </span>
            </div>
            <div role="radiogroup" aria-labelledby="external-label" className="grid gap-2.5 sm:grid-cols-2">
              {supplier.map((u) => (
                <AccountCard key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} onEnter={() => enter(u.id)} />
              ))}
              <div className="hidden items-center rounded-xl bg-teal-soft/60 px-4 py-3 text-[12px] leading-snug text-teal sm:flex">
                Supplier hanya melihat PO, konfirmasi, dan proyeksi indikatif miliknya — tanpa harga, stok internal, atau data supplier lain.
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <Database className="size-3.5" aria-hidden /> Snapshot data simulasi · 9 Nov 2026
            </p>
            <Button size="lg" className="h-11 px-5 text-[14px]" onClick={() => enter()}>
              Masuk sebagai {sel.name.split(' ')[0]}
              <span className="font-normal opacity-75">· {sel.roleShort}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <footer className="px-5 pb-5 text-center text-[11.5px] text-fg-subtle sm:px-10 lg:text-right">
          SCCHub · prototipe akademik klikabel — bukan sistem ERP dan bukan pengganti SAP.
        </footer>
      </main>
    </div>
  )
}
