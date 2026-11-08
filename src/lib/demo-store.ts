/* Local-only demo state (session memory). Nothing here is sent anywhere. */
import { useSyncExternalStore } from 'react'

export interface ProposedPO {
  id: string
  materialId: string
  supplierId: string
  qty: number
  needDate: string
  note: string
  createdBy: string
}

let proposals: ProposedPO[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const proposalStore = {
  add(p: Omit<ProposedPO, 'id'>) {
    proposals = [{ ...p, id: `USL-${String(13 + proposals.length).padStart(4, '0')}` }, ...proposals]
    emit()
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  get: () => proposals,
}

export const useProposals = () => useSyncExternalStore(proposalStore.subscribe, proposalStore.get)
