import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  Boxes,
  ClipboardCheck,
  FileInput,
  Megaphone,
  PackageCheck,
  RotateCcw,
  ShieldAlert,
  ShoppingCart,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertCodeTag,
  DataTable,
  ExceptionStatusBadge,
  MaterialStatusBadge,
  Mono,
  PageHeader,
  Panel,
  ReadOnlyTag,
  SapTag,
  SimTag,
  Td,
  Th,
} from '@/components/shared/ui-kit'
import {
  BATCHES,
  CALL_OFFS,
  DEMAND_CHANGES,
  EXCEPTIONS,
  MATERIALS,
  POSITIONS,
  QUALITY_HOLDS,
  SUPPLIERS,
  dayIndex,
  supplierById,
  type MaterialPosition,
} from '@/data/mock'
import type { MaterialStatus } from '@/data/types'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

const PERIODS = {
  h14: { label: 'Horizon 14 hari · 9–22 Nov', from: 9, to: 23 },
  w46: { label: 'Minggu ini · 9–15 Nov', from: 9, to: 15 },
  w47: { label: 'Minggu depan · 16–22 Nov', from: 16, to: 23 },
} as const
type PeriodKey = keyof typeof PERIODS

interface Stage {
  key: string
  label: string
  icon: LucideIcon
  value: string
  sub: string
  tone?: MaterialStatus | 'neutral'
}

function stagesFor(rows: MaterialPosition[], single: MaterialPosition | null): Stage[] {
  const ids = new Set(rows.map((r) => r.material.id))
  const pos = rows.flatMap((r) => r.pos)
  const cos = CALL_OFFS.filter((c) => pos.some((p) => p.id === c.poId))
  const exc = EXCEPTIONS.filter((e) => e.status !== 'Selesai' && ids.has(e.materialId))
  const holds = QUALITY_HOLDS.filter((q) => ids.has(q.materialId))

  if (single) {
    const m = single.material
    const po = single.pos[0]
    const dc = DEMAND_CHANGES.find((d) => m.usedIn.includes(d.product))
    const conf = single.pos.reduce((s, p) => s + (p.confirmedQty ?? 0), 0)
    const coQty = cos.reduce((s, c) => s + c.qty, 0)
    return [
      { key: 'demand', label: 'Demand', icon: Megaphone, value: dc ? dc.delta : 'Forecast SAP', sub: dc ? `${dc.title}` : `${m.usedIn.length} produk memakai`, tone: dc ? 'Waspada' : 'neutral' },
      { key: 'need', label: 'Kebutuhan', icon: FileInput, value: fmt(m.need14), sub: `${m.unit} · 14 hari`, tone: 'neutral' },
      { key: 'stock', label: 'Stok', icon: Warehouse, value: fmt(m.onHand), sub: holds.length ? `${holds.length} lot quality hold` : `${m.unit} on-hand`, tone: m.onHand < m.need14 ? 'Waspada' : 'Aman' },
      { key: 'po', label: 'PO', icon: ShoppingCart, value: po ? fmt(single.onOrder) : '—', sub: po ? single.pos.map((p) => p.id).join(', ') : 'Tidak ada PO terbuka', tone: 'neutral' },
      { key: 'co', label: 'Call-off', icon: ClipboardCheck, value: coQty ? fmt(coQty) : '—', sub: cos.length ? `${cos.length} call-off` : '—', tone: 'neutral' },
      { key: 'conf', label: 'Konfirmasi', icon: PackageCheck, value: po ? fmt(conf) : '—', sub: po ? (conf < single.onOrder ? `dari ${fmt(single.onOrder)} dipesan` : 'Penuh') : '—', tone: po ? (conf < single.onOrder ? 'Shortage' : 'Aman') : 'neutral' },
      { key: 'eta', label: 'ETA', icon: Truck, value: single.nextEta ? single.nextEta.replace(' 2026', '') : '—', sub: single.etaSlipDays ? `Bergeser +${single.etaSlipDays} hari` : single.nextEta ? 'Sesuai rencana' : '—', tone: single.etaSlipDays > 2 ? 'Shortage' : single.etaSlipDays ? 'Waspada' : 'neutral' },
      { key: 'exc', label: 'Exception', icon: ShieldAlert, value: exc.length ? exc[0].id : 'Tidak ada', sub: exc.length ? `${exc[0].status} · ${exc[0].triggers.join(', ')}` : 'Status ' + single.status, tone: exc.length ? 'Shortage' : 'Aman' },
    ]
  }

  const confirmedPOs = pos.filter((p) => p.confirmedQty != null)
  const partial = pos.filter((p) => p.partial).length
  const pending = pos.filter((p) => p.status === 'Diterbitkan').length
  const slipped = rows.filter((r) => r.etaSlipDays > 0).length
  const transit = pos.filter((p) => p.status === 'Dikirim').length
  const shortage = rows.filter((r) => r.status === 'Shortage').length
  const demandActive = DEMAND_CHANGES.filter((d) => d.status !== 'Draf' && rows.some((r) => r.material.usedIn.includes(d.product))).length
  return [
    { key: 'demand', label: 'Demand', icon: Megaphone, value: String(demandActive), sub: 'perubahan aktif (promo/NPD)', tone: 'neutral' },
    { key: 'need', label: 'Kebutuhan', icon: FileInput, value: String(rows.length), sub: `SKU · ${BATCHES.length} batch 14 hari`, tone: 'neutral' },
    { key: 'stock', label: 'Stok', icon: Warehouse, value: String(rows.filter((r) => r.material.onHand >= r.material.need14).length), sub: `SKU tertutup stok · ${holds.length} hold`, tone: 'neutral' },
    { key: 'po', label: 'PO', icon: ShoppingCart, value: String(pos.length), sub: 'PO terbuka', tone: 'neutral' },
    { key: 'co', label: 'Call-off', icon: ClipboardCheck, value: String(cos.length), sub: 'call-off terjadwal', tone: 'neutral' },
    { key: 'conf', label: 'Konfirmasi', icon: PackageCheck, value: `${confirmedPOs.length}/${pos.length}`, sub: `${partial} parsial · ${pending} menunggu`, tone: partial ? 'Waspada' : 'neutral' },
    { key: 'eta', label: 'ETA', icon: Truck, value: String(transit), sub: `dalam perjalanan · ${slipped} ETA bergeser`, tone: slipped ? 'Waspada' : 'neutral' },
    { key: 'exc', label: 'Exception', icon: ShieldAlert, value: String(exc.length), sub: `terbuka · ${shortage} SKU shortage`, tone: exc.length ? 'Shortage' : 'Aman' },
  ]
}

const TONE_RING: Record<string, string> = {
  Shortage: 'border-danger/40 bg-danger-soft/50',
  Waspada: 'border-warning/40 bg-warning-soft/50',
  Aman: 'border-success/30 bg-success-soft/40',
  neutral: 'bg-surface',
}
const TONE_ICON: Record<string, string> = {
  Shortage: 'bg-danger text-white',
  Waspada: 'bg-warning text-white',
  Aman: 'bg-success text-white',
  neutral: 'bg-ink text-white',
}

function ProcessRibbon({ stages, title }: { stages: Stage[]; title: string }) {
  return (
    <section aria-label="Alur end-to-end" className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-fg">{title}</h2>
        <span className="hidden text-xs text-fg-subtle md:inline">demand → kebutuhan → stok → PO → call-off → konfirmasi → ETA → exception</span>
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
        {stages.map((s, i) => (
          <li key={s.key} className="relative flex items-stretch">
            <div className={cn('flex min-w-0 flex-1 flex-col rounded-xl border px-3.5 py-3', TONE_RING[s.tone ?? 'neutral'])}>
              <div className="flex items-center gap-2">
                <span className={cn('flex size-6 items-center justify-center rounded-md', TONE_ICON[s.tone ?? 'neutral'])}>
                  <s.icon className="size-3.5" aria-hidden />
                </span>
                <span className="truncate text-[11.5px] font-semibold tracking-wide text-fg-muted uppercase">{s.label}</span>
                <span className="tnum ml-auto text-[11px] font-medium text-fg-subtle">{i + 1}/8</span>
              </div>
              <div className="tnum mt-2.5 truncate text-[20px] leading-tight font-semibold text-fg">{s.value}</div>
              <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-fg-muted">{s.sub}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function IntegratedOverview() {
  const [params, setParams] = useSearchParams()
  const material = params.get('material') ?? 'all'
  const supplier = params.get('supplier') ?? 'all'
  const period = (params.get('period') as PeriodKey) ?? 'h14'
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v === 'all' || (k === 'period' && v === 'h14')) next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const p = PERIODS[period] ?? PERIODS.h14
  const rows = useMemo(
    () =>
      POSITIONS.filter((r) => material === 'all' || r.material.id === material)
        .filter((r) => supplier === 'all' || r.material.supplierId === supplier)
        .filter((r) => {
          if (period === 'h14') return true
          const d = r.nextEta ? dayIndex(r.nextEta) - 31 : null
          return d != null && d >= p.from && d <= p.to
        }),
    [material, supplier, period, p.from, p.to],
  )
  const single = material !== 'all' && rows.length === 1 ? rows[0] : null
  const stages = stagesFor(rows, single)
  const excRows = EXCEPTIONS.filter((e) => e.status !== 'Selesai' && rows.some((r) => r.material.id === e.materialId))
  const filtered = material !== 'all' || supplier !== 'all' || period !== 'h14'

  return (
    <>
      <PageHeader
        eyebrow={<><ReadOnlyTag /> Semua peran internal</>}
        title="Integrated Overview"
        description="Satu halaman baca saja: demand, kebutuhan, stok, PO, call-off, konfirmasi supplier, pengiriman, dan exception. Tindakan tetap dilakukan dari tampilan masing-masing peran; harga dan data komersial tidak ditampilkan."
        meta={<><SimTag /><SapTag /></>}
      />

      {/* Filters — one row */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-xl border bg-surface p-2.5">
        <Select value={material} onValueChange={(v) => set('material', v)}>
          <SelectTrigger className="h-9 w-[230px] bg-surface" aria-label="Filter material"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua material</SelectItem>
            {MATERIALS.map((m) => <SelectItem key={m.id} value={m.id}>{m.id} · {m.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={supplier} onValueChange={(v) => set('supplier', v)}>
          <SelectTrigger className="h-9 w-[230px] bg-surface" aria-label="Filter supplier"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua supplier</SelectItem>
            {SUPPLIERS.map((s) => <SelectItem key={s.id} value={s.id}>{s.alias} · {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v) => set('period', v)}>
          <SelectTrigger className="h-9 w-[230px] bg-surface" aria-label="Filter periode"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(PERIODS) as PeriodKey[]).map((k) => <SelectItem key={k} value={k}>{PERIODS[k].label}</SelectItem>)}
          </SelectContent>
        </Select>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            <RotateCcw /> Reset
          </Button>
        )}
        <span className="ml-auto pr-2 text-xs text-fg-muted">{rows.length} dari {POSITIONS.length} material</span>
      </div>

      <ProcessRibbon stages={stages} title={single ? `Jejak end-to-end · ${single.material.id} ${single.material.name}` : 'Ringkasan alur end-to-end'} />

      <div className="grid gap-5 xl:grid-cols-12">
        <Panel
          title="Posisi material end-to-end"
          description="Klik baris untuk menelusuri jejak satu material."
          className="xl:col-span-12"
          bodyClassName="pb-1"
          icon={Boxes}
        >
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-fg-muted">Tidak ada material dengan ETA pada periode ini. Ubah filter periode atau supplier.</p>
          ) : (
            <DataTable minWidth={1120}>
              <thead>
                <tr>
                  <Th>Material</Th>
                  <Th align="right">Kebutuhan</Th>
                  <Th align="right">Stok</Th>
                  <Th>PO</Th>
                  <Th align="right">Call-off</Th>
                  <Th align="right">Konfirmasi</Th>
                  <Th>ETA</Th>
                  <Th>Supplier</Th>
                  <Th>Exception</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const m = r.material
                  const co = CALL_OFFS.filter((c) => r.pos.some((p) => p.id === c.poId)).reduce((s, c) => s + c.qty, 0)
                  const exc = EXCEPTIONS.find((e) => e.materialId === m.id && e.status !== 'Selesai')
                  const sup = supplierById(m.supplierId)
                  return (
                    <tr
                      key={m.id}
                      onClick={() => set('material', material === m.id ? 'all' : m.id)}
                      className={cn('cursor-pointer transition-colors hover:bg-sunken', material === m.id && 'bg-brand-soft/60 hover:bg-brand-soft/60')}
                    >
                      <Td>
                        <div className="font-medium whitespace-nowrap text-fg">{m.name}</div>
                        <Mono className="text-[11.5px] text-fg-subtle">{m.id}</Mono>
                      </Td>
                      <Td align="right" className="font-medium">{fmt(m.need14)} <span className="text-[11px] font-normal text-fg-subtle">{m.unit}</span></Td>
                      <Td align="right">{fmt(m.onHand)}</Td>
                      <Td>
                        {r.pos.length ? (
                          <div className="whitespace-nowrap">
                            <Mono>{r.pos[0].id}</Mono>
                            {r.pos.length > 1 && <span className="ml-1 text-[11px] text-fg-subtle">+{r.pos.length - 1}</span>}
                            <div className="tnum text-[11.5px] text-fg-muted">{fmt(r.onOrder)} {m.unit}</div>
                          </div>
                        ) : <span className="text-fg-subtle">—</span>}
                      </Td>
                      <Td align="right" className="text-fg-muted">{co ? fmt(co) : '—'}</Td>
                      <Td align="right" className={cn(r.onOrder && r.confirmed < r.onOrder && 'font-semibold text-warning')}>
                        {r.onOrder ? fmt(r.confirmed) : '—'}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {r.nextEta ? (
                          <span className="tnum">
                            {r.nextEta.replace(' 2026', '')}
                            {r.etaSlipDays > 0 && <span className={cn('ml-1.5 rounded px-1 text-[10.5px] font-semibold', r.etaSlipDays > 2 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>+{r.etaSlipDays}h</span>}
                          </span>
                        ) : <span className="text-fg-subtle">{r.pos.length ? 'Menunggu' : '—'}</span>}
                      </Td>
                      <Td className="whitespace-nowrap text-fg-muted">{sup.alias}<span className="ml-1 text-[11px] text-fg-subtle">· {sup.channel}</span></Td>
                      <Td>
                        {exc ? (
                          <span className="flex items-center gap-1.5 whitespace-nowrap"><Mono className="text-xs">{exc.id}</Mono>{exc.triggers.slice(0, 2).map((t) => <AlertCodeTag key={t} code={t} />)}</span>
                        ) : <span className="text-fg-subtle">—</span>}
                      </Td>
                      <Td><MaterialStatusBadge status={r.status} /></Td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
          )}
        </Panel>

        <Panel title="Exception aktif" description="Dikelola dari Risk & Exception oleh PIC" className="xl:col-span-7" icon={ShieldAlert}>
          {excRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-muted">Tidak ada exception aktif untuk filter ini.</p>
          ) : (
            <ul className="divide-y">
              {excRows.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Mono className="w-[72px] text-xs text-fg-muted">{e.id}</Mono>
                  <span className="flex gap-1">{e.triggers.map((t) => <AlertCodeTag key={t} code={t} />)}</span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-fg">{e.title}</span>
                  <ExceptionStatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Kedatangan terjadwal" description="ETA PO terbuka dalam horizon" className="xl:col-span-5" icon={Truck}>
          <ul className="space-y-2">
            {rows
              .filter((r) => r.nextEta)
              .sort((a, b) => dayIndex(a.nextEta!) - dayIndex(b.nextEta!))
              .map((r) => (
                <li key={r.material.id} className="flex items-center gap-3 text-[13px]">
                  <span className="tnum w-14 shrink-0 font-semibold text-fg">{r.nextEta!.replace(' 2026', '')}</span>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                  <span className="truncate text-fg-muted">{r.material.name}</span>
                  <span className="tnum shrink-0 font-medium text-fg">{fmt(r.confirmed || r.onOrder)} {r.material.unit}</span>
                  {r.etaSlipDays > 0 && <span className="shrink-0 rounded bg-warning-soft px-1 text-[10.5px] font-semibold text-warning">+{r.etaSlipDays}h</span>}
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
