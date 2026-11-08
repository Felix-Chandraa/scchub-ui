import { Link } from 'react-router'
import { ArrowRight, Cable, DatabaseZap, FileWarning, KeyRound, ListChecks, ScrollText, Unplug, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AlertCodeTag, Avatar, Chip, DataTable, Meter, PageHeader, Panel, Td, Th } from '@/components/shared/ui-kit'
import { ALERT_RULES, DATA_QUALITY, INTEGRATION_FEEDS, INTEGRATION_LOG, USERS } from '@/data/mock'
import { cn } from '@/lib/utils'

function SimBanner() {
  return (
    <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-xl border border-warning/30 bg-warning-soft/60 p-5 sm:flex-row sm:items-center">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning text-white">
        <Unplug className="size-5" aria-hidden />
      </span>
      <div className="flex-1">
        <div className="text-[16px] font-semibold text-fg">Simulasi — SAP tidak terhubung</div>
        <p className="mt-0.5 text-[13.5px] text-fg-muted">
          Semua data berasal dari snapshot dummy (9 Nov 2026, 06:00). Tidak ada koneksi, kredensial, atau sinkronisasi SAP yang aktif di prototipe ini.
        </p>
      </div>
      <Chip tone="warning" icon={DatabaseZap} className="self-start sm:self-center">Mode: data dummy</Chip>
    </div>
  )
}

function Feeds() {
  return (
    <Panel title="Sumber data" description="Pemetaan objek data ke sumber konseptual" className="lg:col-span-8" icon={Cable} bodyClassName="pb-1">
      <DataTable minWidth={680}>
        <thead>
          <tr><Th>Sumber</Th><Th>Objek</Th><Th align="right">Record</Th><Th>Mode</Th><Th>Muat terakhir</Th></tr>
        </thead>
        <tbody>
          {INTEGRATION_FEEDS.map((f) => (
            <tr key={f.name} className="hover:bg-sunken">
              <Td className="font-medium whitespace-nowrap text-fg">{f.name}</Td>
              <Td className="text-fg-muted">{f.object}</Td>
              <Td align="right">{f.records}</Td>
              <Td><Chip tone={f.mode === 'Hanya ilustrasi' ? 'neutral' : 'warning'}>{f.mode}</Chip></Td>
              <Td className="whitespace-nowrap text-fg-muted">{f.last}</Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Panel>
  )
}

function Quality() {
  return (
    <Panel title="Kualitas data" className="lg:col-span-4" icon={ListChecks}>
      <ul className="space-y-4">
        {DATA_QUALITY.map((d) => {
          const pct = (d.value / d.total) * 100
          return (
            <li key={d.label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-fg">{d.label}</span>
                <span className="tnum text-[13px] font-semibold text-fg">{d.value}/{d.total}</span>
              </div>
              <Meter value={pct} tone={pct === 100 ? 'success' : pct === 0 ? 'danger' : 'warning'} className="mt-1.5" />
              <div className="mt-1 text-[11.5px] text-fg-muted">{d.note}</div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function Rules() {
  return (
    <Panel
      title="Aturan alert A1–A6"
      description="Threshold awal bernilai dummy dan perlu dikalibrasi"
      className="lg:col-span-7"
      icon={FileWarning}
      actions={<Button size="sm" variant="outline" asChild><Link to="/settings">Kelola di Pengaturan <ArrowRight /></Link></Button>}
    >
      <ul className="divide-y">
        {ALERT_RULES.map((r) => (
          <li key={r.code} className="grid grid-cols-[32px_1fr] items-start gap-3 py-2.5 sm:grid-cols-[32px_1fr_190px]">
            <AlertCodeTag code={r.code} />
            <div>
              <div className="text-[13.5px] font-medium text-fg">{r.name}</div>
              <div className="text-xs text-fg-muted">{r.condition}</div>
            </div>
            <div className="col-start-2 text-xs sm:col-start-3 sm:text-right">
              <div className="font-medium text-fg">{r.threshold}</div>
              <div className="text-fg-subtle">{r.recipients}</div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function Accounts() {
  return (
    <Panel title="Akun & hak akses" description="8 akun demo · tanpa kredensial" className="lg:col-span-5" icon={Users}>
      <ul className="divide-y">
        {USERS.map((u) => (
          <li key={u.id} className="flex items-center gap-3 py-2.5">
            <Avatar initials={u.initials} tone={u.internal ? 'ink' : 'teal'} className="size-7 text-[10px]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-fg">{u.name}</div>
              <div className="truncate text-[11.5px] text-fg-muted">{u.roleLabel}</div>
            </div>
            <Chip tone={u.internal ? 'info' : 'teal'} icon={KeyRound}>{u.internal ? 'Internal · Overview' : 'Portal supplier'}</Chip>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function Log() {
  return (
    <Panel title="Log sistem" description="Kejadian terbaru (simulasi)" className="lg:col-span-12" icon={ScrollText} actions={<Button size="sm" variant="ghost" className="text-brand" asChild><Link to="/reports">Semua log <ArrowRight /></Link></Button>}>
      <ul className="divide-y rounded-lg border bg-sunken/60 font-mono text-[12px]">
        {INTEGRATION_LOG.map((l, i) => (
          <li key={i} className="flex flex-wrap gap-x-4 gap-y-0.5 px-4 py-2">
            <span className="w-24 shrink-0 text-fg-subtle">{l.at}</span>
            <span className={cn('w-10 shrink-0 font-semibold uppercase', l.level === 'warn' ? 'text-warning' : 'text-teal')}>{l.level}</span>
            <span className="w-40 shrink-0 text-fg-muted">{l.source}</span>
            <span className="min-w-0 flex-1 font-sans text-[12.5px] text-fg">{l.text}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function AdminDashboard() {
  return (
    <>
      <PageHeader
        eyebrow={<>Admin sistem · data steward</>}
        title="Konfigurasi & kesehatan data"
        description="Master data, aturan alert, akun, dan status integrasi. Admin mengatur konfigurasi — tidak ikut memutuskan operasional."
      />
      <SimBanner />
      <div className="grid gap-5 lg:grid-cols-12">
        <Feeds />
        <Quality />
        <Rules />
        <Accounts />
        <Log />
      </div>
    </>
  )
}
