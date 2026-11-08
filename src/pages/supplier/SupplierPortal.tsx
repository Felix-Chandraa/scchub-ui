import { useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  AlarmClock,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  History,
  Info,
  LineChart,
  Package,
  ShieldOff,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileMenu } from '@/components/shell/AppShell'
import { CHART, ChartTooltip, axisProps } from '@/components/shared/charts'
import { Logo } from '@/components/shared/Logo'
import { Chip, Mono, POStatusBadge } from '@/components/shared/ui-kit'
import { SUPPLIER_PROJECTION, materialById, supplierById, supplierScope } from '@/data/mock'
import type { DemoUser, PurchaseOrder } from '@/data/types'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

const REASONS = ['Kapasitas mesin penuh', 'Bahan baku supplier terlambat', 'Kendala tenaga kerja', 'Kendala pengiriman/armada', 'Lainnya (dijelaskan ke Procurement)']

interface LocalConfirmation {
  poId: string
  able: 'penuh' | 'sebagian' | 'tidak'
  qty: number
  eta: string
  reason?: string
}

/* ------------------------------------------------------------------ Confirmation dialog (local-only simulation) */
function ConfirmDialog({ po, open, onOpenChange, onSubmit }: { po: PurchaseOrder; open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (c: LocalConfirmation) => void }) {
  const m = materialById(po.materialId)
  const [able, setAble] = useState<LocalConfirmation['able']>('penuh')
  const [qty, setQty] = useState(String(po.qty))
  const [eta, setEta] = useState('2026-11-26')
  const [reason, setReason] = useState<string>('')
  const [touched, setTouched] = useState(false)

  const qtyNum = Number(qty.replace(/\D/g, ''))
  const errors = {
    qty: able === 'tidak' ? null : !qtyNum ? 'Isi jumlah yang sanggup dikirim.' : qtyNum > po.qty ? `Melebihi qty PO (${fmt(po.qty)} ${m.unit}).` : able === 'penuh' && qtyNum !== po.qty ? 'Sanggup penuh berarti qty sama dengan PO.' : null,
    eta: able === 'tidak' ? null : !eta ? 'Pilih tanggal ETA.' : eta < '2026-11-09' ? 'ETA tidak boleh tanggal yang sudah lewat.' : null,
    reason: able !== 'penuh' && !reason ? 'Pilih alasan kendala.' : null,
  }
  const valid = !errors.qty && !errors.eta && !errors.reason

  const choose = (v: LocalConfirmation['able']) => {
    setAble(v)
    if (v === 'penuh') setQty(String(po.qty))
    if (v === 'sebagian' && qtyNum === po.qty) setQty('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Konfirmasi {po.id}</DialogTitle>
          <DialogDescription>
            {m.name} · {fmt(po.qty)} {m.unit} · dibutuhkan {po.needDate}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            setTouched(true)
            if (!valid) return
            onSubmit({ poId: po.id, able, qty: able === 'tidak' ? 0 : qtyNum, eta, reason: reason || undefined })
          }}
        >
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-fg">1. Apakah Anda sanggup memenuhi pesanan ini?</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {([['penuh', 'Sanggup penuh'], ['sebagian', 'Sebagian'], ['tidak', 'Tidak sanggup']] as const).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={able === v}
                  onClick={() => choose(v)}
                  className={cn(
                    'h-11 rounded-lg border text-[13.5px] font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                    able === v ? 'border-teal bg-teal-soft text-teal shadow-[0_0_0_1px_var(--accent-teal)]' : 'bg-surface text-fg-muted hover:bg-sunken',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          {able !== 'tidak' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="qty" className="mb-2 text-[13px]">2. Qty sanggup ({m.unit})</Label>
                <Input id="qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} aria-invalid={touched && !!errors.qty} className="tnum h-11 text-base" />
                {touched && errors.qty && <p className="mt-1.5 text-xs text-danger">{errors.qty}</p>}
                {!errors.qty && <p className="mt-1.5 text-xs text-fg-subtle">Maksimal {fmt(po.qty)} {m.unit}</p>}
              </div>
              <div>
                <Label htmlFor="eta" className="mb-2 text-[13px]">3. ETA pengiriman</Label>
                <Input id="eta" type="date" min="2026-11-09" value={eta} onChange={(e) => setEta(e.target.value)} aria-invalid={touched && !!errors.eta} className="h-11 text-base" />
                {touched && errors.eta && <p className="mt-1.5 text-xs text-danger">{errors.eta}</p>}
              </div>
            </div>
          )}

          {able !== 'penuh' && (
            <div>
              <Label className="mb-2 text-[13px]">Alasan kendala</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-11 w-full" aria-invalid={touched && !!errors.reason}>
                  <SelectValue placeholder="Pilih dari daftar" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              {touched && errors.reason && <p className="mt-1.5 text-xs text-danger">{errors.reason}</p>}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-xs text-warning">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Simulasi: konfirmasi hanya disimpan di layar ini dan tidak dikirim ke SAP atau sistem lain.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" className="bg-teal hover:bg-teal/90">Kirim konfirmasi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ Orders tab */
function OrderCard({ po, local }: { po: PurchaseOrder; local?: LocalConfirmation }) {
  const m = materialById(po.materialId)
  const scope = supplierScope(po.supplierId)
  const cos = scope.callOffs.filter((c) => c.poId === po.id)
  const pct = po.confirmedQty != null ? (po.confirmedQty / po.qty) * 100 : 0
  return (
    <article className="rounded-2xl border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Mono className="text-sm font-semibold text-fg">{po.id}</Mono>
            {local ? <Chip tone="teal" icon={CheckCircle2}>Terkirim (simulasi)</Chip> : <POStatusBadge po={po} />}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-fg">{m.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-fg-muted">Qty pesanan</div>
          <div className="tnum text-xl font-semibold text-fg">{fmt(po.qty)} <span className="text-sm font-normal text-fg-subtle">{m.unit}</span></div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div><dt className="text-xs text-fg-muted">Anda konfirmasi</dt><dd className="tnum mt-0.5 font-semibold text-fg">{po.confirmedQty != null ? `${fmt(po.confirmedQty)} ${m.unit}` : '—'}</dd></div>
        <div><dt className="text-xs text-fg-muted">Dibutuhkan</dt><dd className="mt-0.5 font-semibold text-fg">{po.needDate}</dd></div>
        <div><dt className="text-xs text-fg-muted">ETA Anda</dt><dd className="mt-0.5 font-semibold text-fg">{po.eta ?? '—'}</dd></div>
        <div><dt className="text-xs text-fg-muted">Diterbitkan</dt><dd className="mt-0.5 font-semibold text-fg">{po.issuedAt}</dd></div>
      </dl>
      {po.confirmedQty != null && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-neutral-soft"><div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} /></div>
          {po.partial && <p className="mt-2 text-xs text-fg-muted">Sisa {fmt(po.qty - po.confirmedQty)} {m.unit} sedang dikoordinasikan oleh Procurement.</p>}
        </div>
      )}
      {cos.length > 0 && (
        <div className="mt-5 border-t pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">Call-off</div>
          <ul className="space-y-1.5">
            {cos.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <Mono className="text-fg-muted">{c.id}</Mono>
                <span className="tnum text-fg">{fmt(c.qty)} {m.unit} · {c.date}</span>
                <span className="tnum text-fg-muted">{c.confirmedQty != null ? `dikonfirmasi ${fmt(c.confirmedQty)}` : 'belum dikonfirmasi'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function Orders({ supplierId, confirmations, onConfirm }: { supplierId: string; confirmations: Record<string, LocalConfirmation>; onConfirm: (c: LocalConfirmation) => void }) {
  const scope = supplierScope(supplierId)
  const pending = scope.pos.filter((p) => p.status === 'Diterbitkan')
  const active = scope.pos.filter((p) => p.status !== 'Diterbitkan' && p.status !== 'Diterima')
  const [dialogPo, setDialogPo] = useState<PurchaseOrder | null>(null)
  const outstanding = pending.filter((p) => !confirmations[p.id])

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[22px] font-semibold tracking-tight text-fg">
          {outstanding.length ? `${outstanding.length} pesanan menunggu konfirmasi Anda` : 'Semua pesanan sudah dikonfirmasi'}
        </h2>
        <p className="mt-1 text-[15px] text-fg-muted">Cukup tiga isian: sanggup atau tidak, qty, dan ETA.</p>

        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {['Periksa pesanan', 'Isi 3 isian konfirmasi', 'Kirim — Procurement langsung menerima'].map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-fg ring-1 ring-border">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[13px] font-semibold text-teal">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>

        <div className="mt-5 space-y-3">
          {pending.map((po) => {
            const m = materialById(po.materialId)
            const done = confirmations[po.id]
            return (
              <div key={po.id} className={cn('flex flex-col gap-5 rounded-2xl border-2 bg-surface p-5 sm:flex-row sm:items-center sm:p-6', done ? 'border-teal/30' : 'border-teal')}>
                <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', done ? 'bg-teal-soft text-teal' : 'bg-teal text-white')}>
                  {done ? <CheckCircle2 className="size-6" /> : <Package className="size-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Mono className="text-sm font-semibold">{po.id}</Mono>
                    {done ? <Chip tone="teal" icon={CheckCircle2}>Terkirim (simulasi)</Chip> : <Chip tone="warning" icon={AlarmClock}>Batas {po.confirmDeadline}</Chip>}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-fg">{m.name} · {fmt(po.qty)} {m.unit}</div>
                  <div className="mt-0.5 text-sm text-fg-muted">
                    {done
                      ? done.able === 'tidak'
                        ? `Anda menyatakan tidak sanggup · ${done.reason}`
                        : `Anda sanggup ${fmt(done.qty)} ${m.unit} · ETA ${new Date(done.eta).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : `Dibutuhkan ${po.needDate} · call-off ${fmt(po.qty)} ${m.unit}`}
                  </div>
                </div>
                {!done && (
                  <Button size="lg" className="h-12 bg-teal px-6 text-[15px] hover:bg-teal/90" onClick={() => setDialogPo(po)}>
                    Konfirmasi sekarang <ArrowRight />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg">Pesanan berjalan</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {active.map((po) => <OrderCard key={po.id} po={po} />)}
        </div>
      </section>

      {dialogPo && (
        <ConfirmDialog
          key={dialogPo.id}
          po={dialogPo}
          open={!!dialogPo}
          onOpenChange={(v) => !v && setDialogPo(null)}
          onSubmit={(c) => {
            onConfirm(c)
            setDialogPo(null)
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Projection tab */
function Projection({ supplierId }: { supplierId: string }) {
  const scope = supplierScope(supplierId)
  const [mat, setMat] = useState(scope.materials[0]?.id)
  const data = SUPPLIER_PROJECTION[supplierId] ?? []
  const m = scope.materials.find((x) => x.id === mat)!
  const total = data.reduce((s, w) => s + Number(w[mat] ?? 0), 0)
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-fg">Proyeksi kebutuhan 12 minggu</h2>
          <Chip tone="warning" icon={Info}>Proyeksi indikatif</Chip>
        </div>
        <p className="mt-1 max-w-2xl text-[15px] text-fg-muted">
          Gambaran kebutuhan untuk material yang Anda pasok, agar kapasitas dapat direncanakan lebih awal. <span className="font-medium text-fg">Bukan pesanan</span> — pesanan resmi tetap melalui PO.
        </p>
      </div>
      <div className="inline-flex rounded-xl bg-surface p-1 ring-1 ring-border" role="tablist">
        {scope.materials.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={mat === x.id}
            onClick={() => setMat(x.id)}
            className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-colors', mat === x.id ? 'bg-teal text-white' : 'text-fg-muted hover:text-fg')}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm text-fg-muted">{m.name} · <Mono>{m.id}</Mono></div>
          <div className="text-sm text-fg-muted">Total 12 minggu: <span className="tnum font-semibold text-fg">{fmt(total)} {m.unit}</span></div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} width={44} tickFormatter={(v: number) => (v ? `${v / 1000}rb` : '0')} />
              <Tooltip
                cursor={{ fill: 'rgb(14 147 137 / 0.06)' }}
                content={<ChartTooltip unit={m.unit} labelFormatter={(l, p) => `${l} · ${String(p?.[0]?.payload?.range ?? '')}`} />}
              />
              <Bar dataKey={mat} name="Proyeksi indikatif" fill={CHART.teal} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-fg-subtle">Horizon 12 minggu adalah nilai dummy prototipe. Angka dapat berubah mengikuti forecast dan promo.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ History tab */
function HistoryTab({ supplierId, confirmations }: { supplierId: string; confirmations: Record<string, LocalConfirmation> }) {
  const scope = supplierScope(supplierId)
  const done = scope.pos.filter((p) => p.status === 'Diterima')
  const events = [
    ...Object.values(confirmations).map((c) => ({ at: 'Baru saja', text: `Konfirmasi ${c.poId} dikirim (simulasi): ${c.able === 'tidak' ? 'tidak sanggup' : `sanggup ${fmt(c.qty)}`}.` })),
    { at: '9 Nov, 07:38', text: 'Konfirmasi PO-04567: sanggup 30.000 dari 40.000 pcs, ETA 21 Nov. Alasan: kapasitas mesin penuh.' },
    { at: '4 Nov, 15:20', text: 'Konfirmasi PO-04571: sanggup penuh 12.000 pcs, ETA 16 Nov.' },
    { at: '27 Okt', text: 'PO-04552 diterima gudang: 10.000 pcs Inner Carton.' },
    { at: '21 Okt', text: 'PO-04548 diterima gudang: 35.000 pcs Packaging Box (terlambat 1 hari).' },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <h2 className="text-lg font-semibold text-fg">Pesanan selesai</h2>
        <ul className="mt-4 space-y-3">
          {done.map((po) => {
            const m = materialById(po.materialId)
            return (
              <li key={po.id} className="flex items-center gap-4 rounded-xl border bg-surface px-5 py-4">
                <CheckCircle2 className="size-5 text-success" aria-hidden />
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-fg">{m.name} · {fmt(po.qty)} {m.unit}</div>
                  <div className="text-xs text-fg-muted"><Mono className="text-xs">{po.id}</Mono> · diterima {po.receivedAt}</div>
                </div>
                <POStatusBadge po={po} />
              </li>
            )
          })}
        </ul>
      </section>
      <section className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-fg">Aktivitas</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-surface bg-teal" aria-hidden />
              <div className="text-xs text-fg-subtle">{e.at}</div>
              <div className="mt-0.5 text-sm text-fg">{e.text}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ Shell */
export function SupplierPortal({ user }: { user: DemoUser }) {
  const supplier = supplierById(user.supplierId!)
  const location = useLocation()
  const blocked = (location.state as { blocked?: string } | null)?.blocked
  const [dismissed, setDismissed] = useState(false)
  const [confirmations, setConfirmations] = useState<Record<string, LocalConfirmation>>({})
  const pendingCount = useMemo(() => supplierScope(supplier.id).pos.filter((p) => p.status === 'Diterbitkan' && !confirmations[p.id]).length, [supplier.id, confirmations])

  const tabs = [
    { to: '/supplier', label: 'Pesanan Saya', icon: ClipboardList, end: true, badge: pendingCount },
    { to: '/supplier/proyeksi', label: 'Proyeksi Kebutuhan', icon: LineChart },
    { to: '/supplier/riwayat', label: 'Riwayat', icon: History },
  ]

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b bg-surface">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-4 sm:px-6">
          <Logo tone="dark" />
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
          <span className="hidden text-sm font-medium text-fg-muted sm:block">Portal Supplier</span>
          <span className="rounded-md border border-teal/30 bg-teal-soft px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-teal">DEMO</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-fg">{supplier.name}</div>
              <div className="text-xs text-fg-muted">Kode vendor {supplier.code}</div>
            </div>
            <ProfileMenu user={user} compact />
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1120px] gap-1 overflow-x-auto px-4 sm:px-6" aria-label="Menu portal">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[14px] font-medium transition-colors',
                  isActive ? 'border-teal text-fg' : 'border-transparent text-fg-muted hover:text-fg',
                )
              }
            >
              <t.icon className="size-4" aria-hidden />
              {t.label}
              {!!t.badge && <span className="rounded-full bg-teal px-1.5 text-[11px] leading-5 font-semibold text-white">{t.badge}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
        {blocked && !dismissed && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-fg" role="status">
            <ShieldOff className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <p className="flex-1">
              Halaman <Mono className="text-[13px]">{blocked}</Mono> hanya tersedia untuk pengguna internal. Anda diarahkan kembali ke Portal Supplier.
              <span className="text-fg-muted"> (Pembatasan tampilan pada prototipe.)</span>
            </p>
            <button onClick={() => setDismissed(true)} className="text-fg-muted hover:text-fg" aria-label="Tutup pemberitahuan"><X className="size-4" /></button>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-fg-muted"><CalendarDays className="size-4" aria-hidden /> Senin, 9 Nov 2026</p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.02em] text-fg">Halo, {user.name.split(' ')[0]}</h1>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
            <FlaskConical className="size-3.5" aria-hidden /> Data simulasi · hanya pesanan {supplier.alias}
          </p>
        </div>

        <Routes>
          <Route index element={<Orders supplierId={supplier.id} confirmations={confirmations} onConfirm={(c) => setConfirmations((s) => ({ ...s, [c.poId]: c }))} />} />
          <Route path="proyeksi" element={<Projection supplierId={supplier.id} />} />
          <Route path="riwayat" element={<HistoryTab supplierId={supplier.id} confirmations={confirmations} />} />
          <Route path="*" element={<Navigate to="/supplier" replace />} />
        </Routes>
      </main>
    </div>
  )
}
