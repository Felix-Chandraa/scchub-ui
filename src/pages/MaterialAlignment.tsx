import { useNavigate } from 'react-router'
import { Info } from 'lucide-react'
import { MaterialFilterBar, MaterialTable, useMaterialFilter } from '@/components/shared/MaterialTable'
import { Chip, PageHeader, Panel, SapTag, SimTag } from '@/components/shared/ui-kit'
import { HORIZON_LABEL } from '@/data/mock'
import { accessFor } from '@/lib/nav'
import { useSession } from '@/lib/session'

export function MaterialAlignment() {
  const { user } = useSession()
  const navigate = useNavigate()
  const ctl = useMaterialFilter()
  const access = user ? accessFor(user.id, 'alignment') : null
  return (
    <>
      <PageHeader
        eyebrow={<>{HORIZON_LABEL}</>}
        title="Material Alignment"
        description="Kebutuhan (DA), stok, PO, call-off, dan konfirmasi supplier per SKU dalam satu tabel. Status dihitung dari stok + pasokan terkonfirmasi terhadap kebutuhan 14 hari."
        meta={<>{access && <Chip tone="info">Akses Anda: {access}</Chip>}<SimTag /><SapTag /></>}
      />
      <Panel
        title={`${ctl.filtered.length} material`}
        description="Klik baris untuk menelusuri jejak end-to-end di Integrated Overview."
        actions={<MaterialFilterBar ctl={ctl} />}
        bodyClassName="pb-1"
      >
        <MaterialTable rows={ctl.filtered} onSelect={(id) => navigate(`/overview?material=${id}`)} />
      </Panel>
      <div className="mt-4 flex items-start gap-2 text-xs text-fg-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p><span className="font-medium text-fg">Shortage</span>: stok + terkonfirmasi &lt; kebutuhan (A1). <span className="font-medium text-fg">Waspada</span>: tertutup, tetapi di bawah kebutuhan + safety stock. <span className="font-medium text-fg">Aman</span>: tertutup termasuk safety stock. Semua ambang adalah nilai dummy.</p>
      </div>
    </>
  )
}
