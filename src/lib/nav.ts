import {
  BarChart3,
  Boxes,
  FileBarChart2,
  Handshake,
  LayoutDashboard,
  Network,
  Settings2,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { RoleId } from '@/data/types'

export type NavKey =
  | 'dashboard'
  | 'overview'
  | 'alignment'
  | 'po'
  | 'collab'
  | 'exceptions'
  | 'planning'
  | 'performance'
  | 'reports'
  | 'settings'

export interface NavItem {
  key: NavKey
  label: string
  path: string
  icon: LucideIcon
  phase?: 2
  group: 'main' | 'ops' | 'insight'
}

export const NAV: Record<NavKey, NavItem> = {
  dashboard: { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'main' },
  overview: { key: 'overview', label: 'Integrated Overview', path: '/overview', icon: Network, group: 'main' },
  alignment: { key: 'alignment', label: 'Material Alignment', path: '/material-alignment', icon: Boxes, group: 'ops' },
  po: { key: 'po', label: 'Purchase Order', path: '/purchase-orders', icon: ShoppingCart, group: 'ops' },
  collab: { key: 'collab', label: 'Supplier Collaboration', path: '/supplier-collaboration', icon: Handshake, group: 'ops' },
  exceptions: { key: 'exceptions', label: 'Risk & Exception', path: '/exceptions', icon: ShieldAlert, phase: 2, group: 'ops' },
  planning: { key: 'planning', label: 'Planning & Forecast', path: '/planning', icon: TrendingUp, group: 'ops' },
  performance: { key: 'performance', label: 'Supplier Performance', path: '/supplier-performance', icon: BarChart3, phase: 2, group: 'insight' },
  reports: { key: 'reports', label: 'Report', path: '/reports', icon: FileBarChart2, group: 'insight' },
  settings: { key: 'settings', label: 'Pengaturan', path: '/settings', icon: Settings2, group: 'insight' },
}

/** Access per menu, following the role × menu matrix (PDF pp. 10–11). */
export const ACCESS: Record<Exclude<RoleId, 'supplier'>, Partial<Record<NavKey, string>>> = {
  marketing: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Ringkasan kesiapan', exceptions: 'Lihat', planning: 'Kelola', reports: 'Lihat' },
  planner: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Kelola', po: 'Lihat', collab: 'Lihat', exceptions: 'Kelola', planning: 'Lihat', performance: 'Lihat', reports: 'Lihat' },
  procurement: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Lihat', po: 'Kelola', collab: 'Kelola', exceptions: 'Kelola', planning: 'Lihat', performance: 'Lihat', reports: 'Lihat' },
  ppic: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Lihat', po: 'Lihat', exceptions: 'Tanggapi', planning: 'Kelola', reports: 'Lihat' },
  warehouse: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Lihat (incoming)', po: 'Konfirmasi terima', exceptions: 'Lihat' },
  manager: { dashboard: 'Lihat', overview: 'Lihat', alignment: 'Lihat', po: 'Lihat', collab: 'Lihat', exceptions: 'Setujui', planning: 'Lihat', performance: 'Lihat', reports: 'Lihat' },
  admin: { dashboard: 'Kesehatan integrasi', overview: 'Lihat', reports: 'Lihat (log)', settings: 'Konfigurasi' },
}

export function navFor(role: RoleId): NavItem[] {
  if (role === 'supplier') return []
  return (Object.keys(ACCESS[role]) as NavKey[]).map((k) => NAV[k])
}

export function accessFor(role: RoleId, key: NavKey): string | null {
  if (role === 'supplier') return null
  return ACCESS[role][key] ?? null
}
