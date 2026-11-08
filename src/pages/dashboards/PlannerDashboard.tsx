import { Link, useNavigate } from 'react-router'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, ArrowUpRight, CalendarClock, ClipboardCheck, Network, PackageSearch, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CHART, ChartTooltip, CoverageBar, Legend, axisProps } from '@/components/shared/charts'
import { MaterialFilterBar, MaterialTable, useMaterialFilter } from '@/components/shared/MaterialTable'
import {
  AlertCodeTag,
  Avatar,
  Chip,
  ExceptionStatusBadge,
  MaterialStatusBadge,
  Mono,
  PageHeader,
  Panel,
  PhaseTag,
  SapTag,
  SimTag,
} from '@/components/shared/ui-kit'
import { EXCEPTIONS, HORIZON_LABEL, MAIN, PARAMETER_PROPOSALS, POSITIONS, poById, statusCounts, supplierById, userById } from '@/data/mock'
import { fmt, fmtAge } from '@/lib/format'
import { cn } from '@/lib/utils'

/** 14-day cumulative view for M-100234 — derived from BATCHES & PO-04567 dates in mock.ts. */
const CUMULATIVE = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((d) => ({
  day: `${d} Nov`,
  kebutuhan: d >= 23 ? 50_000 : d >= 22 ? 35_000 : d >= 19 ? 20_000 : d >= 11 ? 5_000 : 0,
  aman: d >= 21 ? 35_000 : 5_000,
  rencana: d >= 18 ? 45_000 : 5_000,
}))

function FocusCase() {
  const po = poById('PO-04567')
  const sup = supplierById(po.supplierId)
  const exc = EXCEPTIONS.find((e) => e.id === 'EXC-0231')!
  const pic = userById(exc.pic!)
  const m = MAIN.material
  const facts = [
    { label: 'Kebutuhan 14 hari', value: fmt(m.need14), unit: m.unit },
    { label: 'Stok on-hand', value: fmt(m.onHand), unit: m.unit },
    { label: `${po.id} dipesan`, value: fmt(po.qty), unit: m.unit },
    { label: 'Terkonfirmasi', value: fmt(po.confirmedQty!), unit: m.unit, tone: 'text-teal' },
  ]
  return (
    <Panel className="lg:col-span-8" bodyClassName="pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 sm:flex-nowrap">
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="danger" icon={PackageSearch}>Fokus hari ini</Chip>
            <span className="flex items-center gap-1">
              {exc.triggers.map((t) => <AlertCodeTag key={t} code={t} />)}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-fg">
            {m.name} <Mono className="ml-1 text-sm font-normal text-fg-muted">{m.id}</Mono>
          </h2>
          <p className="mt-1 max-w-xl text-[13.5px] text-fg-muted">
            {sup.alias} mengonfirmasi {fmt(po.confirmedQty!)} dari {fmt(po.qty)} {m.unit} dan ETA mundur 3 hari. Stok + pasokan terkonfirmasi kini {fmt(MAIN.secured)} {m.unit}.
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="text-xs font-medium text-fg-muted">Kekurangan</div>
          <div className="tnum text-[34px] leading-none font-semibold tracking-tight text-danger">−{fmt(MAIN.gap)}</div>
          <div className="mt-1 text-xs text-fg-subtle">{m.unit} · {Math.round(MAIN.coverage * 100)}% kebutuhan tertutup</div>
        </div>
      </div>

      <div className="mt-5">
        <CoverageBar need={m.need14} onHand={m.onHand} confirmed={MAIN.confirmed} unit={m.unit} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-5">
        {facts.map((f) => (
          <div key={f.label} className="bg-surface px-3.5 py-3">
            <dt className="truncate text-[11.5px] text-fg-muted">{f.label}</dt>
            <dd className={cn('tnum mt-0.5 text-[17px] font-semibold text-fg', f.tone)}>
              {f.value} <span className="text-[11px] font-normal text-fg-subtle">{f.unit}</span>
            </dd>
          </div>
        ))}
        <div className="col-span-2 bg-surface px-3.5 py-3 sm:col-span-1">
          <dt className="text-[11.5px] text-fg-muted">ETA</dt>
          <dd className="mt-0.5 flex items-baseline gap-1.5 text-[15px] font-semibold text-fg">
            <span className="text-fg-subtle line-through decoration-1">18</span> 21 Nov
            <span className="rounded bg-danger-soft px-1 text-[11px] text-danger">+3h</span>
          </dd>
        </div>
      </dl>

      <div className="-mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 border-t bg-sunken/70 px-5 py-3">
        <div className="flex items-center gap-2.5 text-[13px]">
          <Mono className="text-fg-muted">{exc.id}</Mono>
          <ExceptionStatusBadge status={exc.status} />
          <span className="flex items-center gap-1.5 text-fg-muted">
            <UserRound className="size-3.5" aria-hidden /> PIC <span className="font-medium text-fg">{pic.name.split(' ')[0]} · {pic.roleShort}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/exceptions">Ruang exception <PhaseTag className="ml-0.5" /></Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/overview?material=M-100234">
              Lihat jejak end-to-end <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </Panel>
  )
}

function Portfolio() {
  const c = statusCounts()
  const total = POSITIONS.length
  const atRisk = c.Shortage + c.Waspada
  const segs = [
    { k: 'Shortage' as const, n: c.Shortage, cls: 'bg-danger', hint: 'Stok + terkonfirmasi < kebutuhan' },
    { k: 'Waspada' as const, n: c.Waspada, cls: 'bg-warning', hint: 'Tertutup, tetapi di bawah buffer' },
    { k: 'Aman' as const, n: c.Aman, cls: 'bg-success', hint: 'Tertutup termasuk safety stock' },
  ]
  return (
    <Panel title="Status 12 SKU aktif" description={HORIZON_LABEL} className="lg:col-span-4">
      <div className="flex items-baseline gap-2">
        <span className="tnum text-[40px] leading-none font-semibold tracking-tight text-fg">{atRisk}</span>
        <span className="text-sm text-fg-muted">dari {total} SKU perlu perhatian</span>
      </div>
      <div className="mt-4 flex h-2.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`${c.Shortage} shortage, ${c.Waspada} waspada, ${c.Aman} aman`}>
        {segs.map((s) => <div key={s.k} className={s.cls} style={{ width: `${(s.n / total) * 100}%` }} />)}
      </div>
      <ul className="mt-4 divide-y">
        {segs.map((s) => (
          <li key={s.k} className="flex items-center justify-between py-2.5">
            <div>
              <MaterialStatusBadge status={s.k} />
              <p className="mt-1 text-xs text-fg-subtle">{s.hint}</p>
            </div>
            <span className="tnum text-xl font-semibold text-fg">{s.n}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 rounded-lg bg-sunken px-3 py-2.5 text-xs text-fg-muted">
        Status dihitung dari aturan A1 (horizon 14 hari). Ambang buffer = safety stock per SKU — <span className="font-medium">nilai dummy</span>.
      </div>
    </Panel>
  )
}

function CumulativeChart() {
  return (
    <Panel
      title="Kebutuhan vs pasokan aman · M-100234"
      description="Kumulatif per hari, 9–23 Nov. Celah di akhir horizon = kekurangan 15.000 pcs."
      className="lg:col-span-7"
      actions={<SimTag />}
    >
      <Legend
        className="mb-3"
        items={[
          { label: 'Kebutuhan kumulatif', color: CHART.blue },
          { label: 'Stok + terkonfirmasi', color: CHART.teal },
          { label: 'Rencana awal PO (40.000, 18 Nov)', color: CHART.ref, dashed: true },
        ]}
      />
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={CUMULATIVE} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="secured" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.teal} stopOpacity={0.18} />
                <stop offset="100%" stopColor={CHART.teal} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="day" {...axisProps} interval={1} padding={{ left: 4, right: 0 }} />
            <YAxis {...axisProps} width={48} tickFormatter={(v: number) => (v ? `${v / 1000}rb` : '0')} domain={[0, 55_000]} ticks={[0, 10_000, 20_000, 30_000, 40_000, 50_000]} />
            <ReferenceArea x1="23 Nov" x2="24 Nov" y1={35_000} y2={50_000} fill={CHART.danger} fillOpacity={0.08} stroke={CHART.danger} strokeOpacity={0.35} strokeDasharray="3 3" label={{ value: '−15rb', position: 'insideLeft', fill: CHART.danger, fontSize: 11, fontWeight: 600 }} />
            <ReferenceLine x="21 Nov" stroke={CHART.teal} strokeDasharray="2 3" label={{ value: 'ETA baru', position: 'insideTopLeft', fill: CHART.axis, fontSize: 11 }} />
            <ReferenceLine x="18 Nov" stroke={CHART.ref} strokeDasharray="2 3" label={{ value: 'ETA awal', position: 'insideTopRight', fill: CHART.axis, fontSize: 11 }} />
            <Tooltip content={<ChartTooltip unit="pcs" />} cursor={{ stroke: CHART.grid, strokeWidth: 1 }} />
            <Line type="stepAfter" dataKey="rencana" name="Rencana awal PO" stroke={CHART.ref} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            <Area type="stepAfter" dataKey="aman" name="Stok + terkonfirmasi" stroke={CHART.teal} strokeWidth={2} fill="url(#secured)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
            <Line type="stepAfter" dataKey="kebutuhan" name="Kebutuhan kumulatif" stroke={CHART.blue} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function ExceptionFeed() {
  const items = EXCEPTIONS.filter((e) => e.status !== 'Selesai')
  return (
    <Panel
      title="Exception terbuka"
      description={`${items.length} kasus · diurutkan menurut dampak`}
      className="lg:col-span-5"
      actions={
        <Button variant="ghost" size="sm" className="text-brand" asChild>
          <Link to="/exceptions">Semua <ArrowUpRight /></Link>
        </Button>
      }
    >
      <ul className="-mx-2 space-y-1">
        {items.map((e) => {
          const pic = e.pic ? userById(e.pic) : null
          return (
            <li key={e.id}>
              <Link to="/exceptions" className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-sunken">
                <span
                  className={cn('mt-1 w-1 shrink-0 self-stretch rounded-full', e.status === 'Eskalasi' ? 'bg-danger' : e.triggers.includes('A1') ? 'bg-danger/60' : 'bg-warning')}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Mono className="text-xs text-fg-subtle">{e.id}</Mono>
                    <span className="flex gap-1">{e.triggers.map((t) => <AlertCodeTag key={t} code={t} />)}</span>
                  </div>
                  <div className="mt-1 truncate text-[13.5px] font-medium text-fg">{e.title}</div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-fg-muted">
                    <ExceptionStatusBadge status={e.status} />
                    <span className="flex items-center gap-1">
                      {pic ? <Avatar initials={pic.initials} className="size-5 text-[9px]" tone="light" /> : null}
                      {pic ? pic.name.split(' ')[0] : 'Tanpa PIC'}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-fg-subtle"><CalendarClock className="size-3" aria-hidden />{fmtAge(e.ageHours)}</span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 rounded-lg border border-dashed px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-fg">
            <ClipboardCheck className="size-4 text-fg-subtle" aria-hidden /> Usulan parameter SKU
          </span>
          <PhaseTag />
        </div>
        <p className="mt-1 text-xs text-fg-muted">
          {PARAMETER_PROPOSALS.length} usulan Anda menunggu persetujuan SC Manager — mis. safety stock M-100234 {PARAMETER_PROPOSALS[0].from} → {PARAMETER_PROPOSALS[0].to}.
        </p>
      </div>
    </Panel>
  )
}

export function PlannerDashboard() {
  const navigate = useNavigate()
  const ctl = useMaterialFilter()
  return (
    <>
      <PageHeader
        eyebrow={<>Selamat pagi, Budi · Senin, 9 Nov 2026</>}
        title="Kebutuhan & stok material"
        description="Keselarasan kebutuhan, stok, PO, dan call-off untuk seluruh SKU aktif — satu versi angka dari SAP."
        meta={<><SimTag /><SapTag /></>}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/overview"><Network /> Integrated Overview</Link>
            </Button>
            <Button asChild>
              <Link to="/material-alignment">Material Alignment <ArrowRight /></Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <FocusCase />
        <Portfolio />
        <Panel
          title="Material Alignment"
          description="Kebutuhan 14 hari dibanding stok dan pasokan terkonfirmasi. Klik baris untuk menelusuri di Integrated Overview."
          className="lg:col-span-12"
          actions={<MaterialFilterBar ctl={ctl} searchable={false} />}
          bodyClassName="pb-1"
        >
          <MaterialTable rows={ctl.filtered.slice(0, 8)} onSelect={(id) => navigate(`/overview?material=${id}`)} />
          {ctl.filtered.length > 8 && (
            <div className="flex justify-center py-3">
              <Button variant="ghost" size="sm" className="text-brand" asChild>
                <Link to="/material-alignment">Tampilkan {ctl.filtered.length - 8} SKU lainnya <ArrowRight /></Link>
              </Button>
            </div>
          )}
        </Panel>
        <CumulativeChart />
        <ExceptionFeed />
      </div>
    </>
  )
}
