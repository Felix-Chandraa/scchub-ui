import { useState } from 'react'
import { CheckCircle2, FlaskConical, RotateCcw, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCodeTag, Chip, DataTable, Mono, PageHeader, Panel, Td, Th } from '@/components/shared/ui-kit'
import { ALERT_RULES, MATERIALS, SUPPLIERS, USERS } from '@/data/mock'
import { navFor } from '@/lib/nav'
import { fmt } from '@/lib/format'

function Thresholds() {
  const initial = Object.fromEntries(ALERT_RULES.map((r) => [r.code, r.threshold])) as Record<string, string>
  const [vals, setVals] = useState(initial)
  const [saved, setSaved] = useState(false)
  const dirty = ALERT_RULES.some((r) => vals[r.code] !== initial[r.code])
  return (
    <Panel title="Threshold aturan alert" description="Admin mengatur threshold dan penerima tanpa mengubah sistem. Nilai awal adalah dummy (PDF hal. 3).">
      <div className="space-y-2">
        {ALERT_RULES.map((r) => (
          <div key={r.code} className="grid items-center gap-3 rounded-lg border px-4 py-3 md:grid-cols-[40px_1fr_260px_220px]">
            <AlertCodeTag code={r.code} />
            <div>
              <div className="text-[13.5px] font-medium text-fg">{r.name}</div>
              <div className="text-xs text-fg-muted">{r.condition}</div>
            </div>
            <Input
              value={vals[r.code]}
              onChange={(e) => {
                setSaved(false)
                setVals((v) => ({ ...v, [r.code]: e.target.value }))
              }}
              aria-label={`Threshold ${r.code}`}
              className="h-9"
            />
            <div className="text-xs text-fg-muted">{r.recipients}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={!dirty} onClick={() => setSaved(true)}>Simpan (simulasi)</Button>
        <Button variant="ghost" disabled={!dirty} onClick={() => { setVals(initial); setSaved(false) }}><RotateCcw /> Reset</Button>
        {saved && <span className="flex items-center gap-1.5 text-[13px] text-success"><CheckCircle2 className="size-4" /> Tersimpan di sesi ini saja</span>}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-fg-subtle"><FlaskConical className="size-3.5" /> Tidak memicu evaluasi ulang aturan</span>
      </div>
    </Panel>
  )
}

export function Settings() {
  return (
    <>
      <PageHeader title="Pengaturan" description="Threshold alert, master data, akun dan hak akses, serta status integrasi SAP." meta={<Chip tone="info">Akses Anda: Konfigurasi</Chip>} />
      <Tabs defaultValue="threshold" className="gap-5">
        <TabsList className="h-9">
          <TabsTrigger value="threshold" className="px-3">Threshold alert</TabsTrigger>
          <TabsTrigger value="master" className="px-3">Master data</TabsTrigger>
          <TabsTrigger value="akun" className="px-3">Akun & akses</TabsTrigger>
          <TabsTrigger value="sap" className="px-3">Integrasi SAP</TabsTrigger>
        </TabsList>
        <TabsContent value="threshold"><Thresholds /></TabsContent>
        <TabsContent value="master" className="space-y-5">
          <Panel title="Master SKU" description="Parameter ROP dan safety stock — nilai awal dari SAP (dummy)" bodyClassName="pb-1">
            <DataTable minWidth={760}>
              <thead><tr><Th>Kode</Th><Th>Nama</Th><Th>Jenis</Th><Th align="right">ROP</Th><Th align="right">Safety stock</Th><Th align="right">Lead time</Th></tr></thead>
              <tbody>
                {MATERIALS.map((m) => (
                  <tr key={m.id} className="hover:bg-sunken">
                    <Td><Mono>{m.id}</Mono></Td><Td className="font-medium">{m.name}</Td><Td className="text-fg-muted">{m.type}</Td>
                    <Td align="right">{fmt(m.rop)} <span className="text-[11px] text-fg-subtle">{m.unit}</span></Td>
                    <Td align="right">{fmt(m.safetyStock)}</Td>
                    <Td align="right">{m.leadTimeDays} hari{m.id === 'M-200152' && <span className="ml-1.5 rounded bg-warning-soft px-1 text-[10.5px] font-semibold text-warning">belum diverifikasi</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Panel>
          <Panel title="Master supplier" bodyClassName="pb-1">
            <DataTable minWidth={640}>
              <thead><tr><Th>Kode</Th><Th>Nama</Th><Th>Kanal</Th><Th>Kota</Th><Th>Kontak</Th></tr></thead>
              <tbody>
                {SUPPLIERS.map((s) => (
                  <tr key={s.id} className="hover:bg-sunken">
                    <Td><Mono>{s.code}</Mono></Td><Td className="font-medium">{s.name}</Td><Td><Chip tone={s.channel === 'Portal' ? 'teal' : 'info'}>{s.channel}</Chip></Td><Td className="text-fg-muted">{s.city}</Td><Td className="text-fg-muted">{s.contact}</Td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Panel>
        </TabsContent>
        <TabsContent value="akun">
          <Panel title="Akun demo & menu yang diizinkan" description="Mengikuti matriks menu per peran. Tidak ada kata sandi tersimpan." bodyClassName="pb-1">
            <DataTable minWidth={760}>
              <thead><tr><Th>Pengguna</Th><Th>Peran</Th><Th>Jenis</Th><Th>Menu</Th></tr></thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-sunken">
                    <Td className="font-medium whitespace-nowrap">{u.name}<div className="font-mono text-[11.5px] font-normal text-fg-subtle">{u.username}</div></Td>
                    <Td className="whitespace-nowrap text-fg-muted">{u.roleLabel}</Td>
                    <Td><Chip tone={u.internal ? 'info' : 'teal'}>{u.internal ? 'Internal' : 'Eksternal'}</Chip></Td>
                    <Td className="text-xs text-fg-muted">{u.internal ? navFor(u.id).map((n) => n.label).join(' · ') : 'Portal Supplier (Pesanan, Proyeksi, Riwayat)'}</Td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Panel>
        </TabsContent>
        <TabsContent value="sap">
          <Panel>
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning"><Unplug className="size-6" /></span>
              <h2 className="mt-4 text-lg font-semibold text-fg">Simulasi — SAP tidak terhubung</h2>
              <p className="mt-1.5 max-w-lg text-sm text-fg-muted">
                Arah integrasi yang dirancang adalah read-only dari SAP ke SCCHub, dengan usulan PO dieksekusi di SAP. Prototipe ini tidak menyimpan kredensial dan tidak melakukan koneksi apa pun.
              </p>
              <Button className="mt-5" variant="outline" disabled>Uji koneksi <span className="rounded bg-neutral-soft px-1 text-[10px] font-semibold">Segera hadir</span></Button>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
