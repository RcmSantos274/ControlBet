import type { Aposta } from '@/types'

function n(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
}
function has(s: string, word: string): boolean { return n(s).includes(n(word)) }
function both(s: string, a: string, b: string): boolean { return has(s, a) && has(s, b) }
function bothNot(s: string, a: string, b: string, x: string): boolean { return both(s, a, b) && !has(s, x) }

type Regra = [(s: string) => boolean, string]

const REGRAS: Regra[] = [
  [s => has(s, 'mexico') && (has(s, 'africa do sul') || has(s, 'africa')), '2026-06-11'],
  [s => (has(s, 'coreia') || has(s, 'korea')) && (has(s, 'checia') || has(s, 'republica checa') || has(s, 'tchecia')), '2026-06-11'],
  [s => both(s, 'canada', 'bosnia'), '2026-06-12'],
  [s => (has(s, 'estados unidos') || has(s, 'eua') || has(s, 'usa')) && has(s, 'paraguai'), '2026-06-12'],
  [s => both(s, 'brasil', 'marrocos'), '2026-06-13'],
  [s => both(s, 'haiti', 'escocia'), '2026-06-13'],
  [s => both(s, 'catar', 'suica'), '2026-06-13'],
  [s => both(s, 'australia', 'turquia'), '2026-06-14'],
  [s => both(s, 'alemanha', 'curacao'), '2026-06-14'],
  [s => both(s, 'costa do marfim', 'equador'), '2026-06-14'],
  [s => both(s, 'holanda', 'japao'), '2026-06-14'],
  [s => both(s, 'suecia', 'tunisia'), '2026-06-14'],
  [s => bothNot(s, 'belgica', 'egito', 'ira'), '2026-06-15'],
  [s => bothNot(s, 'ira', 'nova zeland', 'belgica'), '2026-06-15'],
  [s => both(s, 'espanha', 'cabo verde'), '2026-06-15'],
  [s => both(s, 'arabia', 'uruguai'), '2026-06-15'],
  [s => bothNot(s, 'franca', 'senegal', 'noruega'), '2026-06-16'],
  [s => both(s, 'noruega', 'iraque'), '2026-06-16'],
  [s => both(s, 'argentina', 'algeri'), '2026-06-16'],
  [s => both(s, 'austria', 'jordania'), '2026-06-17'],
  [s => both(s, 'portugal', 'congo'), '2026-06-17'],
  [s => both(s, 'colombia', 'uzbe'), '2026-06-17'],
  [s => both(s, 'inglaterra', 'croaci'), '2026-06-17'],
  [s => both(s, 'gana', 'panam'), '2026-06-17'],
  [s => has(s, 'africa do sul') && (has(s, 'checia') || has(s, 'tchecia')), '2026-06-18'],
  [s => has(s, 'coreia') && has(s, 'mexico'), '2026-06-18'],
  [s => bothNot(s, 'suica', 'bosnia', 'catar'), '2026-06-18'],
  [s => both(s, 'canada', 'catar'), '2026-06-18'],
  [s => (has(s, 'estados unidos') || has(s, 'eua') || has(s, 'usa')) && has(s, 'australia'), '2026-06-19'],
  [s => both(s, 'escocia', 'marrocos'), '2026-06-19'],
  [s => both(s, 'brasil', 'haiti'), '2026-06-19'],
  [s => both(s, 'turquia', 'paraguai'), '2026-06-20'],
  [s => both(s, 'alemanha', 'costa do marfim'), '2026-06-20'],
  [s => both(s, 'equador', 'curacao'), '2026-06-20'],
  [s => both(s, 'holanda', 'suecia'), '2026-06-20'],
  [s => both(s, 'japao', 'tunisia'), '2026-06-21'],
  [s => bothNot(s, 'belgica', 'ira', 'egito'), '2026-06-21'],
  [s => bothNot(s, 'egito', 'nova zeland', 'belgica'), '2026-06-21'],
  [s => both(s, 'espanha', 'arabia'), '2026-06-21'],
  [s => both(s, 'uruguai', 'cabo verde'), '2026-06-21'],
  [s => both(s, 'argentina', 'austria'), '2026-06-22'],
  [s => both(s, 'noruega', 'senegal'), '2026-06-22'],
  [s => both(s, 'franca', 'iraque'), '2026-06-22'],
  [s => both(s, 'algeria', 'jordania'), '2026-06-22'],
]

export function corrigirDatasCopa2026(apostas: Aposta[]): { apostas: Aposta[]; fixed: number; log: string[] } {
  let fixed = 0
  const log: string[] = []
  const updated = apostas.map(b => {
    for (const [check, data] of REGRAS) {
      if (check(b.partida)) {
        if (b.data !== data) {
          log.push(`"${b.partida}": ${b.data || '?'} → ${data}`)
          fixed++
          return { ...b, data }
        }
        break
      }
    }
    return b
  })
  return { apostas: updated, fixed, log }
}
