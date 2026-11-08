// Shared domain types for SCCHub mock data (PDF p. 7 — nine shared data objects).

export type RoleId =
  | 'marketing'
  | 'planner'
  | 'ppic'
  | 'warehouse'
  | 'procurement'
  | 'manager'
  | 'admin'
  | 'supplier'

export type MaterialStatus = 'Aman' | 'Waspada' | 'Shortage'
export type POStatus = 'Diterbitkan' | 'Dikonfirmasi' | 'Diproses' | 'Dikirim' | 'Diterima'
export type ExceptionStatus = 'Terbuka' | 'Ditangani' | 'Eskalasi' | 'Selesai'
export type AlertCode = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
export type SupplierChannel = 'Portal' | 'API' | 'EDI'

export interface DemoUser {
  id: RoleId
  name: string
  initials: string
  roleLabel: string
  roleShort: string
  /** Illustrative only; never used for authentication. */
  username: string
  unit: string
  supplierId?: string
  internal: boolean
}

export interface Supplier {
  id: string
  code: string
  name: string
  alias: string
  channel: SupplierChannel
  city: string
  contact: string
}

export interface Material {
  id: string
  name: string
  type: 'Packaging' | 'Raw material'
  unit: string
  /** Requirement within the 14-day horizon (dummy). */
  need14: number
  onHand: number
  inTransit: number
  safetyStock: number
  rop: number
  leadTimeDays: number
  supplierId: string
  usedIn: string[]
}

export interface PurchaseOrder {
  id: string
  materialId: string
  supplierId: string
  qty: number
  confirmedQty: number | null
  issuedAt: string
  needDate: string
  etaOriginal: string | null
  eta: string | null
  status: POStatus
  partial?: boolean
  /** Confirmation deadline for Diterbitkan POs. */
  confirmDeadline?: string
  receivedAt?: string
}

export interface CallOff {
  id: string
  poId: string
  qty: number
  confirmedQty: number | null
  date: string
}

export interface ExceptionCase {
  id: string
  title: string
  materialId: string
  poId?: string
  triggers: AlertCode[]
  status: ExceptionStatus
  pic: RoleId | null
  openedAt: string
  ageHours: number
  impact: string
  history: { at: string; actor: string; text: string }[]
}

export interface AlertItem {
  id: string
  code: AlertCode
  title: string
  detail: string
  at: string
  materialId: string
  recipients: RoleId[]
  severity: 'critical' | 'warning' | 'info'
}

export interface ProductionBatch {
  id: string
  product: string
  line: string
  date: string
  qty: number
  priority: 'Tinggi' | 'Sedang' | 'Rendah'
  materials: { materialId: string; qty: number }[]
  readiness: MaterialStatus
  note: string
}
