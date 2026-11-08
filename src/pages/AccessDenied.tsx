import { Link } from 'react-router'
import { ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV, type NavKey } from '@/lib/nav'
import { useSession } from '@/lib/session'

export function AccessDenied({ navKey }: { navKey: NavKey }) {
  const { user } = useSession()
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-soft text-fg-muted">
        <Lock className="size-5" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-fg">{NAV[navKey].label} tidak tersedia untuk peran ini</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Menu mengikuti matriks akses per peran pada rancangan SCCHub. Peran {user?.roleLabel} tidak memiliki akses ke halaman ini. Pembatasan di prototipe ini hanya di sisi tampilan.
      </p>
      <Button className="mt-6" variant="outline" asChild>
        <Link to="/dashboard"><ArrowLeft /> Kembali ke dashboard</Link>
      </Button>
    </div>
  )
}
