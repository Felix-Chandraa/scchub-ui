import { Link } from 'react-router'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarRange, Megaphone, Network, Rocket, Send, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CHART, ChartTooltip, Legend, axisProps } from '@/components/shared/charts'
import { Chip, DataTable, MaterialStatusBadge, Meter, Mono, PageHeader, Panel, SapTag, SimTag, Td, Th, statusTone } from '@/components/shared/ui-kit'
import { CAMPAIGNS, DEMAND_CHANGES, FORECAST_WEEKS, PRODUCT_READINESS } from '@/data/mock'
import type { MaterialStatus } from '@/data/types'
import { cn } from '@/lib/utils'

const DOT: Record<MaterialStatus, string> = { Aman: 'bg-success', Waspada: 'bg-warning', Shortage: 'bg-danger' }

/** Campaign timeline 9 Nov → 15 Des (day index: Nov d = d, Des d = 30 + d). */
function CampaignTimeline() {
  const start = 9
  const end = 47
  const pos = (d: number) => `${((d - start) / (end - start)) * 100}%`
  const ticks = [
    { d: 9, l: '9 Nov' },
    { d: 16, l: '16 Nov' },
    { d: 23, l: '23 Nov' },
    { d: 30, l: '30 Nov' },
    { d: 37, l: '7 Des' },
    { d: 44, l: '14 Des' },
  ]
  return (
    <Panel
      title="Kalender promo & peluncuran"
      description="Kesiapan material untuk setiap momen demand · 9 Nov – 15 Des"
      className="lg:col-span-12"
      icon={CalendarRange}
      actions={
        <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-brand/45" aria-hidden />Horizon kebutuhan 14 hari</span>
          {(['Aman', 'Waspada', 'Shortage'] as MaterialStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5"><span className={cn('size-2.5 rounded-full', DOT[s])} aria-hidden />{s}</span>
          ))}
        </div>
      }
    >
      <div className="scrollbar-thin -mx-5 overflow-x-auto overflow-y-hidden px-5">
        <div className="relative min-w-[760px] pt-2 pb-1">
          {/* track */}
          <div className="relative h-[92px]">
            <div className="absolute top-[46px] right-0 left-0 h-1 rounded-full bg-neutral-soft" />
            <div className="absolute top-[45px] h-1.5 rounded-full bg-brand/45" style={{ left: pos(9), width: `calc(${pos(23)} - ${pos(9)})` }} aria-hidden />
            {CAMPAIGNS.map((c, i) => (
              <div key={c.id} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: pos(c.day), top: i % 2 ? 50 : 0 }}>
                {i % 2 === 0 && (
                  <div className="mb-1.5 rounded-lg border bg-surface px-2.5 py-1 text-center shadow-[var(--shadow-card)]">
                    <div className="text-[12px] font-semibold whitespace-nowrap text-fg">{c.name}</div>
                    <div className="text-[10.5px] text-fg-muted">{c.date}</div>
                  </div>
                )}
                <span className={cn('size-3.5 rounded-full ring-4 ring-surface', DOT[c.status])} aria-label={`${c.name}: ${c.status}`} />
                {i % 2 === 1 && (
                  <div className="mt-1.5 rounded-lg border bg-surface px-2.5 py-1 text-center shadow-[var(--shadow-card)]">
                    <div className="text-[12px] font-semibold whitespace-nowrap text-fg">{c.name}</div>
                    <div className="text-[10.5px] text-fg-muted">{c.date}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="relative mt-10 h-4 border-t">
            {ticks.map((t) => (
              <span key={t.d} className="absolute top-1 -translate-x-1/2 text-[10.5px] whitespace-nowrap text-fg-subtle" style={{ left: pos(t.d) }}>{t.l}</span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}

function ForecastChart() {
  const range = FORECAST_WEEKS.slice(2, 8)
  const base = range.reduce((s, w) => s + w.base, 0)
  const adj = range.reduce((s, w) => s + w.adjusted, 0)
  const uplift = ((adj - base) / base) * 100
  return (
    <Panel
      title="Forecast demand · semua produk"
      description="Forecast dasar dari SAP vs setelah perubahan promo/NPD · ribu unit barang jadi per minggu"
      className="lg:col-span-7"
      actions={<SimTag />}
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <Legend items={[{ label: 'Setelah perubahan demand', color: CHART.blue }, { label: 'Forecast dasar (SAP)', color: CHART.ref, dashed: true }]} />
        <div className="text-right">
          <div className="tnum text-xl font-semibold text-fg">+{uplift.toFixed(1).replace('.', ',')}%</div>
          <div className="text-[11.5px] text-fg-muted">uplift W46–W51</div>
        </div>
      </div>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={FORECAST_WEEKS} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <ReferenceArea x1="W46" x2="W51" fill={CHART.blue} fillOpacity={0.04} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} domain={[140, 260]} ticks={[140, 170, 200, 230, 260]} />
            <Tooltip content={<ChartTooltip unit="rb unit" />} cursor={{ stroke: CHART.grid }} />
            <Line type="monotone" dataKey="base" name="Forecast dasar" stroke={CHART.ref} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="adjusted" name="Setelah perubahan" stroke={CHART.blue} strokeWidth={2} dot={{ r: 3, fill: CHART.blue, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function Readiness() {
  return (
    <Panel title="Kesiapan material per produk" description="Persentase kebutuhan material yang sudah tertutup" className="lg:col-span-5">
      <ul className="space-y-3.5">
        {PRODUCT_READINESS.map((p) => (
          <li key={p.product}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium text-fg">{p.product}</div>
                <div className="truncate text-[11.5px] text-fg-subtle">{p.launch}{p.driver !== '—' && ` · kendala ${p.driver}`}</div>
              </div>
              <MaterialStatusBadge status={p.status} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Meter value={p.ready} tone={statusTone(p.status)} label={`${p.product} ${p.ready}% siap`} />
              <span className="tnum w-9 text-right text-xs text-fg-muted">{p.ready}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

const TYPE_ICON = { Promo: Megaphone, NPD: Rocket, 'Penyesuaian forecast': SlidersHorizontal }

function DemandChanges() {
  return (
    <Panel
      title="Perubahan demand yang Anda kirim"
      description="Status tinjauan Planner dan dampaknya ke kesiapan material"
      className="lg:col-span-12"
      bodyClassName="pb-1"
      actions={<Button size="sm" asChild><Link to="/planning"><Send /> Kirim perubahan demand</Link></Button>}
    >
      <DataTable minWidth={860}>
        <thead>
          <tr><Th>Perubahan</Th><Th>Produk</Th><Th align="right">Dampak</Th><Th>Periode</Th><Th>Status</Th><Th>Kesiapan material</Th></tr>
        </thead>
        <tbody>
          {DEMAND_CHANGES.map((d) => {
            const Icon = TYPE_ICON[d.type]
            return (
              <tr key={d.id} className="hover:bg-sunken">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Icon className="size-4" aria-hidden /></span>
                    <div>
                      <div className="font-medium whitespace-nowrap text-fg">{d.title}</div>
                      <div className="text-[11.5px] text-fg-subtle"><Mono className="text-[11.5px]">{d.id}</Mono> · {d.type}</div>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap">{d.product}</Td>
                <Td align="right" className="font-semibold whitespace-nowrap">{d.delta}</Td>
                <Td className="whitespace-nowrap text-fg-muted">{d.period}</Td>
                <Td><Chip tone={d.status === 'Diterima Planner' ? 'teal' : d.status === 'Ditinjau' ? 'info' : 'neutral'}>{d.status}</Chip></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <MaterialStatusBadge status={d.readiness} />
                    <span className="text-xs whitespace-nowrap text-fg-muted">{d.readinessNote}</span>
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

export function MarketingDashboard() {
  return (
    <>
      <PageHeader
        eyebrow={<>Selamat pagi, Rina · Demand Planning</>}
        title="Demand & kesiapan material"
        description="Apakah material siap sebelum promo dan peluncuran? Forecast dasar dari SAP, perubahan demand dari tim Anda."
        meta={<><SimTag /><SapTag /></>}
        actions={<Button variant="outline" asChild><Link to="/overview"><Network /> Integrated Overview</Link></Button>}
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft/40 px-4 py-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
        <p className="text-[13.5px] text-fg">
          <span className="font-semibold">Promo 11.11 Serum Brightening berisiko.</span>{' '}
          <span className="text-fg-muted">Packaging Box M-100234 kurang 15.000 pcs setelah Supplier A hanya sanggup 30.000. Procurement sedang mencari supplier alternatif.</span>
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <CampaignTimeline />
        <ForecastChart />
        <Readiness />
        <DemandChanges />
      </div>
    </>
  )
}
