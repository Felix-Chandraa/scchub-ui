import { useState } from 'react'
import { Link } from 'react-router'
import { CalendarDays, CheckCircle2, FlaskConical, Network, PackageCheck, PauseCircle, Truck, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip, DataTable, Meter, Mono, PageHeader, Panel, SapTag, SimTag, Td, Th } from '@/components/shared/ui-kit'
import { MATERIALS, PURCHASE_ORDERS, QUALITY_HOLDS, WAREHOUSE_ZONES, etaSlip, materialById, supplierById } from '@/data/mock'
import type { PurchaseOrder } from '@/data/types'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

const INBOUND = PURCHASE_ORDERS.filter((p) => p.eta && p.status !== 'Diterima' && (p.confirmedQty ?? 0) > 0)
const day = (s: string) => Number(s.split(' ')[0])
const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function ArrivalCalendar() {
  const days = Array.from({ length: 14 }, (_, i) => 9 + i)
  return (
    <Panel title="Kalender kedatangan" description="ETA terkonfirmasi supplier · 9–22 Nov · Gudang RM/PM 01" className="lg:col-span-12" icon={CalendarDays} actions={<SimTag />}>
      <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
        <div className="grid min-w-[880px] grid-cols-7 gap-2">
          {DOW.map((d) => <div key={d} className="px-1 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">{d}</div>)}
          {days.map((d) => {
            const arrivals = INBOUND.filter((p) => day(p.eta!) === d)
            const ghosts = INBOUND.filter((p) => p.etaOriginal && etaSlip(p) > 0 && day(p.etaOriginal) === d)
            const today = d === 9
            return (
              <div key={d} className={cn('min-h-[104px] rounded-lg border p-2', today ? 'border-brand/50 bg-brand-soft/40' : 'bg-surface', !today && (d - 9) % 7 >= 5 && 'bg-sunken')}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className={cn('tnum text-[13px] font-semibold', today ? 'text-brand' : 'text-fg')}>{d}</span>
                  {today && <span className="text-[10px] font-semibold text-brand">Hari ini</span>}
                </div>
                <div className="space-y-1">
                  {arrivals.map((p) => {
                    const m = materialById(p.materialId)
                    const slip = etaSlip(p)
                    return (
                      <div key={p.id} className={cn('rounded-md px-1.5 py-1 text-[11px] leading-tight', p.status === 'Dikirim' ? 'bg-teal text-white' : slip > 2 ? 'bg-danger-soft text-danger ring-1 ring-danger/30' : 'bg-teal-soft text-teal')}>
                        <div className="truncate font-semibold">{m.name}</div>
                        <div className="tnum truncate opacity-85">{fmt(p.confirmedQty!)} {m.unit}{slip > 0 && ` · +${slip}h`}</div>
                      </div>
                    )
                  })}
                  {ghosts.map((p) => (
                    <div key={`g-${p.id}`} className="rounded-md border border-dashed border-fg-subtle/40 px-1.5 py-1 text-[11px] leading-tight text-fg-subtle">
                      <div className="truncate line-through">{materialById(p.materialId).name}</div>
                      <div className="truncate">ETA awal · bergeser</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teal" aria-hidden />Dalam perjalanan</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teal-soft ring-1 ring-teal/30" aria-hidden />Terjadwal</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger-soft ring-1 ring-danger/30" aria-hidden />ETA bergeser &gt; 2 hari</span>
      </div>
    </Panel>
  )
}

function ReceivingQueue() {
  const [received, setReceived] = useState<Record<string, boolean>>({})
  const queue = [...INBOUND].sort((a, b) => day(a.eta!) - day(b.eta!)).slice(0, 5)
  return (
    <Panel title="Antrean penerimaan" description="Lima kedatangan terdekat" className="lg:col-span-7" icon={Truck}>
      <ul className="divide-y">
        {queue.map((p: PurchaseOrder) => {
          const m = materialById(p.materialId)
          const done = received[p.id]
          const canReceive = p.status === 'Dikirim' && day(p.eta!) <= 11
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="w-14 shrink-0 text-center">
                <div className="tnum text-lg leading-none font-semibold text-fg">{day(p.eta!)}</div>
                <div className="text-[10.5px] text-fg-subtle">Nov</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-fg">{m.name} · <span className="tnum">{fmt(p.confirmedQty!)} {m.unit}</span></div>
                <div className="text-xs text-fg-muted"><Mono className="text-xs">{p.id}</Mono> · {supplierById(p.supplierId).alias} · {p.status === 'Dikirim' ? 'dalam perjalanan' : p.status.toLowerCase()}</div>
              </div>
              {done ? (
                <Chip tone="success" icon={CheckCircle2}>Diterima (simulasi)</Chip>
              ) : canReceive ? (
                <Button size="sm" variant="outline" onClick={() => setReceived((r) => ({ ...r, [p.id]: true }))}>
                  <PackageCheck /> Konfirmasi terima
                </Button>
              ) : (
                <span className="text-xs text-fg-subtle">Belum tiba</span>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-subtle"><FlaskConical className="size-3.5" /> Konfirmasi terima hanya mengubah tampilan ini; stok SAP tidak berubah.</p>
    </Panel>
  )
}

function HoldsAndZones() {
  return (
    <div className="flex flex-col gap-5 lg:col-span-5">
      <Panel title="Quality hold" description="Tidak dihitung sebagai stok tersedia" icon={PauseCircle}>
        <ul className="space-y-2">
          {QUALITY_HOLDS.map((q) => {
            const m = materialById(q.materialId)
            return (
              <li key={q.id} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-warning" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-[13px]">
                    <span className="truncate font-medium text-fg">{m.name}</span>
                    <span className="tnum shrink-0 font-medium">{fmt(q.qty)} {m.unit}</span>
                  </div>
                  <div className="text-xs text-fg-muted">Lot {q.lot} · {q.reason} · sejak {q.since}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>
      <Panel title="Utilisasi area" icon={Warehouse}>
        <ul className="space-y-3">
          {WAREHOUSE_ZONES.map((z) => (
            <li key={z.zone}>
              <div className="mb-1 flex justify-between text-[13px]"><span className="text-fg">{z.zone}</span><span className="tnum text-fg-muted">{z.used}% · {z.capacity}</span></div>
              <Meter value={z.used} tone={z.used > 75 ? 'warning' : 'teal'} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function StockTable() {
  const rows = [...MATERIALS].sort((a, b) => a.onHand / a.safetyStock - b.onHand / b.safetyStock)
  return (
    <Panel title="Posisi stok RM/PM" description="On-hand terhadap safety stock (nilai dummy)" className="lg:col-span-12" bodyClassName="pb-1">
      <DataTable minWidth={820}>
        <thead>
          <tr><Th>Material</Th><Th align="right">On-hand</Th><Th align="right">In-transit</Th><Th align="right">Quality hold</Th><Th align="right">Safety stock</Th><Th className="w-[200px]">On-hand vs SS</Th></tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const hold = QUALITY_HOLDS.filter((q) => q.materialId === m.id).reduce((s, q) => s + q.qty, 0)
            const ratio = m.onHand / m.safetyStock
            return (
              <tr key={m.id} className="hover:bg-sunken">
                <Td><span className="font-medium whitespace-nowrap text-fg">{m.name}</span> <Mono className="ml-1 text-[11.5px] text-fg-subtle">{m.id}</Mono></Td>
                <Td align="right" className="font-medium">{fmt(m.onHand)} <span className="text-[11px] font-normal text-fg-subtle">{m.unit}</span></Td>
                <Td align="right" className={m.inTransit ? 'text-teal' : 'text-fg-subtle'}>{m.inTransit ? fmt(m.inTransit) : '—'}</Td>
                <Td align="right" className={hold ? 'text-warning' : 'text-fg-subtle'}>{hold ? fmt(hold) : '—'}</Td>
                <Td align="right" className="text-fg-muted">{fmt(m.safetyStock)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Meter value={Math.min(100, (ratio / 4) * 100)} tone={ratio < 2 ? 'warning' : 'teal'} />
                    <span className="tnum w-10 text-right text-xs text-fg-muted">{ratio.toFixed(1).replace('.', ',')}×</span>
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
    </Panel>
  )
}

export function WarehouseDashboard() {
  const inTransit = PURCHASE_ORDERS.filter((p) => p.status === 'Dikirim')
  return (
    <>
      <PageHeader
        eyebrow={<>Selamat pagi, Agus · Gudang RM/PM 01</>}
        title="Inventori & penerimaan"
        description={`${INBOUND.length} kedatangan terjadwal dalam 14 hari · ${inTransit.length} PO dalam perjalanan · ${QUALITY_HOLDS.length} lot quality hold.`}
        meta={<><SimTag /><SapTag /></>}
        actions={<Button variant="outline" asChild><Link to="/overview"><Network /> Integrated Overview</Link></Button>}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <ArrivalCalendar />
        <ReceivingQueue />
        <HoldsAndZones />
        <StockTable />
      </div>
    </>
  )
}
