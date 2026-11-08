import { useState } from 'react'
import { FilePlus2, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MAIN, MATERIALS, SUPPLIERS, materialById } from '@/data/mock'
import { proposalStore } from '@/lib/demo-store'
import { fmt } from '@/lib/format'

/** "Usulan PO" — a proposal to be executed later in SAP. Never creates a real PO. */
export function UsulanPODialog({ trigger, by }: { trigger?: React.ReactNode; by: string }) {
  const [open, setOpen] = useState(false)
  const [materialId, setMaterialId] = useState(MAIN.material.id)
  const [supplierId, setSupplierId] = useState('SUP-B')
  const [qty, setQty] = useState(String(MAIN.gap))
  const [needDate, setNeedDate] = useState('2026-11-23')
  const m = materialById(materialId)
  const qtyNum = Number(qty.replace(/\D/g, ''))
  const valid = qtyNum > 0 && !!needDate

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <FilePlus2 /> Buat Usulan PO
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Usulan PO</DialogTitle>
          <DialogDescription>Usulan untuk dieksekusi di SAP oleh Procurement. SCCHub tidak membuat PO di SAP.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label className="mb-2">Material</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MATERIALS.map((x) => <SelectItem key={x.id} value={x.id}>{x.id} · {x.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2">Supplier alternatif</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPLIERS.map((s) => <SelectItem key={s.id} value={s.id}>{s.alias} · {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="uqty" className="mb-2">Qty ({m.unit})</Label>
              <Input id="uqty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} className="tnum" />
            </div>
            <div>
              <Label htmlFor="udate" className="mb-2">Tanggal butuh</Label>
              <Input id="udate" type="date" min="2026-11-09" value={needDate} onChange={(e) => setNeedDate(e.target.value)} />
            </div>
          </div>
          {materialId === MAIN.material.id && (
            <p className="rounded-lg bg-sunken px-3 py-2 text-xs text-fg-muted">
              Saran awal dari exception EXC-0231: tutup kekurangan {fmt(MAIN.gap)} {m.unit} melalui Supplier B.
            </p>
          )}
          <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-xs text-warning">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Simulasi: usulan hanya tersimpan di sesi browser ini.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              proposalStore.add({
                materialId,
                supplierId,
                qty: qtyNum,
                needDate: new Date(needDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                note: 'Menutup kekurangan',
                createdBy: by,
              })
              setOpen(false)
            }}
          >
            Simpan usulan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
