import { Link } from 'react-router'
import { AlarmClock, ArrowRight, BellRing, CalendarX2, FilePlus2, Hourglass, Network, Scale, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UsulanPODialog } from '@/components/shared/UsulanPODialog'
import { AlertCodeTag, Chip, Meter, Mono, PageHeader, Panel, PhaseTag, SapTag, SimTag } from '@/components/shared/ui-kit'
import { PURCHASE_ORDERS, SUPPLIER_SCORES, etaSlip, materialById, supplierById } from '@/data/mock'
import type { POStatus, PurchaseOrder } from '@/data/types'
import { useProposals } from '@/lib/demo-store'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

const STAGES: { status: POStatus; label: string; hint: string }[] = [
  { status: 'Diterbitkan', label: 'Diterbitkan', hint: 'Menunggu konfirmasi' },
  { status: 'Dikonfirmasi', label: 'Dikonfirmasi', hint: 'Termasuk parsial' },
  { status: 'Diproses', label: 'Diproses', hint: 'Produksi supplier' },
  { status: 'Dikirim', label: 'Dikirim', hint: 'Dalam perjalanan' },
  { status: 'Diterima', label: 'Diterima', hint: '14 hari terakhir' },
]

function POChip({ po }: { po: PurchaseOrder }) {
  const m = materialById(po.materialId)
  const s = supplierById(po.supplierId)
  const slip = etaSlip(po)
  return (
    <Link
      to="/purchase-orders"
      className={cn(
        'block rounded-lg border bg-surface px-3 py-2.5 transition-colors hover:border-fg-subtle/40',
        po.partial && 'border-warning/40',
        po.status === 'Diterbitkan' && 'border-dashed',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Mono className="text-xs font-semibold text-fg">{po.id}</Mono>
        {po.partial ? (
          <span className="rounded bg-warning-soft px-1 text-[10.5px] font-semibold text-warning">Parsial</span>
        ) : slip > 0 ? (
          <span className="rounded bg-warning-soft px-1 text-[10.5px] font-semibold text-warning">+{slip}h</span>
        ) : null}
      </div>
      <div className="mt-1 truncate text-[12.5px] text-fg">{m.name}</div>
      <div className="mt-0.5 flex justify-between text-[11.5px] text-fg-muted">
        <span className="truncate">{s.alias}</span>
        <span className="tnum shrink-0">{fmt(po.qty)} {m.unit}</span>
      </div>
    </Link>
  )
}

function Pipeline() {
  return (
    <Panel title="Pipeline PO" description="Status end-to-end PO dan call-off · siklus Diterbitkan → Diterima" className="lg:col-span-12" actions={<SimTag />}>
      <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
        <div className="grid min-w-[880px] grid-cols-5 gap-3">
          {STAGES.map((st, i) => {
            const items = PURCHASE_ORDERS.filter((p) => p.status === st.status && (st.status !== 'Diterima' || p.receivedAt?.includes('Nov')))
            return (
              <div key={st.status} className="flex flex-col rounded-xl bg-sunken p-2.5">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <div>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-fg">
                      <span className="tnum flex size-5 items-center justify-center rounded-full bg-ink text-[10.5px] text-white">{i + 1}</span>
                      {st.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-fg-muted">{st.hint}</div>
                  </div>
                  <span className="tnum text-xl font-semibold text-fg">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((po) => <POChip key={po.id} po={po} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}

function SoonAction({ label, icon: Icon }: { label: string; icon: typeof BellRing }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant="outline" size="sm" disabled className="pointer-events-none">
            <Icon /> {label} <span className="rounded bg-neutral-soft px-1 text-[10px] font-semibold text-fg-muted">Segera hadir</span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Pengiriman ke portal supplier belum aktif di V1</TooltipContent>
    </Tooltip>
  )
}

function CommitmentQueue() {
  const proposals = useProposals()
  const po67 = PURCHASE_ORDERS.find((p) => p.id === 'PO-04567')!
  const po73 = PURCHASE_ORDERS.find((p) => p.id === 'PO-04573')!
  const po74 = PURCHASE_ORDERS.find((p) => p.id === 'PO-04574')!
  const po78 = PURCHASE_ORDERS.find((p) => p.id === 'PO-04578')!
  const items = [
    {
      po: po67,
      codes: ['A1', 'A3', 'A5'],
      tone: 'danger',
      title: `Supplier A sanggup ${fmt(po67.confirmedQty!)} dari ${fmt(po67.qty)} pcs`,
      detail: 'Kebutuhan 14 hari masih kurang 15.000 pcs Packaging Box. ETA mundur 18 → 21 Nov.',
      action: <UsulanPODialog by="Sinta · Procurement" trigger={<Button size="sm"><FilePlus2 /> Usulan PO ke Supplier B</Button>} />,
    },
    {
      po: po73,
      codes: ['A1', 'A5'],
      tone: 'danger',
      title: `Supplier B sanggup ${fmt(po73.confirmedQty!)} dari ${fmt(po73.qty)} pcs`,
      detail: 'Pump Dispenser kurang 2.800 pcs · exception dieskalasi ke SC Manager.',
      action: <SoonAction label="Alokasi ulang" icon={Scale} />,
    },
    {
      po: po74,
      codes: ['A2'],
      tone: 'warning',
      title: `Belum ada konfirmasi · batas ${po74.confirmDeadline}`,
      detail: 'Label Depan Serum 30.000 pcs dari Supplier E. Pengingat otomatis sudah terkirim (simulasi).',
      action: <SoonAction label="Kirim pengingat" icon={BellRing} />,
    },
    {
      po: po78,
      codes: [],
      tone: 'neutral',
      title: `Menunggu konfirmasi · batas ${po78.confirmDeadline}`,
      detail: 'Inner Carton 8.000 pcs dari Supplier A. Masih dalam tenggat.',
      action: null,
    },
  ]
  return (
    <Panel title="Antrean komitmen supplier" description="Konfirmasi yang belum masuk dan kekurangan yang perlu dialokasikan" className="lg:col-span-7">
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.po.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start gap-3">
              <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', it.tone === 'danger' ? 'bg-danger-soft text-danger' : it.tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-neutral-soft text-fg-muted')}>
                {it.tone === 'neutral' ? <Hourglass className="size-4" /> : it.tone === 'warning' ? <AlarmClock className="size-4" /> : <Scale className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Mono className="text-xs font-semibold">{it.po.id}</Mono>
                  {it.codes.map((c) => <AlertCodeTag key={c} code={c} />)}
                </div>
                <div className="mt-1 text-[14px] font-medium text-fg">{it.title}</div>
                <div className="mt-0.5 text-[12.5px] text-fg-muted">{it.detail}</div>
              </div>
              {it.action && <div className="w-full pl-11 sm:w-auto sm:pl-0">{it.action}</div>}
            </div>
          </li>
        ))}
      </ul>
      {proposals.length > 0 && (
        <div className="mt-4 rounded-xl border border-brand/25 bg-brand-soft/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-fg">Usulan PO dibuat sesi ini</span>
            <Chip tone="warning">Simulasi · menunggu eksekusi di SAP</Chip>
          </div>
          <ul className="mt-2 space-y-1 text-[13px]">
            {proposals.map((p) => {
              const m = materialById(p.materialId)
              return (
                <li key={p.id} className="flex flex-wrap gap-x-3 text-fg-muted">
                  <Mono className="text-fg">{p.id}</Mono>
                  <span>{m.name}</span>
                  <span className="tnum">{fmt(p.qty)} {m.unit}</span>
                  <span>{supplierById(p.supplierId).alias}</span>
                  <span>butuh {p.needDate}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Panel>
  )
}

function EtaAndScores() {
  const slips = PURCHASE_ORDERS.filter((p) => etaSlip(p) > 0 && p.status !== 'Diterima').sort((a, b) => etaSlip(b) - etaSlip(a))
  return (
    <div className="flex flex-col gap-5 lg:col-span-5">
      <Panel title="ETA bergeser" description="A3 dipicu bila selisih > 2 hari (dummy)" icon={CalendarX2}>
        <ul className="divide-y">
          {slips.map((p) => {
            const m = materialById(p.materialId)
            const d = etaSlip(p)
            return (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <Truck className="size-4 text-fg-subtle" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-fg">{m.name}</div>
                  <div className="text-xs text-fg-muted"><Mono className="text-xs">{p.id}</Mono> · {supplierById(p.supplierId).alias}</div>
                </div>
                <div className="text-right text-[12.5px]">
                  <div className="tnum"><span className="text-fg-subtle line-through">{p.etaOriginal!.replace(' 2026', '')}</span> <span className="font-semibold">{p.eta!.replace(' 2026', '')}</span></div>
                  <span className={cn('rounded px-1 text-[10.5px] font-semibold', d > 2 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>+{d} hari{d > 2 ? ' · A3' : ''}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>
      <Panel
        title="Scorecard supplier"
        description="On-time delivery 8 minggu · indikatif"
        actions={<Button variant="ghost" size="sm" className="text-brand" asChild><Link to="/supplier-performance">Detail <PhaseTag /></Link></Button>}
      >
        <ul className="space-y-2.5">
          {SUPPLIER_SCORES.map((r) => {
            const s = supplierById(r.supplierId)
            return (
              <li key={s.id} className="grid grid-cols-[88px_1fr_40px] items-center gap-3 text-[13px]">
                <span className="truncate text-fg-muted">{s.alias}</span>
                <Meter value={r.otd} tone={r.otd >= 90 ? 'success' : r.otd >= 85 ? 'warning' : 'danger'} />
                <span className="tnum text-right font-medium text-fg">{r.otd}%</span>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}

export function ProcurementDashboard() {
  const open = PURCHASE_ORDERS.filter((p) => p.status !== 'Diterima')
  const waiting = open.filter((p) => p.status === 'Diterbitkan').length
  const partial = open.filter((p) => p.partial).length
  return (
    <>
      <PageHeader
        eyebrow={<>Selamat pagi, Sinta · PIC EXC-0231</>}
        title="PO & komitmen supplier"
        description={`${open.length} PO terbuka · ${waiting} menunggu konfirmasi · ${partial} terkonfirmasi sebagian. Pastikan PO dan call-off terkonfirmasi tepat waktu.`}
        meta={<><SimTag /><SapTag /></>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/overview"><Network /> Integrated Overview</Link></Button>
            <Button asChild><Link to="/purchase-orders">Semua PO <ArrowRight /></Link></Button>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <Pipeline />
        <CommitmentQueue />
        <EtaAndScores />
      </div>
    </>
  )
}
