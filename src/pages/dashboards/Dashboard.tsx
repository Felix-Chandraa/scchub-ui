import { useSession } from '@/lib/session'
import { AdminDashboard } from './AdminDashboard'
import { ManagerDashboard } from './ManagerDashboard'
import { MarketingDashboard } from './MarketingDashboard'
import { PlannerDashboard } from './PlannerDashboard'
import { PpicDashboard } from './PpicDashboard'
import { ProcurementDashboard } from './ProcurementDashboard'
import { WarehouseDashboard } from './WarehouseDashboard'

export function Dashboard() {
  const { user } = useSession()
  switch (user?.id) {
    case 'marketing':
      return <MarketingDashboard />
    case 'ppic':
      return <PpicDashboard />
    case 'warehouse':
      return <WarehouseDashboard />
    case 'procurement':
      return <ProcurementDashboard />
    case 'manager':
      return <ManagerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <PlannerDashboard />
  }
}
