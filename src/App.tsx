import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { AppShell } from '@/components/shell/AppShell'
import { AccessDenied } from '@/pages/AccessDenied'
import { Dashboard } from '@/pages/dashboards/Dashboard'
import { Exceptions } from '@/pages/Exceptions'
import { IntegratedOverview } from '@/pages/IntegratedOverview'
import { Login } from '@/pages/Login'
import { MaterialAlignment } from '@/pages/MaterialAlignment'
import { Planning } from '@/pages/Planning'
import { PreviewPage } from '@/pages/PreviewPage'
import { PurchaseOrders } from '@/pages/PurchaseOrders'
import { Settings } from '@/pages/Settings'
import { SupplierPortal } from '@/pages/supplier/SupplierPortal'
import { accessFor, type NavKey } from '@/lib/nav'
import { homePathFor, useSession } from '@/lib/session'

function InternalArea() {
  const { user } = useSession()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />
  // UI containment only (not a security boundary): supplier never gets the internal shell.
  if (!user.internal) return <Navigate to="/supplier" replace state={{ blocked: pathname }} />
  return <AppShell user={user} />
}

function Guard({ k, children }: { k: NavKey; children: ReactNode }) {
  const { user } = useSession()
  if (!user || !accessFor(user.id, k)) return <AccessDenied navKey={k} />
  return <>{children}</>
}

function SupplierArea() {
  const { user } = useSession()
  if (!user) return <Navigate to="/login" replace />
  if (user.internal) return <Navigate to="/dashboard" replace />
  return <SupplierPortal user={user} />
}

function Home() {
  const { user } = useSession()
  return <Navigate to={user ? homePathFor(user.id) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/supplier/*" element={<SupplierArea />} />
      <Route element={<InternalArea />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/overview" element={<Guard k="overview"><IntegratedOverview /></Guard>} />
        <Route path="/material-alignment" element={<Guard k="alignment"><MaterialAlignment /></Guard>} />
        <Route path="/purchase-orders" element={<Guard k="po"><PurchaseOrders /></Guard>} />
        <Route path="/supplier-collaboration" element={<Guard k="collab"><PreviewPage navKey="collab" /></Guard>} />
        <Route path="/exceptions" element={<Guard k="exceptions"><Exceptions /></Guard>} />
        <Route path="/planning" element={<Guard k="planning"><Planning /></Guard>} />
        <Route path="/supplier-performance" element={<Guard k="performance"><PreviewPage navKey="performance" /></Guard>} />
        <Route path="/reports" element={<Guard k="reports"><PreviewPage navKey="reports" /></Guard>} />
        <Route path="/settings" element={<Guard k="settings"><Settings /></Guard>} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
