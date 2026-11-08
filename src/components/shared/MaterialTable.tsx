import { useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, EmptyState, MaterialStatusBadge, Meter, Mono, Td, Th, statusTone } from '@/components/shared/ui-kit'
import { POSITIONS, supplierById, type MaterialPosition } from '@/data/mock'
import type { MaterialStatus } from '@/data/types'
import { fmt, fmtSigned } from '@/lib/format'
import { cn } from '@/lib/utils'

const ORDER: Record<MaterialStatus, number> = { Shortage: 0, Waspada: 1, Aman: 2 }
type Filter = 'Semua' | MaterialStatus

export function useMaterialFilter(rows: MaterialPosition[] = POSITIONS) {
  const [filter, setFilter] = useState<Filter>('Semua')
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows
      .filter((r) => filter === 'Semua' || r.status === filter)
      .filter((r) => !term || `${r.material.id} ${r.material.name} ${supplierById(r.material.supplierId).name}`.toLowerCase().includes(term))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.coverage - b.coverage)
  }, [rows, filter, q])
  const counts = {
    Semua: rows.length,
    Shortage: rows.filter((r) => r.status === 'Shortage').length,
    Waspada: rows.filter((r) => r.status === 'Waspada').length,
    Aman: rows.filter((r) => r.status === 'Aman').length,
  }
  return { filter, setFilter, q, setQ, filtered, counts }
}

export function MaterialFilterBar({ ctl, searchable = true }: { ctl: ReturnType<typeof useMaterialFilter>; searchable?: boolean }) {
  return (
    <div className="flex max-w-full flex-wrap items-center gap-3">
      <div className="scrollbar-thin max-w-full overflow-x-auto">
      <Tabs value={ctl.filter} onValueChange={(v) => ctl.setFilter(v as Filter)}>
        <TabsList className="h-8">
          {(['Semua', 'Shortage', 'Waspada', 'Aman'] as Filter[]).map((f) => (
            <TabsTrigger key={f} value={f} className="h-7 px-2.5 text-xs">
              {f}
              <span className="tnum ml-1 rounded bg-fg/5 px-1 text-[10.5px] text-fg-muted">{ctl.counts[f]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      </div>
      {searchable && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <Input value={ctl.q} onChange={(e) => ctl.setQ(e.target.value)} placeholder="Cari kode, material, supplier" className="h-8 w-[220px] bg-surface pl-8 text-[13px]" aria-label="Cari material" />
        </div>
      )}
    </div>
  )
}

export function MaterialTable({
  rows,
  showSupplier = true,
  onSelect,
  selectedId,
}: {
  rows: MaterialPosition[]
  showSupplier?: boolean
  onSelect?: (id: string) => void
  selectedId?: string
}) {
  if (!rows.length) return <EmptyState icon={Search} title="Tidak ada material yang cocok" text="Ubah filter status atau kata kunci pencarian." />
  return (
    <DataTable minWidth={980}>
      <thead>
        <tr>
          <Th>Material</Th>
          {showSupplier && <Th>Supplier</Th>}
          <Th align="right">Kebutuhan 14h</Th>
          <Th align="right">Stok</Th>
          <Th align="right">On order</Th>
          <Th align="right">Terkonfirmasi</Th>
          <Th className="w-[150px]">Cakupan</Th>
          <Th align="right">Selisih</Th>
          <Th>ETA</Th>
          <Th>Status</Th>
          {onSelect && <Th className="w-8" />}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const m = r.material
          const cov = Math.round(r.coverage * 100)
          return (
            <tr
              key={m.id}
              onClick={onSelect ? () => onSelect(m.id) : undefined}
              className={cn(
                'group transition-colors duration-150',
                onSelect && 'cursor-pointer hover:bg-sunken',
                selectedId === m.id && 'bg-brand-soft/60 hover:bg-brand-soft/60',
                r.status === 'Shortage' && selectedId !== m.id && 'bg-danger-soft/25',
              )}
            >
              <Td>
                <div className="font-medium whitespace-nowrap text-fg">{m.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
                  <Mono className="text-[11.5px]">{m.id}</Mono>· {m.type === 'Packaging' ? 'PM' : 'RM'}
                </div>
              </Td>
              {showSupplier && <Td className="whitespace-nowrap text-fg-muted">{supplierById(m.supplierId).alias}</Td>}
              <Td align="right" className="font-medium text-fg">
                {fmt(m.need14)} <span className="text-[11px] font-normal text-fg-subtle">{m.unit}</span>
              </Td>
              <Td align="right">{fmt(m.onHand)}</Td>
              <Td align="right" className="text-fg-muted">{r.onOrder ? fmt(r.onOrder) : '—'}</Td>
              <Td align="right">{r.onOrder ? fmt(r.confirmed) : '—'}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Meter value={cov} tone={statusTone(r.status)} className="w-20" label={`Cakupan ${cov}%`} />
                  <span className="tnum w-9 text-right text-xs text-fg-muted">{cov}%</span>
                </div>
              </Td>
              <Td align="right" className={cn('font-semibold', r.gap > 0 ? 'text-danger' : 'text-fg-muted')}>
                {fmtSigned(-r.gap)}
              </Td>
              <Td className="whitespace-nowrap">
                {r.nextEta ? (
                  <span className="flex items-center gap-1.5">
                    <span className="tnum">{r.nextEta.replace(' 2026', '')}</span>
                    {r.etaSlipDays > 0 && (
                      <span className={cn('rounded px-1 text-[10.5px] font-semibold', r.etaSlipDays > 2 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>+{r.etaSlipDays}h</span>
                    )}
                  </span>
                ) : (
                  <span className="text-fg-subtle">{r.pos.length ? 'Menunggu' : '—'}</span>
                )}
              </Td>
              <Td>
                <MaterialStatusBadge status={r.status} />
              </Td>
              {onSelect && (
                <Td className="pr-5">
                  <ArrowRight className="size-4 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Td>
              )}
            </tr>
          )
        })}
      </tbody>
    </DataTable>
  )
}
