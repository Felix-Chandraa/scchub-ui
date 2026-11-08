import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CalendarCog, CheckCircle2, Factory, FlaskConical, Network, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Chip, DataTable, MaterialStatusBadge, Mono, PageHeader, Panel, SapTag, SimTag, Td, Th } from '@/components/shared/ui-kit'
import { BATCHES, MAIN, materialById, positionById } from '@/data/mock'
import type { MaterialStatus, ProductionBatch } from '@/data/types'
import { fmt } from '@/lib/format'
import { cn } from '@/lib/utils'

const DAYS = Array.from({ length: 15 }, (_, i) => 10 + i) // 10–24 Nov
const LINES = ['Lini 1', 'Lini 2', 'Lini 3', 'Lini 4']
const BLOCK: Record<MaterialStatus, string> = {
  Aman: 'border-success/40 bg-success-soft text-success',
  Waspada: 'border-warning/50 bg-warning-soft text-warning',
  Shortage: 'border-danger/50 bg-danger-soft text-danger',
}
const dayOf = (b: ProductionBatch) => Number(b.date.split(' ')[0])

function Schedule() {
  const col = (d: number) => d - 10 + 2 // grid column (1 = line label)
  return (
    <Panel
      title="Jadwal produksi 14 hari"
      description="10–24 Nov · setiap blok = satu batch (2 hari). Warna = kesiapan material untuk batch tersebut."
      className="lg:col-span-12"
      icon={CalendarCog}
      actions={<SimTag />}
    >
      <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[72px_repeat(15,minmax(0,1fr))] border-b pb-2 text-[11px] text-fg-subtle">
            <span />
            {DAYS.map((d) => (
              <span key={d} className={cn('text-center', d === 21 && 'font-semibold text-teal')}>
                {d}
                <span className="block text-[10px]">{['Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min', 'Sen'][(d - 10) % 7]}</span>
              </span>
            ))}
          </div>
          <div className="relative">
            {/* ETA marker for PO-04567 */}
            <div className="pointer-events-none absolute top-0 bottom-0 z-10 border-l-2 border-dashed border-teal/60" style={{ left: `calc(72px + (100% - 72px) * ${(21 - 10) / 15})` }} aria-hidden>
              <span className="absolute -top-0.5 left-1 rounded bg-teal px-1 text-[10px] font-semibold whitespace-nowrap text-white">Box tiba 21 Nov</span>
            </div>
            <div className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-fg-subtle/40" style={{ left: `calc(72px + (100% - 72px) * ${(18 - 10) / 15})` }} aria-hidden>
              <span className="absolute top-5 left-1 text-[10px] whitespace-nowrap text-fg-subtle">ETA awal 18</span>
            </div>
            {LINES.map((line) => (
              <div key={line} className="grid h-[64px] grid-cols-[72px_repeat(15,minmax(0,1fr))] items-center border-b border-dashed last:border-0">
                <span className="text-[12px] font-medium text-fg-muted">{line}</span>
                {BATCHES.filter((b) => b.line === line).map((b) => (
                  <Tooltip key={b.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn('mx-0.5 flex h-[46px] min-w-0 cursor-default flex-col justify-center rounded-md border px-2', BLOCK[b.readiness])}
                        style={{ gridColumn: `${col(dayOf(b))} / span 2`, gridRow: 1 }}
                        tabIndex={0}
                      >
                        <span className="truncate text-[11.5px] font-semibold">{b.product}</span>
                        <span className="truncate text-[10.5px] opacity-80">{b.id} · {fmt(b.qty)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      <div className="font-semibold">{b.product}</div>
                      <div>{b.date} · {fmt(b.qty)} pcs · {b.readiness}</div>
                      <div className="opacity-80">{b.note}</div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}

function AffectedBatches() {
  const affected = BATCHES.filter((b) => b.readiness !== 'Aman')
  return (
    <Panel title="Batch terdampak" description="Material kritis dan dampak exception ke jadwal" className="lg:col-span-8" bodyClassName="pb-1">
      <DataTable minWidth={680}>
        <thead>
          <tr><Th>Batch</Th><Th>Tanggal</Th><Th>Prioritas</Th><Th>Material kritis</Th><Th>Kesiapan</Th></tr>
        </thead>
        <tbody>
          {affected.map((b) => {
            const crit = b.materials.map((x) => positionById(x.materialId)).find((p) => p.status !== 'Aman') ?? positionById(b.materials[0].materialId)
            return (
              <tr key={b.id} className="hover:bg-sunken">
                <Td>
                  <div className="font-medium whitespace-nowrap text-fg">{b.product}</div>
                  <div className="text-[11.5px] text-fg-subtle"><Mono className="text-[11.5px]">{b.id}</Mono> · {b.line} · <span className="tnum">{fmt(b.qty)} pcs</span></div>
                </Td>
                <Td className="whitespace-nowrap">{b.date.replace(' 2026', '')}</Td>
                <Td><Chip tone={b.priority === 'Tinggi' ? 'danger' : 'neutral'}>{b.priority}</Chip></Td>
                <Td>
                  <div className="whitespace-nowrap text-fg">{crit.material.name}</div>
                  <div className="text-[11.5px] text-fg-muted">{b.note}</div>
                </Td>
                <Td><MaterialStatusBadge status={b.readiness} /></Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
    </Panel>
  )
}

function ReplanSuggestion() {
  const [recorded, setRecorded] = useState(false)
  const box = materialById(MAIN.material.id)
  return (
    <Panel title="Keputusan replan" description="Dampak EXC-0231 ke jadwal" className="lg:col-span-4" icon={Factory}>
      <div className="rounded-xl border bg-sunken p-4">
        <div className="text-[13px] text-fg-muted">Opsi yang disiapkan untuk diputuskan</div>
        <div className="mt-2 text-[15px] font-semibold text-fg">Geser BT-2611-08 Serum 19 → 22 Nov</div>
        <p className="mt-1 text-[13px] text-fg-muted">
          {box.name} baru tiba 21 Nov (+3 hari), sehingga batch 19 Nov tidak dapat dikemas tepat waktu. BT-2611-10 ikut bergeser ke 24 Nov di Lini 1.
        </p>
        <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12.5px] text-fg-muted ring-1 ring-border">
          BT-2611-10 tetap <span className="font-semibold text-danger">kurang {fmt(MAIN.gap)} pcs</span> sampai ada usulan PO ke supplier alternatif.
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {recorded ? (
          <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2.5 text-[13px] font-medium text-success">
            <CheckCircle2 className="size-4" /> Keputusan tercatat di riwayat exception (simulasi)
          </div>
        ) : (
          <Button onClick={() => setRecorded(true)}>Catat keputusan replan</Button>
        )}
        <p className="flex items-center gap-1.5 text-xs text-fg-subtle"><FlaskConical className="size-3.5" /> Simulasi lokal — jadwal SAP PP tidak berubah.</p>
      </div>
    </Panel>
  )
}

export function PpicDashboard() {
  const c = { Aman: 0, Waspada: 0, Shortage: 0 } as Record<MaterialStatus, number>
  BATCHES.forEach((b) => c[b.readiness]++)
  const stats = [
    { label: 'Batch 14 hari', value: BATCHES.length, tone: 'text-fg', icon: PackageOpen },
    { label: 'Material siap', value: c.Aman, tone: 'text-success' },
    { label: 'Waspada', value: c.Waspada, tone: 'text-warning' },
    { label: 'Terdampak shortage', value: c.Shortage, tone: 'text-danger' },
  ]
  return (
    <>
      <PageHeader
        eyebrow={<>Selamat pagi, Dewi · Production Planning</>}
        title="Produksi & kesiapan material"
        description="Jadwal produksi dari SAP dipadankan dengan ketersediaan material per batch. Prioritaskan batch yang terancam."
        meta={<><SimTag /><SapTag /></>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/overview"><Network /> Integrated Overview</Link></Button>
            <Button asChild><Link to="/material-alignment">Material Alignment <ArrowRight /></Link></Button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 divide-x overflow-hidden rounded-xl border bg-surface shadow-[var(--shadow-card)] md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4 max-md:[&:nth-child(3)]:border-l-0 max-md:[&:nth-child(n+3)]:border-t">
            <div className="text-[12.5px] font-medium text-fg-muted">{s.label}</div>
            <div className={cn('tnum mt-1 text-[28px] leading-none font-semibold', s.tone)}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <Schedule />
        <AffectedBatches />
        <ReplanSuggestion />
      </div>
    </>
  )
}
