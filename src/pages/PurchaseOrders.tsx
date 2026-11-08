import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsulanPODialog } from '@/components/shared/UsulanPODialog'
import { Chip, DataTable, EmptyState, Mono, PageHeader, Panel, POStatusBadge, SapTag, SimTag, Td, Th } from '@/components/shared/ui-kit'
import { CALL_OFFS, PURCHASE_ORDERS, etaSlip, materialById, supplierById } from '@/data/mock'
import { useProposals } from '@/lib/demo-store'
import { fmt } from '@/lib/format'
import { accessFor } from '@/lib/nav'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

type F = 'Terbuka' | 'Perlu tindakan' | 'Diterima' | 'Semua'

export function PurchaseOrders() {
  const { user } = useSession()
  const access = user ? accessFor(user.id, 'po') : null
  const canPropose = user?.id === 'procurement'
  const proposals = useProposals()
  const [f, setF] = useState<F>('Terbuka')
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return PURCHASE_ORDERS.filter((p) =>
      f === 'Semua' ? true : f === 'Diterima' ? p.status === 'Diterima' : f === 'Perlu tindakan' ? p.status === 'Diterbitkan' || p.partial || etaSlip(p) > 2 : p.status !== 'Diterima',
    ).filter((p) => !t || `${p.id} ${materialById(p.materialId).name} ${supplierById(p.supplierId).name}`.toLowerCase().includes(t))
  }, [f, q])

  return (
    <>
      <PageHeader
        title="Purchase Order"
        description="Status PO end-to-end, call-off, komitmen dan ETA supplier. PO resmi tetap dibuat dan dieksekusi di SAP."
        meta={<>{access && <Chip tone="info">Akses Anda: {access}</Chip>}<SimTag /><SapTag /></>}
        actions={canPropose ? <UsulanPODialog by="Sinta · Procurement" /> : undefined}
      />
      {proposals.length > 0 && (
        <Panel title="Usulan PO (sesi ini)" description="Menunggu dieksekusi di SAP — simulasi" className="mb-5" actions={<Chip tone="warning">Simulasi</Chip>}>
          <ul className="divide-y text-[13px]">
            {proposals.map((p) => {
              const m = materialById(p.materialId)
              return (
                <li key={p.id} className="flex flex-wrap gap-x-4 py-2">
                  <Mono className="font-semibold">{p.id}</Mono><span>{m.name}</span><span className="tnum">{fmt(p.qty)} {m.unit}</span><span className="text-fg-muted">{supplierById(p.supplierId).name}</span><span className="text-fg-muted">butuh {p.needDate}</span><span className="text-fg-subtle">oleh {p.createdBy}</span>
                </li>
              )
            })}
          </ul>
        </Panel>
      )}
      <Panel
        title={`${rows.length} purchase order`}
        bodyClassName="pb-1"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={f} onValueChange={(v) => setF(v as F)}>
              <TabsList className="h-8">
                {(['Terbuka', 'Perlu tindakan', 'Diterima', 'Semua'] as F[]).map((x) => <TabsTrigger key={x} value={x} className="h-7 px-2.5 text-xs">{x}</TabsTrigger>)}
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-subtle" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari PO, material, supplier" className="h-8 w-[220px] bg-surface pl-8 text-[13px]" aria-label="Cari PO" />
            </div>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState icon={Search} title="Tidak ada PO yang cocok" text="Ubah filter atau kata kunci." />
        ) : (
          <DataTable minWidth={1040}>
            <thead>
              <tr><Th>PO</Th><Th>Material</Th><Th>Supplier</Th><Th align="right">Qty</Th><Th align="right">Terkonfirmasi</Th><Th>Call-off</Th><Th>Tgl butuh</Th><Th>ETA</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const m = materialById(p.materialId)
                const s = supplierById(p.supplierId)
                const cos = CALL_OFFS.filter((c) => c.poId === p.id)
                const slip = etaSlip(p)
                return (
                  <tr key={p.id} className="hover:bg-sunken">
                    <Td><Mono className="font-semibold">{p.id}</Mono><div className="text-[11.5px] text-fg-subtle">terbit {p.issuedAt.replace(' 2026', '')}</div></Td>
                    <Td><div className="font-medium whitespace-nowrap text-fg">{m.name}</div><Mono className="text-[11.5px] text-fg-subtle">{m.id}</Mono></Td>
                    <Td className="whitespace-nowrap">{s.alias}<div className="text-[11.5px] text-fg-subtle">{s.channel}</div></Td>
                    <Td align="right">{fmt(p.qty)} <span className="text-[11px] text-fg-subtle">{m.unit}</span></Td>
                    <Td align="right" className={cn(p.partial && 'font-semibold text-warning')}>{p.confirmedQty != null ? fmt(p.confirmedQty) : '—'}</Td>
                    <Td className="text-xs whitespace-nowrap text-fg-muted">{cos.length ? `${cos.length}× · ${cos[0].date.replace(' 2026', '')}` : '—'}</Td>
                    <Td className="whitespace-nowrap">{p.needDate.replace(' 2026', '')}</Td>
                    <Td className="whitespace-nowrap">
                      {p.eta ? <>{p.eta.replace(' 2026', '')}{slip > 0 && <span className={cn('ml-1.5 rounded px-1 text-[10.5px] font-semibold', slip > 2 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>+{slip}h</span>}</> : <span className="text-xs text-warning">batas {p.confirmDeadline?.replace(' 2026', '')}</span>}
                    </Td>
                    <Td><POStatusBadge po={p} /></Td>
                  </tr>
                )
              })}
            </tbody>
          </DataTable>
        )}
      </Panel>
    </>
  )
}
