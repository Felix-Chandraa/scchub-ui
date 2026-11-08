import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Bell, CalendarClock, ChevronsUpDown, LogOut, Menu, Repeat2, FlaskConical, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Logo } from '@/components/shared/Logo'
import { AlertCodeTag, Avatar, PhaseTag } from '@/components/shared/ui-kit'
import { DATA_AS_OF, alertsFor } from '@/data/mock'
import type { DemoUser } from '@/data/types'
import { NAV, accessFor, navFor, type NavItem } from '@/lib/nav'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

const GROUP_LABEL: Record<NavItem['group'], string> = { main: 'Ruang kerja', ops: 'Operasional', insight: 'Analisis & sistem' }

function SidebarNav({ user, onNavigate }: { user: DemoUser; onNavigate?: () => void }) {
  const items = navFor(user.id)
  const groups = (['main', 'ops', 'insight'] as const).map((g) => ({ g, items: items.filter((i) => i.group === g) })).filter((x) => x.items.length)
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 scrollbar-thin" aria-label="Navigasi utama">
      {groups.map(({ g, items }) => (
        <div key={g}>
          <div className="mb-1.5 px-3 text-[10.5px] font-semibold tracking-[0.08em] text-ink-muted/80 uppercase">{GROUP_LABEL[g]}</div>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors duration-150',
                      isActive ? 'bg-ink-hover text-white' : 'text-ink-text hover:bg-ink-hover/60 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-mint" aria-hidden />}
                      <item.icon className={cn('size-[17px] shrink-0', isActive ? 'text-mint' : 'text-ink-muted group-hover:text-white')} strokeWidth={1.9} aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {item.phase && <PhaseTag className="ml-auto bg-white/10 text-phase-soft" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarBody({ user, onNavigate }: { user: DemoUser; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-ink">
      <div className={cn('flex items-center justify-between px-5 pt-5 pb-6', onNavigate && 'pr-14')}>
        <Logo />
        <span className="rounded-md border border-mint/30 bg-mint/10 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-mint">DEMO</span>
      </div>
      <SidebarNav user={user} onNavigate={onNavigate} />
      <div className="m-3 rounded-xl border border-ink-line bg-ink-hover/50 p-3">
        <div className="flex items-start gap-2 text-[11.5px] leading-snug text-ink-muted">
          <Unplug className="mt-0.5 size-3.5 shrink-0 text-mint" aria-hidden />
          <span>
            <span className="font-semibold text-white">Data simulasi.</span> SAP tidak terhubung; semua angka ilustratif.
          </span>
        </div>
      </div>
    </div>
  )
}

function AlertsMenu({ user }: { user: DemoUser }) {
  const navigate = useNavigate()
  const alerts = alertsFor(user.id)
  const critical = alerts.filter((a) => a.severity === 'critical').length
  const target = accessFor(user.id, 'exceptions') ? '/exceptions' : '/overview'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-fg-muted" aria-label={`Alert (${alerts.length})`}>
          <Bell className="size-[18px]" />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4 font-semibold text-white ring-2 ring-surface">
              {alerts.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Alert untuk {user.roleShort}</div>
            <div className="text-xs text-fg-muted">{alerts.length ? `${critical} kritis · berdasarkan aturan A1–A6 (dummy)` : 'Tidak ada alert operasional'}</div>
          </div>
        </div>
        <div className="max-h-[340px] overflow-y-auto py-1">
          {alerts.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-fg-muted">Admin menerima log sistem, bukan alert operasional. Lihat Report → log.</p>
          )}
          {alerts.map((a) => (
            <DropdownMenuItem key={a.id} className="mx-1 items-start gap-3 rounded-lg px-3 py-2.5" onSelect={() => navigate(target)}>
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-danger' : a.severity === 'warning' ? 'bg-warning' : 'bg-brand')} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AlertCodeTag code={a.code} />
                  <span className="truncate text-[13px] font-medium text-fg">{a.title}</span>
                </div>
                <div className="mt-0.5 text-xs text-fg-muted">{a.detail}</div>
              </div>
              <span className="shrink-0 text-[11px] text-fg-subtle">{a.at}</span>
            </DropdownMenuItem>
          ))}
        </div>
        {alerts.length > 0 && (
          <div className="border-t px-4 py-2.5 text-xs text-fg-muted">
            Klik alert untuk membuka {target === '/exceptions' ? 'Risk & Exception' : 'Integrated Overview'}.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ProfileMenu({ user, compact = false }: { user: DemoUser; compact?: boolean }) {
  const { signOut } = useSession()
  const navigate = useNavigate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Avatar initials={user.initials} tone={user.internal ? 'ink' : 'teal'} />
          {!compact && (
            <span className="hidden leading-tight md:block">
              <span className="block text-[13px] font-semibold text-fg">{user.name}</span>
              <span className="block text-[11.5px] text-fg-muted">{user.roleLabel}</span>
            </span>
          )}
          <ChevronsUpDown className="hidden size-3.5 text-fg-subtle md:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-fg-muted">{user.roleLabel} · {user.unit}</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-warning-soft px-1.5 py-0.5 text-[11px] font-medium text-warning">
            <FlaskConical className="size-3" /> Akun demo — tanpa autentikasi
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate('/login')}>
            <Repeat2 /> Ganti akun demo
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              signOut()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut /> Keluar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppShell({ user }: { user: DemoUser }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = Object.values(NAV).find((n) => pathname.startsWith(n.path))
  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">
        <SidebarBody user={user} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[272px] border-0 p-0 [&>button]:text-white">
          <SheetTitle className="sr-only">Navigasi</SheetTitle>
          <SheetDescription className="sr-only">Menu sesuai peran {user.roleLabel}</SheetDescription>
          <SidebarBody user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka navigasi">
              <Menu className="size-5" />
            </Button>
            <div className="flex min-w-0 items-center gap-2 text-[13px]">
              <span className="hidden text-fg-subtle sm:inline">{user.roleLabel}</span>
              <span className="hidden text-fg-subtle/60 sm:inline">/</span>
              <span className="truncate font-medium text-fg">{current?.label ?? 'SCCHub'}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <div className="hidden items-center gap-1.5 rounded-lg border bg-sunken px-2.5 py-1.5 text-xs text-fg-muted xl:flex">
                <CalendarClock className="size-3.5" aria-hidden />
                Snapshot {DATA_AS_OF}
                <span className="mx-1 h-3 w-px bg-border" aria-hidden />
                <span className="font-medium text-warning">Simulasi</span>
              </div>
              <AlertsMenu user={user} />
              <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
              <ProfileMenu user={user} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
