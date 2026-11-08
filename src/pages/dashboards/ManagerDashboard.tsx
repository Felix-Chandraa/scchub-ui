import { Link } from 'react-router'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Check, Clock4, Gavel, Network, Siren, TrendingUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CHART, ChartTooltip, axisProps } from '@/components/shared/charts'
import { AlertCodeTag, Avatar, DataTable, ExceptionStatusBadge, Mono, PageHeader, Panel, PhaseTag, POStatusBadge, SapTag, SimTag, Td, Th } from '@/components/shared/ui-kit'
import { CONFIRM_TIME_HOURS, EXCEPTIONS, OTD_TREND, PARAMETER_PROPOSALS, PURCHASE_ORDERS, etaSlip, materialById, openExceptions, supplierById } from '@/data/mock'
import { fmt, fmtAge } from '@/lib/format'
import { cn } from '@/lib/utils'

const AT_RISK = PURCHASE_ORDERS.filter((p) => p.partial || p.id === 'PO-04574')

function HeroKpi() {
  const last = OTD_TREND[OTD_TREND.length - 1]
  const prev = OTD_TREND[OTD_TREND.length - 2]
  const delta = last.otd - prev.otd
  return (
    <Panel className="lg:col-span-7" bodyClassName="pb-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-fg-muted">On-time delivery supplier · minggu W45</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="tnum text-[52px] leading-none font-semibold tracking-[-0.03em] text-fg">{last.otd.toFixed(1).replace('.', ',')}%</span>
            <span className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold', delta < 0 ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success')}>
              <TrendingUp className={cn('size-3.5', delta < 0 && 'rotate-180')} aria-hidden />
              {delta > 0 ? '+' : '−'}{Math.abs(delta).toFixed(1).replace('.', ',')} pt
            </span>
          </div>
          <p className="mt-2 text-[13px] text-fg-muted">Target ilustratif 90% · 8 minggu terakhir</p>
        </div>
        <SimTag />
      </div>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={OTD_TREND} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="otd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.18} />
                <stop offset="100%" stopColor={CHART.blue} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} domain={[75, 95]} ticks={[75, 80, 85, 90, 95]} tickFormatter={(v: number) => `${v}%`} />
            <ReferenceLine y={90} stroke={CHART.ref} strokeDasharray="4 4" label={{ value: 'Target 90%', position: 'insideTopRight', fill: CHART.axis, fontSize: 11 }} />
            <Tooltip content={<ChartTooltip unit="%" />} />
            <Area type="monotone" dataKey="otd" name="On-time delivery" stroke={CHART.blue} strokeWidth={2} fill="url(#otd)" dot={{ r: 3, fill: CHART.blue, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function SecondaryKpis() {
  const open = openExceptions()
  const oldest = Math.max(...open.map((e) => e.ageHours))
  const kpis = [
    { label: 'PO at risk', value: String(AT_RISK.length), unit: 'PO', note: '2 konfirmasi parsial · 1 hampir lewat batas', tone: 'danger' },
    { label: 'Rata-rata waktu konfirmasi', value: String(CONFIRM_TIME_HOURS).replace('.', ','), unit: 'jam', note: 'Supplier portal 26 jam · API 7 jam', tone: 'neutral' },
    { label: 'Exception terbuka', value: String(open.length), unit: 'kasus', note: `Tertua ${fmtAge(oldest)} · 1 eskalasi`, tone: 'warning' },
  ]
  return (
    <div className="grid gap-5 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
      {kpis.map((k) => (
        <div key={k.label} className="flex items-center justify-between gap-4 rounded-xl border bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-fg-muted">{k.label}</div>
            <div className="mt-1 truncate text-xs text-fg-subtle">{k.note}</div>
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className={cn('tnum text-[30px] leading-none font-semibold', k.tone === 'danger' ? 'text-danger' : k.tone === 'warning' ? 'text-warning' : 'text-fg')}>{k.value}</span>
            <span className="text-xs text-fg-muted">{k.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function EscalationQueue() {
  const esc = EXCEPTIONS.filter((e) => e.status === 'Eskalasi')
  return (
    <Panel title="Antrean eskalasi & persetujuan" description="Keputusan yang menunggu Anda" className="lg:col-span-7" icon={Gavel}>
      {esc.map((e) => {
        const m = materialById(e.materialId)
        return (
          <div key={e.id} className="rounded-xl border border-danger/30 bg-danger-soft/30 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Siren className="size-4 text-danger" aria-hidden />
              <Mono className="text-xs font-semibold">{e.id}</Mono>
              {e.triggers.map((t) => <AlertCodeTag key={t} code={t} />)}
              <AlertCodeTag code="A6" />
              <span className="ml-auto"><ExceptionStatusBadge status={e.status} /></span>
            </div>
            <div className="mt-2 text-[15px] font-semibold text-fg">{e.title}</div>
            <p className="mt-1 text-[13px] text-fg-muted">{e.impact} Tanpa PIC lebih dari 4 jam → eskalasi otomatis.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
              <span>{m.id} · {m.name}</span>·<span>dibuka {e.openedAt}</span>·<span>umur {fmtAge(e.ageHours)}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" disabled><Check /> Tetapkan PIC & alokasi ulang</Button>
              <Button size="sm" variant="outline" asChild><Link to="/exceptions">Buka ruang exception</Link></Button>
              <PhaseTag className="ml-1" />
            </div>
          </div>
        )
      })}
      <h3 className="mt-5 mb-2 flex items-center gap-2 text-[13px] font-semibold text-fg">
        Usulan parameter SKU <PhaseTag />
      </h3>
      <ul className="divide-y rounded-xl border">
        {PARAMETER_PROPOSALS.map((p) => {
          const m = materialById(p.materialId)
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Avatar initials="BS" tone="light" className="size-7 text-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-fg">{p.field} {m.name}: <span className="tnum text-fg-muted line-through">{p.from}</span> → <span className="tnum">{p.to}</span></div>
                <div className="text-xs text-fg-muted">{p.by} · {p.reason}</div>
              </div>
              <div className="flex gap-1.5">
                <Button size="icon-sm" variant="outline" disabled aria-label="Tolak (Fase 2)"><X /></Button>
                <Button size="icon-sm" variant="outline" disabled aria-label="Setujui (Fase 2)"><Check /></Button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs text-fg-subtle">Alur persetujuan Planner → SC Manager → Admin ditampilkan sebagai pratinjau; tombol aktif di Fase 2.</p>
    </Panel>
  )
}

function ExceptionAging() {
  const open = openExceptions()
  const buckets = [
    { b: '< 4 jam', n: open.filter((e) => e.ageHours < 4).length, color: CHART.teal },
    { b: '4–24 jam', n: open.filter((e) => e.ageHours >= 4 && e.ageHours < 24).length, color: CHART.blue },
    { b: '1–2 hari', n: open.filter((e) => e.ageHours >= 24 && e.ageHours < 48).length, color: CHART.warning },
    { b: '> 2 hari', n: open.filter((e) => e.ageHours >= 48).length, color: CHART.danger },
  ]
  return (
    <Panel title="Umur exception" description="Kasus terbuka · A6 berlaku > 2 hari kerja" className="lg:col-span-5" icon={Clock4}>
      <div className="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 3]} />
            <YAxis type="category" dataKey="b" {...axisProps} width={68} />
            <Tooltip content={<ChartTooltip unit="kasus" />} cursor={{ fill: 'rgb(16 28 50 / 0.04)' }} />
            <Bar dataKey="n" name="Exception" radius={[0, 4, 4, 0]} barSize={18} background={{ fill: 'var(--neutral-soft)', radius: 4 }}>
              {buckets.map((b) => <Cell key={b.b} fill={b.color} />)}
              <LabelList dataKey="n" position="right" fill="var(--text-primary)" fontSize={12} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 divide-y border-t">
        {open.sort((a, b) => b.ageHours - a.ageHours).map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-2 text-[13px]">
            <Mono className="text-xs text-fg-muted">{e.id}</Mono>
            <span className="min-w-0 flex-1 truncate text-fg">{materialById(e.materialId).name}</span>
            <span className="tnum text-xs text-fg-muted">{fmtAge(e.ageHours)}</span>
            <ExceptionStatusBadge status={e.status} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function AtRiskTable() {
  const reason: Record<string, string> = {
    'PO-04567': 'Konfirmasi 75% · ETA +3 hari → shortage 15.000 pcs',
    'PO-04573': 'Konfirmasi 67% → shortage 2.800 pcs',
    'PO-04574': 'Belum dikonfirmasi · batas < 24 jam',
  }
  return (
    <Panel title="PO at risk" className="lg:col-span-12" bodyClassName="pb-1" actions={<Button variant="ghost" size="sm" className="text-brand" asChild><Link to="/purchase-orders">Semua PO <ArrowRight /></Link></Button>}>
      <DataTable minWidth={820}>
        <thead>
          <tr><Th>PO</Th><Th>Material</Th><Th>Supplier</Th><Th align="right">Qty</Th><Th align="right">Terkonfirmasi</Th><Th>ETA</Th><Th>Status</Th><Th>Alasan risiko</Th></tr>
        </thead>
        <tbody>
          {AT_RISK.map((p) => {
            const m = materialById(p.materialId)
            return (
              <tr key={p.id} className="hover:bg-sunken">
                <Td><Mono className="font-semibold">{p.id}</Mono></Td>
                <Td className="whitespace-nowrap">{m.name}</Td>
                <Td className="whitespace-nowrap text-fg-muted">{supplierById(p.supplierId).alias}</Td>
                <Td align="right">{fmt(p.qty)}</Td>
                <Td align="right" className="font-medium">{p.confirmedQty != null ? fmt(p.confirmedQty) : '—'}</Td>
                <Td className="whitespace-nowrap">{p.eta ? <>{p.eta.replace(' 2026', '')}{etaSlip(p) > 0 && <span className="ml-1 text-xs text-warning">+{etaSlip(p)}h</span>}</> : '—'}</Td>
                <Td><POStatusBadge po={p} /></Td>
                <Td className="text-fg-muted">{reason[p.id]}</Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
    </Panel>
  )
}

export function ManagerDashboard() {
  return (
    <>
      <PageHeader
        eyebrow={<>Ringkasan eksekutif · Senin, 9 Nov 2026</>}
        title="KPI rantai pasok & eskalasi"
        description="Kinerja pemenuhan supplier, risiko PO, dan keputusan yang menunggu Anda."
        meta={<><SimTag /><SapTag /></>}
        actions={<Button variant="outline" asChild><Link to="/overview"><Network /> Integrated Overview</Link></Button>}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <HeroKpi />
        <SecondaryKpis />
        <EscalationQueue />
        <ExceptionAging />
        <AtRiskTable />
      </div>
    </>
  )
}
