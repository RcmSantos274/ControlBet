import type { Aposta } from '@/types'

export function fmt(val: number): string {
  return 'R$ ' + Number(val).toFixed(2).replace('.', ',')
}

export function pct(val: number): string {
  return Number(val).toFixed(1) + '%'
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function normBet(b: Aposta): { retorno: number; lucro: number } {
  if (b.resultado === 'ganhou') return { retorno: b.valor * b.odd, lucro: b.valor * b.odd - b.valor }
  if (b.resultado === 'perdeu') return { retorno: 0, lucro: -b.valor }
  if (b.resultado === 'cash') {
    const r = b.cashVal || b.retorno || 0
    return { retorno: r, lucro: r - b.valor }
  }
  return { retorno: b.valor * b.odd, lucro: b.valor * b.odd - b.valor }
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  if (dateStr.length === 10) return dateStr.split('-').reverse().join('/')
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
