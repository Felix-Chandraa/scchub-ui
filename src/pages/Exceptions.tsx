import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CircleUserRound, MessageSquarePlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCodeTag, Avatar, Chip, ExceptionStatusBadge, Mono, PageHeader, Panel, PhaseTag, SimTag } from '@/components/shared/ui-kit'
import { ALERT_RULES, EXCEPTIONS, materialById, positionById, userById } from '@/data/mock'
import type { ExceptionStatus } from '@/data/types'
import { fmt, fmtAge } from '@/lib/format'
import { accessFor } from '@/lib/nav'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

type F = 'Aktif' | ExceptionStatus | 'Semua'

export function Exceptions() {
  const { user } = useSession()
  const access = user ? accessFor(user.id, 'exceptions') : null
  const [f, setF] = useState<F>('Aktif')
  const list = EXCEPTIONS.filter((e) => (f === 'Semua' ? true : f === 'Aktif' ? e.status !== 'Selesai' : e.status === f))
  const [sel, setSel] = useState('EXC-0231')
  const e = EXCEPTIONS.find((x) => x.id === sel) ?? list[0]
  const m = materialById(e.materialId)
  const pos = positionById(m.id)
  const pic = e.pic ? userById(e.pic) : null

  return (
    <>
      <PageHeader
        eyebrow={<><PhaseTag /> Pratinjau ruang koordinasi</>}
        title="Risk & Exception"
        description="Setiap alert membuat atau memperbarui satu exception dengan PIC, tindakan, status, dan riwayat keputusan — menggantikan rantai email dan WhatsApp."
        meta={<>{access && <Chip tone="info">Akses Anda: {access}</Chip>}<SimTag /></>}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel
          title="Daftar exception"
          className="lg:col-span-5"
          actions={
            <Tabs value={f} onValueChange={(v) => setF(v as F)}>
              <TabsList className="h-8">
                {(['Aktif', 'Eskalasi', 'Selesai', 'Semua'] as F[]).map((x) => <TabsTrigger key={x} value={x} className="h-7 px-2 text-xs">{x}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          }
        >
          <ul className="-mx-2 space-y-1">
            {list.map((x) => (
              <li key={x.id}>
                <button
                  onClick={() => setSel(x.id)}
                  className={cn('w-full rounded-lg px-3 py-2.5 text-left transition-colors', x.id === e.id ? 'bg-brand-soft ring-1 ring-brand/25' : 'hover:bg-sunken')}
                >
                  <div className="flex items-center gap-2">
                    <Mono className="text-xs text-fg-muted">{x.id}</Mono>
                    <span className="flex gap-1">{x.triggers.map((t) => <AlertCodeTag key={t} code={t} />)}</span>
                    <span className="ml-auto text-[11px] text-fg-subtle">{fmtAge(x.ageHours)}</span>
                  </div>
                  <div className="mt-1 text-[13.5px] font-medium text-fg">{x.title}</div>
                  <div className="mt-1.5"><ExceptionStatusBadge status={x.status} /></div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Mono className="text-sm font-semibold">{e.id}</Mono>
            <ExceptionStatusBadge status={e.status} />
            <span className="ml-auto text-xs text-fg-subtle">Dibuka {e.openedAt}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">{e.title}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
            {[
              ['Material', `${m.id}`],
              ['Kebutuhan 14h', `${fmt(m.need14)} ${m.unit}`],
              ['Tersedia', `${fmt(pos.secured)} ${m.unit}`],
              ['Selisih', pos.gap > 0 ? `−${fmt(pos.gap)}` : 'Tertutup'],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-3 py-2.5">
                <dt className="text-[11.5px] text-fg-muted">{k}</dt>
                <dd className={cn('tnum mt-0.5 text-[14px] font-semibold text-fg', k === 'Selisih' && pos.gap > 0 && 'text-danger')}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-sunken p-3">
              <div className="text-[11.5px] font-semibold tracking-wide text-fg-muted uppercase">Pemicu</div>
              <ul className="mt-1.5 space-y-1">
                {e.triggers.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[13px] text-fg"><AlertCodeTag code={t} />{ALERT_RULES.find((r) => r.code === t)?.name}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-sunken p-3">
              <div className="text-[11.5px] font-semibold tracking-wide text-fg-muted uppercase">PIC</div>
              <div className="mt-1.5 flex items-center gap-2 text-[13px]">
                {pic ? <><Avatar initials={pic.initials} className="size-6 text-[9px]" />{pic.name} · {pic.roleShort}</> : <><CircleUserRound className="size-5 text-fg-subtle" />Belum ditetapkan</>}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border-l-4 border-warning bg-warning-soft/50 px-4 py-3 text-[13px] text-fg">
            <span className="font-semibold">Dampak: </span>{e.impact}
          </div>

          <h3 className="mt-6 mb-3 text-[13px] font-semibold text-fg">Riwayat keputusan</h3>
          <ol className="space-y-3.5 border-l-2 border-border pl-5">
            {e.history.map((h, i) => (
              <li key={i} className="relative">
                <span className={cn('absolute top-1 -left-[27px] size-3 rounded-full border-2 border-surface', h.actor === 'Sistem' ? 'bg-fg-subtle' : 'bg-brand')} aria-hidden />
                <div className="text-xs text-fg-subtle">{h.at} · <span className="font-medium text-fg-muted">{h.actor}</span></div>
                <div className="mt-0.5 text-[13px] text-fg">{h.text}</div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
            <Button size="sm" variant="outline" disabled><UserPlus /> Tetapkan PIC</Button>
            <Button size="sm" variant="outline" disabled><MessageSquarePlus /> Tambah catatan</Button>
            <span className="text-xs text-fg-subtle">Aksi koordinasi aktif di <PhaseTag className="ml-0.5" /></span>
            <Button size="sm" variant="ghost" className="ml-auto text-brand" asChild>
              <Link to={`/overview?material=${m.id}`}>Jejak di Overview <ArrowRight /></Link>
            </Button>
          </div>
        </Panel>
      </div>
    </>
  )
}
