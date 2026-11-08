const nf = new Intl.NumberFormat('id-ID')
const pf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

export const fmt = (n: number) => nf.format(n)
export const fmtPct = (n: number) => `${pf.format(n)}%`
export const fmtQty = (n: number, unit: string) => `${nf.format(n)} ${unit}`
export const fmtSigned = (n: number) => (n > 0 ? `+${nf.format(n)}` : n < 0 ? `−${nf.format(Math.abs(n))}` : '0')
export const fmtAge = (hours: number) =>
  hours < 1 ? `${Math.max(1, Math.round(hours * 60))} mnt` : hours < 24 ? `${Math.round(hours)} jam` : `${pf.format(hours / 24)} hari`
