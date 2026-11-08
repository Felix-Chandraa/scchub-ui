import { useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FlaskConical, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CHART, ChartTooltip, Legend, axisProps } from '@/components/shared/charts'
import { Chip, MaterialStatusBadge, Mono, PageHeader, Panel, SapTag, SimTag } from '@/components/shared/ui-kit'
import { DEMAND_CHANGES, FORECAST_WEEKS, PRODUCT_READINESS, type DemandChange } from '@/data/mock'
import { accessFor } from '@/lib/nav'
import { useSession } from '@/lib/session'

const PRODUCTS = PRODUCT_READINESS.map((p) => p.product)

function DemandForm({ onSubmit }: { onSubmit: (d: DemandChange) => void }) {
  const [type, setType] = useState<DemandChange['type']>('Promo')
  const [product, setProduct] = useState(PRODUCTS[0])
  const [title, setTitle] = useState('')
  const [delta, setDelta] = useState('')
  const [period, setPeriod] = useState('')
  const valid = title.trim() && delta.trim() && period.trim()
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        const r = PRODUCT_READINESS.find((p) => p.product === product)!
        onSubmit({ id: 'DC-NEW', type, title, product, delta, period, status: 'Draf', readiness: r.status, readinessNote: r.driver === '—' ? 'Tidak ada kendala material' : `Perlu cek ${r.driver}` })
        setTitle('')
        setDelta('')
        setPeriod('')
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-2">Jenis</Label>
          <Select value={type} onValueChange={(v) => setType(v as DemandChange['type'])}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{(['Promo', 'NPD', 'Penyesuaian forecast'] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2">Produk</Label>
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="dt" className="mb-2">Judul</Label>
        <Input id="dt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Promo Harbolnas" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dd" className="mb-2">Perubahan</Label>
          <Input id="dd" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+15%" />
        </div>
        <div>
          <Label htmlFor="dp" className="mb-2">Periode</Label>
          <Input id="dp" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="1 – 14 Des" />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" /> Simulasi: perubahan tersimpan di layar ini saja dan tidak mengubah forecast SAP.
      </div>
      <Button type="submit" disabled={!valid} className="w-full"><Send /> Kirim ke Planner</Button>
    </form>
  )
}

export function Planning() {
  const { user } = useSession()
  const access = user ? accessFor(user.id, 'planning') : null
  const canEdit = access === 'Kelola'
  const [items, setItems] = useState(DEMAND_CHANGES)
  return (
    <>
      <PageHeader
        title="Planning & Forecast"
        description="Forecast dasar dari SAP, perubahan demand (promo, NPD, penyesuaian), dan kesiapan material untuk produk yang direncanakan."
        meta={<>{access && <Chip tone="info">Akses Anda: {access}</Chip>}<SimTag /><SapTag /></>}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel title="Forecast mingguan" description="Ribu unit barang jadi · batang = forecast dasar SAP, garis = setelah perubahan" className={canEdit ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Legend className="mb-3" items={[{ label: 'Forecast dasar (SAP)', color: CHART.base, swatch: 'dot' }, { label: 'Setelah perubahan demand', color: CHART.blue }]} />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={FORECAST_WEEKS} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="week" {...axisProps} />
                <YAxis {...axisProps} domain={[0, 260]} />
                <Tooltip content={<ChartTooltip unit="rb unit" />} cursor={{ fill: 'rgb(16 28 50 / 0.03)' }} />
                <Bar dataKey="base" name="Forecast dasar" fill={CHART.base} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Line type="monotone" dataKey="adjusted" name="Setelah perubahan" stroke={CHART.blue} strokeWidth={2} dot={{ r: 3, fill: CHART.blue, strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        {canEdit && (
          <Panel title="Kirim perubahan demand" description="Sinyal untuk Planner dan PPIC" className="lg:col-span-4">
            <DemandForm onSubmit={(d) => setItems((s) => [{ ...d, id: `DC-${127 + s.length - DEMAND_CHANGES.length}` }, ...s])} />
          </Panel>
        )}
        <Panel title="Perubahan demand" description={`${items.length} perubahan · status tinjauan Planner`} className="lg:col-span-12">
          <ul className="divide-y">
            {items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <Mono className="w-14 text-xs text-fg-muted">{d.id}</Mono>
                <div className="min-w-[200px] flex-1">
                  <div className="text-[13.5px] font-medium text-fg">{d.title} <span className="font-normal text-fg-muted">· {d.product}</span></div>
                  <div className="text-xs text-fg-muted">{d.type} · {d.period}</div>
                </div>
                <span className="tnum w-24 text-right font-semibold">{d.delta}</span>
                <Chip tone={d.status === 'Diterima Planner' ? 'teal' : d.status === 'Ditinjau' ? 'info' : 'neutral'}>{d.status}</Chip>
                <MaterialStatusBadge status={d.readiness} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
