/* Simulated demo session — NOT authentication. Client-side only. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { userById } from '@/data/mock'
import type { DemoUser, RoleId } from '@/data/types'

const KEY = 'scchub.demo.role'

interface SessionCtx {
  user: DemoUser | null
  signIn: (role: RoleId) => void
  signOut: () => void
}

const Ctx = createContext<SessionCtx | null>(null)

function readStored(): RoleId | null {
  try {
    return (localStorage.getItem(KEY) as RoleId | null) ?? null
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId | null>(readStored)
  const signIn = useCallback((r: RoleId) => {
    setRole(r)
    try {
      localStorage.setItem(KEY, r)
    } catch {
      /* storage unavailable: session lives in memory only */
    }
  }, [])
  const signOut = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])
  const value = useMemo(() => ({ user: role ? userById(role) ?? null : null, signIn, signOut }), [role, signIn, signOut])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}

export const homePathFor = (role: RoleId) => (role === 'supplier' ? '/supplier' : '/dashboard')
