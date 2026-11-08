import { Clock3, FileSpreadsheet, FileText, Hourglass, MessageSquareText, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Chip, DataTable, Meter, Mono, PageHeader, Panel, PhaseTag, POStatusBadge, SimTag, Td, Th } from '@/components/shared/ui-kit'
import { INTEGRATION_LOG, PURCHASE_ORDERS, SUPPLIER_SCORES, materialById, supplierById } from '@/data/mock'
import { fmt } from '@/lib/format'
import { NAV, accessFor, type NavKey } from '@/lib/nav'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

function SoonButton({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant="outline" size="sm" disabled className="pointer-events-none">
            {children}
            <span className="ml-1 rounded bg-neutral-soft px-1 text-[10px] font-semibold text-fg-muted">Segera hadir</span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Belum aktif di prototipe V1</TooltipContent>
    </Tooltip>
  )
}

function Collaboration() {
  const threads = PURCHASE_ORDERS.filter((p) => p.status === 'Diterbitkan' || p.partial)
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Panel title="Permintaan ke supplier" description="Konfirmasi yang ditunggu dan kekurangan yang perlu dialokasikan ulang" className="lg:col-span-8" actions={<SimTag />}>
        <ul className="divide-y">
          {threads.map((p) => {
            const m = materialById(p.materialId)
            const s = supplierById(p.supplierId)
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <MessageSquareText className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13.5px] font-medium text-fg">
                    {s.name} <span className="text-xs font-normal text-fg-subtle">· {s.channel}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-fg-muted">
                    <Mono className="text-xs">{p.id}</Mono> · {m.name} · {fmt(p.qty)} {m.unit}
                    {p.partial && ` · kurang ${fmt(p.qty - (p.confirmedQty ?? 0))} ${m.unit}`}
                    {p.confirmDeadline && ` · batas ${p.confirmDeadline}`}
                  </div>
                </div>
                <POStatusBadge po={p} />
              </li>
            )
          })}
        </ul>
      </Panel>
      <Panel title="Yang akan tersedia" className="lg:col-span-4">
        <ul className="space-y-3 text-[13px] text-fg-muted">
          {['Kirim permintaan konfirmasi & pengingat ke portal supplier', 'Minta supplier alternatif menutup kekurangan (mis. Supplier B untuk 15.000 pcs box)', 'Riwayat komunikasi per PO, menggantikan email & WhatsApp'].map((t) => (
            <li key={t} className="flex gap-2.5"><Sparkles className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />{t}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <SoonButton><Send /> Kirim permintaan</SoonButton>
        </div>
      </Panel>
    </div>
  )
}

function Performance() {
  return (
    <Panel title="Scorecard supplier" description="8 minggu terakhir · nilai indikatif untuk pratinjau" actions={<><PhaseTag /><SimTag /></>}>
      <DataTable minWidth={720}>
        <thead>
          <tr>
            <Th>Supplier</Th>
            <Th>Kanal</Th>
            <Th className="w-[220px]">On-time delivery</Th>
            <Th align="right">Waktu konfirmasi</Th>
            <Th align="right">Fill rate PO berjalan</Th>
          </tr>
        </thead>
        <tbody>
          {SUPPLIER_SCORES.map((r) => {
            const s = supplierById(r.supplierId)
            return (
              <tr key={s.id} className="hover:bg-sunken">
                <Td>
                  <div className="font-medium text-fg">{s.name}</div>
                  <div className="text-xs text-fg-subtle">{s.alias}</div>
                </Td>
                <Td className="text-fg-muted">{s.channel}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Meter value={r.otd} tone={r.otd >= 90 ? 'success' : r.otd >= 85 ? 'warning' : 'danger'} className="w-28" />
                    <span className="tnum text-xs font-medium">{r.otd}%</span>
                  </div>
                </Td>
                <Td align="right">{r.confirmHours} jam</Td>
                <Td align="right" className={cn(r.fillRate < 100 && 'font-semibold text-warning')}>{r.fillRate}%</Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
    </Panel>
  )
}

function Reports({ isAdmin }: { isAdmin: boolean }) {
  const reports = [
    { icon: FileSpreadsheet, t: 'Rekap shortage mingguan', d: 'Menggantikan rekap manual ±1 minggu' },
    { icon: FileText, t: 'Status PO & konfirmasi supplier', d: 'Per supplier, per periode' },
    { icon: Clock3, t: 'Umur exception & eskalasi', d: 'Untuk review SC Manager' },
  ]
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Panel title="Template laporan" className={isAdmin ? 'lg:col-span-5' : 'lg:col-span-12'} actions={<SimTag />}>
        <ul className={cn('grid gap-3', !isAdmin && 'sm:grid-cols-3')}>
          {reports.map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-3 rounded-lg border p-3.5">
              <Icon className="mt-0.5 size-5 text-brand" aria-hidden />
              <div className="flex-1">
                <div className="text-[13.5px] font-medium text-fg">{t}</div>
                <div className="text-xs text-fg-muted">{d}</div>
                <div className="mt-2"><Chip icon={Hourglass}>Segera hadir</Chip></div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      {isAdmin && (
        <Panel title="Log sistem" description="Kejadian impor dummy dan evaluasi aturan" className="lg:col-span-7" actions={<SimTag />}>
          <ul className="divide-y font-mono text-[12px]">
            {INTEGRATION_LOG.map((l, i) => (
              <li key={i} className="flex gap-3 py-2.5">
                <span className="w-24 shrink-0 text-fg-subtle">{l.at}</span>
                <span className={cn('w-10 shrink-0 font-semibold uppercase', l.level === 'warn' ? 'text-warning' : 'text-teal')}>{l.level}</span>
                <span className="min-w-0 font-sans text-[12.5px] text-fg"><span className="text-fg-muted">{l.source} — </span>{l.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

const COPY: Partial<Record<NavKey, string>> = {
  collab: 'Koordinasi konfirmasi, kekurangan, dan alokasi ulang dengan supplier. Pratinjau read-only untuk V1.',
  performance: 'Ketepatan konfirmasi dan pengiriman per supplier. Fitur Fase 2 — ditampilkan sebagai pratinjau.',
  reports: 'Laporan rutin dari satu versi angka. Ekspor belum aktif di prototipe.',
}

export function PreviewPage({ navKey }: { navKey: NavKey }) {
  const { user } = useSession()
  const nav = NAV[navKey]
  const access = user ? accessFor(user.id, navKey) : null
  return (
    <>
      <PageHeader
        eyebrow={<><nav.icon className="size-3.5" /> Pratinjau {nav.phase === 2 && <PhaseTag />}</>}
        title={nav.label}
        description={COPY[navKey]}
        meta={access ? <Chip tone="info">Akses Anda: {access}</Chip> : undefined}
      />
      {navKey === 'collab' && <Collaboration />}
      {navKey === 'performance' && <Performance />}
      {navKey === 'reports' && <Reports isAdmin={user?.id === 'admin'} />}
    </>
  )
}
