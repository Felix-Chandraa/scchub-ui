/**
 * SCCHub — single typed source for ALL illustrative figures.
 * Every number here is dummy data for a clickable prototype (PDF pp. 8–9).
 * Nothing is read from or written to SAP.
 *
 * Main case (post Supplier A confirmation):
 *   M-100234 Packaging Box — need 50,000 · on-hand 5,000 · PO-04567 40,000
 *   Supplier A confirms 30,000, ETA +3 days → secured 35,000 → shortage 15,000.
 */
import type {
  AlertItem,
  CallOff,
  DemoUser,
  ExceptionCase,
  Material,
  MaterialStatus,
  ProductionBatch,
  PurchaseOrder,
  RoleId,
  Supplier,
} from './types'

export const DATA_AS_OF = '9 Nov 2026, 08:00'
export const HORIZON_LABEL = 'Horizon 14 hari · 9–22 Nov 2026'
export const MAIN_MATERIAL_ID = 'M-100234'
export const MAIN_PO_ID = 'PO-04567'

// ---------------------------------------------------------------- Users
export const USERS: DemoUser[] = [
  { id: 'marketing', name: 'Rina Kartika', initials: 'RK', roleLabel: 'Sales & Marketing', roleShort: 'Demand Planner', username: 'rina.demand', unit: 'Demand Planning', internal: true },
  { id: 'planner', name: 'Budi Santoso', initials: 'BS', roleLabel: 'Material & Inventory Planner', roleShort: 'Planner', username: 'budi.planner', unit: 'Material Planning', internal: true },
  { id: 'ppic', name: 'Dewi Lestari', initials: 'DL', roleLabel: 'PPIC', roleShort: 'Production Planner', username: 'dewi.ppic', unit: 'Production Planning', internal: true },
  { id: 'warehouse', name: 'Agus Pratama', initials: 'AP', roleLabel: 'Warehouse RM/PM', roleShort: 'Warehouse', username: 'agus.gudang', unit: 'Gudang RM/PM 01', internal: true },
  { id: 'procurement', name: 'Sinta Maharani', initials: 'SM', roleLabel: 'Procurement & Vendor Mgmt', roleShort: 'Procurement', username: 'sinta.proc', unit: 'Procurement', internal: true },
  { id: 'manager', name: 'Hendra Wijaya', initials: 'HW', roleLabel: 'Supply Chain Manager', roleShort: 'SC Manager', username: 'hendra.scm', unit: 'Supply Chain', internal: true },
  { id: 'admin', name: 'Maya Putri', initials: 'MP', roleLabel: 'Admin Sistem', roleShort: 'Data Steward', username: 'maya.admin', unit: 'IT & Data', internal: true },
  { id: 'supplier', name: 'Joko Susilo', initials: 'JS', roleLabel: 'Supplier', roleShort: 'Portal Supplier', username: 'joko.kkm', unit: 'PT Karya Kemasan Mandiri', supplierId: 'SUP-A', internal: false },
]

export const userById = (id: RoleId) => USERS.find((u) => u.id === id)!

// ---------------------------------------------------------------- Suppliers
export const SUPPLIERS: Supplier[] = [
  { id: 'SUP-A', code: 'V-20117', name: 'PT Karya Kemasan Mandiri', alias: 'Supplier A', channel: 'Portal', city: 'Tangerang', contact: 'Joko Susilo' },
  { id: 'SUP-B', code: 'V-20142', name: 'CV Sinar Kemas Abadi', alias: 'Supplier B', channel: 'Portal', city: 'Bekasi', contact: 'Lina Hartono' },
  { id: 'SUP-C', code: 'V-10038', name: 'PT Lumina Chemindo', alias: 'Supplier C', channel: 'API', city: 'Cikarang', contact: 'Rudi Hasan' },
  { id: 'SUP-D', code: 'V-10052', name: 'PT Prima Plastindo', alias: 'Supplier D', channel: 'EDI', city: 'Karawang', contact: 'Teguh Wibowo' },
  { id: 'SUP-E', code: 'V-20160', name: 'CV Label Nusantara', alias: 'Supplier E', channel: 'Portal', city: 'Bogor', contact: 'Fitri Ayu' },
  { id: 'SUP-F', code: 'V-10071', name: 'PT Aroma Esensi Indonesia', alias: 'Supplier F', channel: 'API', city: 'Surabaya', contact: 'Kevin Lim' },
]
export const supplierById = (id: string) => SUPPLIERS.find((s) => s.id === id)!

// ---------------------------------------------------------------- Materials
export const MATERIALS: Material[] = [
  { id: 'M-100234', name: 'Packaging Box', type: 'Packaging', unit: 'pcs', need14: 50_000, onHand: 5_000, inTransit: 0, safetyStock: 4_000, rop: 12_000, leadTimeDays: 10, supplierId: 'SUP-A', usedIn: ['Serum Brightening 30ml', 'Sunscreen SPF50 50ml', 'Body Mist 100ml'] },
  { id: 'M-100283', name: 'Pump Dispenser 24mm', type: 'Packaging', unit: 'pcs', need14: 15_000, onHand: 4_200, inTransit: 0, safetyStock: 2_000, rop: 6_000, leadTimeDays: 14, supplierId: 'SUP-B', usedIn: ['Hand & Body Lotion 250ml'] },
  { id: 'M-100262', name: 'Label Depan Serum', type: 'Packaging', unit: 'pcs', need14: 36_000, onHand: 38_000, inTransit: 0, safetyStock: 6_000, rop: 40_000, leadTimeDays: 7, supplierId: 'SUP-E', usedIn: ['Serum Brightening 30ml'] },
  { id: 'M-100241', name: 'Inner Carton', type: 'Packaging', unit: 'pcs', need14: 18_000, onHand: 6_500, inTransit: 0, safetyStock: 2_000, rop: 8_000, leadTimeDays: 8, supplierId: 'SUP-A', usedIn: ['Serum Brightening 30ml', 'Lip Cream Matte 7ml'] },
  { id: 'M-200131', name: 'Fragrance Floral FR-12', type: 'Raw material', unit: 'kg', need14: 260, onHand: 90, inTransit: 0, safetyStock: 40, rop: 120, leadTimeDays: 21, supplierId: 'SUP-F', usedIn: ['Body Mist 100ml', 'Toner Hydrating 150ml'] },
  { id: 'M-100290', name: 'Shrink Film 450mm', type: 'Packaging', unit: 'roll', need14: 320, onHand: 140, inTransit: 0, safetyStock: 40, rop: 160, leadTimeDays: 6, supplierId: 'SUP-B', usedIn: ['Semua lini kemas'] },
  { id: 'M-100255', name: 'Botol PET 30ml', type: 'Packaging', unit: 'pcs', need14: 42_000, onHand: 28_000, inTransit: 20_000, safetyStock: 5_000, rop: 30_000, leadTimeDays: 12, supplierId: 'SUP-D', usedIn: ['Serum Brightening 30ml'] },
  { id: 'M-100277', name: 'Tube Lip Cream 7ml', type: 'Packaging', unit: 'pcs', need14: 25_000, onHand: 9_000, inTransit: 20_000, safetyStock: 3_000, rop: 10_000, leadTimeDays: 12, supplierId: 'SUP-D', usedIn: ['Lip Cream Matte 7ml'] },
  { id: 'M-200118', name: 'Niacinamide', type: 'Raw material', unit: 'kg', need14: 420, onHand: 380, inTransit: 0, safetyStock: 60, rop: 200, leadTimeDays: 18, supplierId: 'SUP-C', usedIn: ['Serum Brightening 30ml', 'Toner Hydrating 150ml'] },
  { id: 'M-200126', name: 'Glycerin USP', type: 'Raw material', unit: 'kg', need14: 1_800, onHand: 2_400, inTransit: 0, safetyStock: 300, rop: 900, leadTimeDays: 10, supplierId: 'SUP-C', usedIn: ['Facial Wash 100ml', 'Hand & Body Lotion 250ml'] },
  { id: 'M-200140', name: 'Titanium Dioxide', type: 'Raw material', unit: 'kg', need14: 150, onHand: 210, inTransit: 0, safetyStock: 40, rop: 80, leadTimeDays: 20, supplierId: 'SUP-C', usedIn: ['Sunscreen SPF50 50ml'] },
  { id: 'M-200152', name: 'Hyaluronic Acid', type: 'Raw material', unit: 'kg', need14: 18, onHand: 24, inTransit: 0, safetyStock: 4, rop: 8, leadTimeDays: 25, supplierId: 'SUP-F', usedIn: ['Toner Hydrating 150ml'] },
]
export const materialById = (id: string) => MATERIALS.find((m) => m.id === id)!

// ---------------------------------------------------------------- Purchase orders
export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'PO-04567', materialId: 'M-100234', supplierId: 'SUP-A', qty: 40_000, confirmedQty: 30_000, issuedAt: '2 Nov 2026', needDate: '18 Nov 2026', etaOriginal: '18 Nov 2026', eta: '21 Nov 2026', status: 'Dikonfirmasi', partial: true },
  { id: 'PO-04573', materialId: 'M-100283', supplierId: 'SUP-B', qty: 12_000, confirmedQty: 8_000, issuedAt: '3 Nov 2026', needDate: '16 Nov 2026', etaOriginal: '16 Nov 2026', eta: '17 Nov 2026', status: 'Dikonfirmasi', partial: true },
  { id: 'PO-04574', materialId: 'M-100262', supplierId: 'SUP-E', qty: 30_000, confirmedQty: null, issuedAt: '7 Nov 2026', needDate: '24 Nov 2026', etaOriginal: null, eta: null, status: 'Diterbitkan', confirmDeadline: '10 Nov 2026, 10:00' },
  { id: 'PO-04578', materialId: 'M-100241', supplierId: 'SUP-A', qty: 8_000, confirmedQty: null, issuedAt: '9 Nov 2026', needDate: '27 Nov 2026', etaOriginal: null, eta: null, status: 'Diterbitkan', confirmDeadline: '11 Nov 2026, 17:00' },
  { id: 'PO-04571', materialId: 'M-100241', supplierId: 'SUP-A', qty: 12_000, confirmedQty: 12_000, issuedAt: '4 Nov 2026', needDate: '16 Nov 2026', etaOriginal: '16 Nov 2026', eta: '16 Nov 2026', status: 'Diproses' },
  { id: 'PO-04566', materialId: 'M-200131', supplierId: 'SUP-F', qty: 200, confirmedQty: 200, issuedAt: '28 Okt 2026', needDate: '14 Nov 2026', etaOriginal: '14 Nov 2026', eta: '15 Nov 2026', status: 'Dikonfirmasi' },
  { id: 'PO-04575', materialId: 'M-100290', supplierId: 'SUP-B', qty: 200, confirmedQty: 200, issuedAt: '5 Nov 2026', needDate: '12 Nov 2026', etaOriginal: '12 Nov 2026', eta: '12 Nov 2026', status: 'Diproses' },
  { id: 'PO-04569', materialId: 'M-200118', supplierId: 'SUP-C', qty: 300, confirmedQty: 300, issuedAt: '30 Okt 2026', needDate: '13 Nov 2026', etaOriginal: '13 Nov 2026', eta: '13 Nov 2026', status: 'Dikonfirmasi' },
  { id: 'PO-04562', materialId: 'M-100255', supplierId: 'SUP-D', qty: 20_000, confirmedQty: 20_000, issuedAt: '27 Okt 2026', needDate: '10 Nov 2026', etaOriginal: '10 Nov 2026', eta: '10 Nov 2026', status: 'Dikirim' },
  { id: 'PO-04570', materialId: 'M-100277', supplierId: 'SUP-D', qty: 20_000, confirmedQty: 20_000, issuedAt: '29 Okt 2026', needDate: '11 Nov 2026', etaOriginal: '11 Nov 2026', eta: '11 Nov 2026', status: 'Dikirim' },
  { id: 'PO-04560', materialId: 'M-100262', supplierId: 'SUP-E', qty: 25_000, confirmedQty: 25_000, issuedAt: '24 Okt 2026', needDate: '6 Nov 2026', etaOriginal: '6 Nov 2026', eta: '6 Nov 2026', status: 'Diterima', receivedAt: '6 Nov 2026' },
  { id: 'PO-04558', materialId: 'M-200126', supplierId: 'SUP-C', qty: 1_500, confirmedQty: 1_500, issuedAt: '22 Okt 2026', needDate: '5 Nov 2026', etaOriginal: '4 Nov 2026', eta: '5 Nov 2026', status: 'Diterima', receivedAt: '5 Nov 2026' },
  { id: 'PO-04552', materialId: 'M-100241', supplierId: 'SUP-A', qty: 10_000, confirmedQty: 10_000, issuedAt: '13 Okt 2026', needDate: '27 Okt 2026', etaOriginal: '27 Okt 2026', eta: '27 Okt 2026', status: 'Diterima', receivedAt: '27 Okt 2026' },
  { id: 'PO-04548', materialId: 'M-100234', supplierId: 'SUP-A', qty: 35_000, confirmedQty: 35_000, issuedAt: '6 Okt 2026', needDate: '20 Okt 2026', etaOriginal: '20 Okt 2026', eta: '21 Okt 2026', status: 'Diterima', receivedAt: '21 Okt 2026' },
]
export const poById = (id: string) => PURCHASE_ORDERS.find((p) => p.id === id)!

export const CALL_OFFS: CallOff[] = [
  { id: 'CO-04567-01', poId: 'PO-04567', qty: 20_000, confirmedQty: 20_000, date: '21 Nov 2026' },
  { id: 'CO-04567-02', poId: 'PO-04567', qty: 20_000, confirmedQty: 10_000, date: '21 Nov 2026' },
  { id: 'CO-04573-01', poId: 'PO-04573', qty: 12_000, confirmedQty: 8_000, date: '17 Nov 2026' },
  { id: 'CO-04574-01', poId: 'PO-04574', qty: 30_000, confirmedQty: null, date: '24 Nov 2026' },
  { id: 'CO-04578-01', poId: 'PO-04578', qty: 8_000, confirmedQty: null, date: '27 Nov 2026' },
  { id: 'CO-04571-01', poId: 'PO-04571', qty: 12_000, confirmedQty: 12_000, date: '16 Nov 2026' },
  { id: 'CO-04566-01', poId: 'PO-04566', qty: 200, confirmedQty: 200, date: '15 Nov 2026' },
  { id: 'CO-04575-01', poId: 'PO-04575', qty: 200, confirmedQty: 200, date: '12 Nov 2026' },
  { id: 'CO-04569-01', poId: 'PO-04569', qty: 300, confirmedQty: 300, date: '13 Nov 2026' },
  { id: 'CO-04562-01', poId: 'PO-04562', qty: 20_000, confirmedQty: 20_000, date: '10 Nov 2026' },
  { id: 'CO-04570-01', poId: 'PO-04570', qty: 20_000, confirmedQty: 20_000, date: '11 Nov 2026' },
]

// ---------------------------------------------------------------- Selectors (single computation)
const MONTHS: Record<string, number> = { Okt: 10, Nov: 11, Des: 12 }
/** Day index for the "d Mon 2026" strings used in this file. */
export function dayIndex(d: string) {
  const [day, mon] = d.split(' ')
  return (MONTHS[mon] - 10) * 31 + Number(day)
}
export function etaSlip(p: PurchaseOrder) {
  if (!p.eta || !p.etaOriginal) return 0
  return dayIndex(p.eta) - dayIndex(p.etaOriginal)
}

const OPEN: PurchaseOrder['status'][] = ['Diterbitkan', 'Dikonfirmasi', 'Diproses', 'Dikirim']

export const openPOsFor = (materialId: string) =>
  PURCHASE_ORDERS.filter((p) => p.materialId === materialId && OPEN.includes(p.status))

export interface MaterialPosition {
  material: Material
  onOrder: number
  confirmed: number
  secured: number
  gap: number // need − secured (positive = shortage)
  coverage: number // secured / need
  status: MaterialStatus
  pos: PurchaseOrder[]
  nextEta: string | null
  etaSlipDays: number
}

/** PDF A1 rule: on-hand + confirmed supply below 14-day need → Shortage.
 *  Prototype buffer rule: secured below need + safety stock → Waspada. */
export function materialPosition(m: Material): MaterialPosition {
  const pos = openPOsFor(m.id)
  const onOrder = pos.reduce((s, p) => s + p.qty, 0)
  const confirmed = pos.reduce((s, p) => s + (p.confirmedQty ?? 0), 0)
  const secured = m.onHand + confirmed
  const gap = m.need14 - secured
  const status: MaterialStatus = gap > 0 ? 'Shortage' : secured < m.need14 + m.safetyStock ? 'Waspada' : 'Aman'
  const withEta = pos.filter((p) => p.eta)
  const main = withEta[0] ?? null
  return {
    material: m,
    onOrder,
    confirmed,
    secured,
    gap,
    coverage: secured / m.need14,
    status,
    pos,
    nextEta: main?.eta ?? null,
    etaSlipDays: main ? etaSlip(main) : 0,
  }
}

export const POSITIONS = MATERIALS.map(materialPosition)
export const positionById = (id: string) => POSITIONS.find((p) => p.material.id === id)!
export const MAIN = positionById(MAIN_MATERIAL_ID)

export const statusCounts = () => ({
  Aman: POSITIONS.filter((p) => p.status === 'Aman').length,
  Waspada: POSITIONS.filter((p) => p.status === 'Waspada').length,
  Shortage: POSITIONS.filter((p) => p.status === 'Shortage').length,
})

// ---------------------------------------------------------------- Exceptions & alerts
export const EXCEPTIONS: ExceptionCase[] = [
  {
    id: 'EXC-0231',
    title: 'Shortage Packaging Box setelah konfirmasi parsial',
    materialId: 'M-100234',
    poId: 'PO-04567',
    triggers: ['A1', 'A3', 'A5'],
    status: 'Ditangani',
    pic: 'procurement',
    openedAt: '9 Nov 2026, 07:42',
    ageHours: 0.3,
    impact: 'Batch BT-2611-10 Serum Brightening (23 Nov) tidak tertutup 15.000 pcs; BT-2611-08 (19 Nov) terancam karena ETA mundur ke 21 Nov.',
    history: [
      { at: '9 Nov, 07:38', actor: 'Joko · Supplier A', text: 'Konfirmasi PO-04567: sanggup 30.000 dari 40.000, ETA 18 → 21 Nov. Alasan: kapasitas mesin die-cut terbatas.' },
      { at: '9 Nov, 07:40', actor: 'Sistem', text: 'Hitung ulang M-100234: 5.000 stok + 30.000 terkonfirmasi = 35.000 < 50.000. Alert A1, A3, A5 dibuat.' },
      { at: '9 Nov, 07:42', actor: 'Sistem', text: 'Exception dibuka; notifikasi ke Planner, Procurement, PPIC.' },
      { at: '9 Nov, 07:55', actor: 'Budi · Planner', text: 'Memeriksa Material Alignment. Menetapkan Sinta (Procurement) sebagai PIC.' },
    ],
  },
  {
    id: 'EXC-0229',
    title: 'Pump Dispenser kurang 2.800 pcs untuk batch lotion',
    materialId: 'M-100283',
    poId: 'PO-04573',
    triggers: ['A1', 'A5'],
    status: 'Eskalasi',
    pic: 'manager',
    openedAt: '8 Nov 2026, 09:10',
    ageHours: 23,
    impact: 'BT-2611-07 Hand & Body Lotion (16 Nov) hanya siap 81% material pump.',
    history: [
      { at: '8 Nov, 09:05', actor: 'Lina · Supplier B', text: 'Konfirmasi PO-04573: sanggup 8.000 dari 12.000, ETA 17 Nov.' },
      { at: '8 Nov, 09:10', actor: 'Sistem', text: 'Exception dibuka (A1, A5).' },
      { at: '8 Nov, 13:10', actor: 'Sistem', text: 'A6: tanpa PIC selama 4 jam — dieskalasi ke SC Manager.' },
    ],
  },
  {
    id: 'EXC-0227',
    title: 'Konfirmasi PO-04574 Label Depan belum diterima',
    materialId: 'M-100262',
    poId: 'PO-04574',
    triggers: ['A2'],
    status: 'Terbuka',
    pic: 'procurement',
    openedAt: '9 Nov 2026, 06:00',
    ageHours: 2,
    impact: 'Batas konfirmasi 10 Nov 10:00. Stok saat ini masih menutup kebutuhan 14 hari, namun di bawah buffer.',
    history: [
      { at: '9 Nov, 06:00', actor: 'Sistem', text: 'A2: batas konfirmasi kurang dari 24 jam. Pengingat dikirim ke Supplier E.' },
    ],
  },
  {
    id: 'EXC-0224',
    title: 'Selisih kebutuhan vs call-off Shrink Film 6,2%',
    materialId: 'M-100290',
    poId: 'PO-04575',
    triggers: ['A4'],
    status: 'Ditangani',
    pic: 'planner',
    openedAt: '6 Nov 2026, 14:20',
    ageHours: 66,
    impact: 'Call-off 200 roll vs kebutuhan bersih 213 roll. Tidak menghentikan lini, perlu penyesuaian call-off berikutnya.',
    history: [
      { at: '6 Nov, 14:20', actor: 'Sistem', text: 'A4: selisih DA vs call-off 6,2% (> toleransi 5%).' },
      { at: '6 Nov, 15:02', actor: 'Budi · Planner', text: 'Mengambil exception. Menunggu revisi jadwal kemas dari PPIC.' },
    ],
  },
  {
    id: 'EXC-0219',
    title: 'ETA Botol PET 30ml bergeser 3 hari',
    materialId: 'M-100255',
    poId: 'PO-04562',
    triggers: ['A3'],
    status: 'Selesai',
    pic: 'procurement',
    openedAt: '1 Nov 2026, 10:00',
    ageHours: 52,
    impact: 'Diselesaikan dengan pengiriman parsial dari stok supplier.',
    history: [{ at: '3 Nov, 14:00', actor: 'Sinta · Procurement', text: 'Supplier D menyetujui pengiriman 10 Nov. Exception ditutup.' }],
  },
  {
    id: 'EXC-0215',
    title: 'Glycerin USP diterima terlambat 1 hari',
    materialId: 'M-200126',
    poId: 'PO-04558',
    triggers: ['A3'],
    status: 'Selesai',
    pic: 'warehouse',
    openedAt: '4 Nov 2026, 16:00',
    ageHours: 20,
    impact: 'Barang diterima 5 Nov. Tidak berdampak ke produksi.',
    history: [{ at: '5 Nov, 11:30', actor: 'Agus · Warehouse', text: 'Penerimaan dikonfirmasi 1.500 kg. Exception selesai.' }],
  },
]
export const openExceptions = () => EXCEPTIONS.filter((e) => e.status !== 'Selesai')

export const ALERTS: AlertItem[] = [
  { id: 'AL-3391', code: 'A1', title: 'Potensi shortage M-100234', detail: 'Tersedia 35.000 dari kebutuhan 50.000 pcs (14 hari).', at: '07:40', materialId: 'M-100234', recipients: ['planner', 'procurement', 'ppic'], severity: 'critical' },
  { id: 'AL-3392', code: 'A3', title: 'ETA PO-04567 mundur 3 hari', detail: 'ETA 18 Nov → 21 Nov 2026.', at: '07:40', materialId: 'M-100234', recipients: ['procurement', 'planner', 'ppic', 'warehouse'], severity: 'warning' },
  { id: 'AL-3393', code: 'A5', title: 'Supplier A tidak sanggup penuh', detail: 'Konfirmasi 30.000 dari 40.000 pcs.', at: '07:40', materialId: 'M-100234', recipients: ['procurement', 'planner'], severity: 'critical' },
  { id: 'AL-3388', code: 'A2', title: 'Konfirmasi PO-04574 tertunda', detail: 'Batas konfirmasi 10 Nov, 10:00 — kurang dari 24 jam.', at: '06:00', materialId: 'M-100262', recipients: ['procurement'], severity: 'warning' },
  { id: 'AL-3380', code: 'A6', title: 'EXC-0229 dieskalasi', detail: 'Tanpa PIC lebih dari 4 jam.', at: 'Kemarin', materialId: 'M-100283', recipients: ['manager'], severity: 'critical' },
  { id: 'AL-3376', code: 'A1', title: 'Potensi shortage M-100283', detail: 'Tersedia 12.200 dari kebutuhan 15.000 pcs.', at: 'Kemarin', materialId: 'M-100283', recipients: ['planner', 'procurement', 'ppic'], severity: 'critical' },
  { id: 'AL-3361', code: 'A4', title: 'Data tidak align Shrink Film', detail: 'Selisih DA vs call-off 6,2%.', at: '6 Nov', materialId: 'M-100290', recipients: ['planner', 'procurement'], severity: 'info' },
]
export const alertsFor = (role: RoleId) =>
  role === 'admin' ? [] : ALERTS.filter((a) => role === 'manager' || a.recipients.includes(role))

export const ALERT_RULES = [
  { code: 'A1', name: 'Potensi shortage', condition: 'Stok + pasokan terkonfirmasi < kebutuhan', threshold: 'Horizon kebutuhan 14 hari', recipients: 'Planner, Procurement, PPIC' },
  { code: 'A2', name: 'Konfirmasi tertunda', condition: 'Supplier belum konfirmasi mendekati batas', threshold: '24 jam sebelum batas', recipients: 'Supplier (pengingat), Procurement' },
  { code: 'A3', name: 'ETA bergeser', condition: 'ETA baru lebih lambat dari ETA sebelumnya', threshold: 'Selisih > 2 hari', recipients: 'Procurement, Planner, PPIC, Warehouse' },
  { code: 'A4', name: 'Data tidak align', condition: 'Selisih DA vs PO, atau PO vs call-off', threshold: 'Selisih > 5%', recipients: 'Planner, Procurement' },
  { code: 'A5', name: 'Supplier tidak sanggup', condition: 'Supplier tidak mampu / kapasitas di bawah kebutuhan', threshold: 'Setiap kejadian', recipients: 'Procurement, Planner' },
  { code: 'A6', name: 'Exception macet', condition: 'Tanpa PIC atau belum selesai melewati batas', threshold: 'Tanpa PIC 4 jam / > 2 hari kerja', recipients: 'SC Manager' },
] as const

// ---------------------------------------------------------------- Production (PPIC)
// Packaging Box allocation: 5.000 on-hand → BT-04; 30.000 confirmed (ETA 21 Nov) → BT-08 + BT-09; BT-10 uncovered = 15.000.
export const BATCHES: ProductionBatch[] = [
  { id: 'BT-2611-04', product: 'Sunscreen SPF50 50ml', line: 'Lini 3', date: '11 Nov 2026', qty: 5_000, priority: 'Tinggi', materials: [{ materialId: 'M-100234', qty: 5_000 }, { materialId: 'M-200140', qty: 40 }], readiness: 'Aman', note: 'Dialokasikan dari stok 5.000 pcs.' },
  { id: 'BT-2611-05', product: 'Lip Cream Matte 7ml', line: 'Lini 4', date: '12 Nov 2026', qty: 20_000, priority: 'Sedang', materials: [{ materialId: 'M-100277', qty: 20_000 }, { materialId: 'M-100241', qty: 4_000 }], readiness: 'Aman', note: 'Tube tiba 11 Nov (PO-04570).' },
  { id: 'BT-2611-06', product: 'Facial Wash 100ml', line: 'Lini 2', date: '13 Nov 2026', qty: 18_000, priority: 'Sedang', materials: [{ materialId: 'M-200126', qty: 900 }], readiness: 'Aman', note: 'Seluruh material tersedia di gudang.' },
  { id: 'BT-2611-07', product: 'Hand & Body Lotion 250ml', line: 'Lini 2', date: '16 Nov 2026', qty: 15_000, priority: 'Tinggi', materials: [{ materialId: 'M-100283', qty: 15_000 }, { materialId: 'M-200126', qty: 900 }], readiness: 'Shortage', note: 'Pump kurang 2.800 pcs (EXC-0229).' },
  { id: 'BT-2611-11', product: 'Toner Hydrating 150ml (NPD)', line: 'Lini 4', date: '18 Nov 2026', qty: 3_000, priority: 'Sedang', materials: [{ materialId: 'M-200131', qty: 30 }, { materialId: 'M-200152', qty: 6 }], readiness: 'Waspada', note: 'Fragrance di bawah buffer; ETA 15 Nov.' },
  { id: 'BT-2611-08', product: 'Serum Brightening 30ml', line: 'Lini 1', date: '19 Nov 2026', qty: 15_000, priority: 'Tinggi', materials: [{ materialId: 'M-100234', qty: 15_000 }, { materialId: 'M-100255', qty: 15_000 }, { materialId: 'M-100262', qty: 15_000 }], readiness: 'Waspada', note: 'Box baru tiba 21 Nov — lewat 2 hari dari jadwal.' },
  { id: 'BT-2611-09', product: 'Body Mist 100ml', line: 'Lini 3', date: '22 Nov 2026', qty: 15_000, priority: 'Rendah', materials: [{ materialId: 'M-100234', qty: 15_000 }, { materialId: 'M-200131', qty: 45 }], readiness: 'Aman', note: 'Tertutup kedatangan box 21 Nov.' },
  { id: 'BT-2611-10', product: 'Serum Brightening 30ml', line: 'Lini 1', date: '23 Nov 2026', qty: 15_000, priority: 'Tinggi', materials: [{ materialId: 'M-100234', qty: 15_000 }, { materialId: 'M-100255', qty: 15_000 }], readiness: 'Shortage', note: 'Packaging Box belum tertutup: kurang 15.000 pcs.' },
]

// ---------------------------------------------------------------- Demand (Marketing)
export const FORECAST_WEEKS = [
  { week: 'W44', base: 182, adjusted: 182 },
  { week: 'W45', base: 176, adjusted: 176 },
  { week: 'W46', base: 188, adjusted: 214 },
  { week: 'W47', base: 191, adjusted: 222 },
  { week: 'W48', base: 186, adjusted: 205 },
  { week: 'W49', base: 194, adjusted: 228 },
  { week: 'W50', base: 198, adjusted: 247 },
  { week: 'W51', base: 205, adjusted: 238 },
  { week: 'W52', base: 211, adjusted: 216 },
  { week: 'W01', base: 172, adjusted: 158 },
] // ribu unit (finished goods), dummy

export interface DemandChange {
  id: string
  type: 'Promo' | 'NPD' | 'Penyesuaian forecast'
  title: string
  product: string
  delta: string
  period: string
  status: 'Diterima Planner' | 'Ditinjau' | 'Draf'
  readiness: MaterialStatus
  readinessNote: string
}
export const DEMAND_CHANGES: DemandChange[] = [
  { id: 'DC-118', type: 'Promo', title: 'Promo 11.11 & 12.12', product: 'Serum Brightening 30ml', delta: '+20%', period: '10 Nov – 15 Des', status: 'Diterima Planner', readiness: 'Shortage', readinessNote: 'Packaging Box kurang 15.000 pcs' },
  { id: 'DC-124', type: 'Promo', title: 'Promo Payday Akhir Bulan', product: 'Hand & Body Lotion 250ml', delta: '+12%', period: '24 – 30 Nov', status: 'Diterima Planner', readiness: 'Shortage', readinessNote: 'Pump Dispenser kurang 2.800 pcs' },
  { id: 'DC-121', type: 'NPD', title: 'Peluncuran Toner Hydrating', product: 'Toner Hydrating 150ml', delta: '3.000 unit trial', period: 'Launch 1 Des', status: 'Ditinjau', readiness: 'Waspada', readinessNote: 'Fragrance FR-12 di bawah buffer' },
  { id: 'DC-126', type: 'Penyesuaian forecast', title: 'Koreksi musiman Januari', product: 'Sunscreen SPF50 50ml', delta: '−8%', period: 'Jan 2027', status: 'Draf', readiness: 'Aman', readinessNote: 'Tidak ada kendala material' },
]

export const PRODUCT_READINESS: { product: string; status: MaterialStatus; ready: number; driver: string; launch: string }[] = [
  { product: 'Serum Brightening 30ml', status: 'Shortage', ready: 70, driver: 'Packaging Box · M-100234', launch: 'Promo 11.11' },
  { product: 'Hand & Body Lotion 250ml', status: 'Shortage', ready: 81, driver: 'Pump Dispenser · M-100283', launch: 'Payday 24 Nov' },
  { product: 'Toner Hydrating 150ml', status: 'Waspada', ready: 92, driver: 'Fragrance FR-12 · M-200131', launch: 'NPD 1 Des' },
  { product: 'Body Mist 100ml', status: 'Waspada', ready: 96, driver: 'Fragrance FR-12 · M-200131', launch: 'Reguler' },
  { product: 'Sunscreen SPF50 50ml', status: 'Aman', ready: 100, driver: '—', launch: 'Reguler' },
  { product: 'Lip Cream Matte 7ml', status: 'Aman', ready: 100, driver: '—', launch: 'Reguler' },
  { product: 'Facial Wash 100ml', status: 'Aman', ready: 100, driver: '—', launch: 'Reguler' },
]

export const CAMPAIGNS = [
  { id: 'c1', name: 'Promo 11.11', date: '11 Nov', day: 11, status: 'Shortage' as MaterialStatus },
  { id: 'c2', name: 'Trial NPD Toner', date: '18 Nov', day: 18, status: 'Waspada' as MaterialStatus },
  { id: 'c3', name: 'Payday', date: '24 Nov', day: 24, status: 'Shortage' as MaterialStatus },
  { id: 'c4', name: 'Launch Toner', date: '1 Des', day: 32, status: 'Waspada' as MaterialStatus },
  { id: 'c5', name: 'Promo 12.12', date: '12 Des', day: 43, status: 'Shortage' as MaterialStatus },
]

// ---------------------------------------------------------------- Warehouse
export const QUALITY_HOLDS = [
  { id: 'QH-0412', materialId: 'M-200118', lot: 'NIA-2610-B', qty: 25, reason: 'Menunggu COA supplier', since: '7 Nov' },
  { id: 'QH-0409', materialId: 'M-100262', lot: 'LBL-2611-A', qty: 2_000, reason: 'Warna cetak tidak sesuai standar', since: '6 Nov' },
  { id: 'QH-0405', materialId: 'M-200126', lot: 'GLY-2611-C', qty: 120, reason: 'Uji kadar air ulang', since: '5 Nov' },
]
export const WAREHOUSE_ZONES = [
  { zone: 'Packaging (PM)', used: 78, capacity: '2.400 palet' },
  { zone: 'Raw material (RM)', used: 64, capacity: '900 palet' },
  { zone: 'Karantina QC', used: 41, capacity: '120 palet' },
]

// ---------------------------------------------------------------- Manager KPIs (dummy trend)
export const OTD_TREND = [
  { week: 'W38', otd: 82.1 },
  { week: 'W39', otd: 84.6 },
  { week: 'W40', otd: 83.2 },
  { week: 'W41', otd: 86.9 },
  { week: 'W42', otd: 88.4 },
  { week: 'W43', otd: 85.7 },
  { week: 'W44', otd: 89.3 },
  { week: 'W45', otd: 87.4 },
]
export const CONFIRM_TIME_HOURS = 19.5

export const SUPPLIER_SCORES = [
  { supplierId: 'SUP-D', otd: 96, confirmHours: 6, fillRate: 100 },
  { supplierId: 'SUP-C', otd: 94, confirmHours: 4, fillRate: 100 },
  { supplierId: 'SUP-F', otd: 89, confirmHours: 11, fillRate: 100 },
  { supplierId: 'SUP-E', otd: 86, confirmHours: 31, fillRate: 98 },
  { supplierId: 'SUP-B', otd: 81, confirmHours: 22, fillRate: 67 },
  { supplierId: 'SUP-A', otd: 78, confirmHours: 26, fillRate: 75 },
]

export const PARAMETER_PROPOSALS = [
  { id: 'PRM-031', materialId: 'M-100234', field: 'Safety stock', from: '4.000 pcs', to: '6.000 pcs', by: 'Budi · Planner', reason: 'Lead time Supplier A tidak stabil 3 periode terakhir.', status: 'Menunggu persetujuan' },
  { id: 'PRM-029', materialId: 'M-100283', field: 'ROP', from: '6.000 pcs', to: '7.500 pcs', by: 'Budi · Planner', reason: 'Promo payday menaikkan pemakaian pump.', status: 'Menunggu persetujuan' },
]

// ---------------------------------------------------------------- Admin (mock integration — NOT live)
export const INTEGRATION_FEEDS = [
  { name: 'SAP MM · Material master', object: 'Material / SKU', records: 12, mode: 'File dummy', last: '9 Nov, 06:00' },
  { name: 'SAP MM · Purchase order', object: 'Purchase Order, Call-off', records: 14, mode: 'File dummy', last: '9 Nov, 06:00' },
  { name: 'SAP IM · Stok gudang', object: 'Stok', records: 12, mode: 'File dummy', last: '9 Nov, 06:00' },
  { name: 'SAP PP · Jadwal produksi', object: 'Batch produksi', records: 8, mode: 'File dummy', last: '9 Nov, 06:00' },
  { name: 'Portal supplier', object: 'Konfirmasi, ETA', records: 9, mode: 'Lokal (prototipe)', last: '9 Nov, 07:38' },
  { name: 'API / EDI supplier', object: 'Konfirmasi, ASN', records: 0, mode: 'Hanya ilustrasi', last: '—' },
]
export const INTEGRATION_LOG = [
  { at: '9 Nov 07:38', level: 'info', source: 'Portal supplier', text: 'Konfirmasi PO-04567 diterima dari SUP-A (simulasi).' },
  { at: '9 Nov 07:40', level: 'info', source: 'Rule engine (dummy)', text: 'A1, A3, A5 dievaluasi untuk M-100234.' },
  { at: '9 Nov 06:00', level: 'info', source: 'Impor dummy', text: 'Snapshot data simulasi dimuat: 12 SKU, 14 PO, 8 batch.' },
  { at: '9 Nov 06:00', level: 'warn', source: 'Validasi master', text: 'M-200152: lead time belum diverifikasi data steward.' },
  { at: '8 Nov 22:10', level: 'warn', source: 'Validasi master', text: 'SUP-E: kanal API belum dipetakan, gunakan portal.' },
  { at: '8 Nov 13:10', level: 'info', source: 'Rule engine (dummy)', text: 'A6 eskalasi EXC-0229 ke SC Manager.' },
]
export const DATA_QUALITY = [
  { label: 'Master SKU lengkap', value: 11, total: 12, note: '1 SKU tanpa lead time terverifikasi' },
  { label: 'Supplier dengan kanal terpetakan', value: 6, total: 6, note: 'Portal 3 · API 2 · EDI 1' },
  { label: 'PO dengan tanggal butuh', value: 14, total: 14, note: 'Semua PO memiliki need date' },
  { label: 'Parameter ROP/SS terkalibrasi', value: 0, total: 12, note: 'Nilai awal masih dummy (PDF p. 3)' },
]

// ---------------------------------------------------------------- Supplier portal (scoped selectors)
/** Supplier-scoped view. Deliberately exposes NO inventory, prices, or other suppliers' data. */
export function supplierScope(supplierId: string) {
  const pos = PURCHASE_ORDERS.filter((p) => p.supplierId === supplierId)
  const materialIds = Array.from(new Set(pos.map((p) => p.materialId)))
  return {
    pos,
    callOffs: CALL_OFFS.filter((c) => pos.some((p) => p.id === c.poId)),
    materials: materialIds.map((id) => {
      const m = materialById(id)
      return { id: m.id, name: m.name, unit: m.unit }
    }),
  }
}

/** Indicative 12-week projection, per own material. Explicitly not an order. */
export const SUPPLIER_PROJECTION: Record<string, { week: string; range: string; [materialId: string]: number | string }[]> = {
  'SUP-A': [
    { week: 'W46', range: '9–15 Nov', 'M-100234': 0, 'M-100241': 0 },
    { week: 'W47', range: '16–22 Nov', 'M-100234': 15_000, 'M-100241': 4_000 },
    { week: 'W48', range: '23–29 Nov', 'M-100234': 20_000, 'M-100241': 8_000 },
    { week: 'W49', range: '30 Nov–6 Des', 'M-100234': 25_000, 'M-100241': 6_000 },
    { week: 'W50', range: '7–13 Des', 'M-100234': 30_000, 'M-100241': 9_000 },
    { week: 'W51', range: '14–20 Des', 'M-100234': 28_000, 'M-100241': 8_000 },
    { week: 'W52', range: '21–27 Des', 'M-100234': 18_000, 'M-100241': 5_000 },
    { week: 'W01', range: '28 Des–3 Jan', 'M-100234': 14_000, 'M-100241': 4_000 },
    { week: 'W02', range: '4–10 Jan', 'M-100234': 20_000, 'M-100241': 6_000 },
    { week: 'W03', range: '11–17 Jan', 'M-100234': 22_000, 'M-100241': 7_000 },
    { week: 'W04', range: '18–24 Jan', 'M-100234': 22_000, 'M-100241': 7_000 },
    { week: 'W05', range: '25–31 Jan', 'M-100234': 24_000, 'M-100241': 6_000 },
  ],
}
