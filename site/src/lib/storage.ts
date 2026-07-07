import type { Aposta, Time } from '@/types'

const APOSTAS_KEY = 'painelbets_apostas'
const TIMES_KEY = 'painelbets_times'

export function loadApostas(): Aposta[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem(APOSTAS_KEY) || '[]')
}

export function saveApostas(data: Aposta[]): void {
  localStorage.setItem(APOSTAS_KEY, JSON.stringify(data))
}

export function loadTimes(): Time[] {
  if (typeof window === 'undefined') return []
  const raw = JSON.parse(localStorage.getItem(TIMES_KEY) || '[]')
  return raw.map((t: any) => {
    if (t.partidas) return t
    const byKey: Record<string, any> = {}
    ;(t.notas || []).forEach((n: any) => {
      const key = n.tipo === 'partida' && n.partida ? n.partida : (n.partida || '__sem_partida__')
      if (!byKey[key]) byKey[key] = {
        id: Date.now().toString(36),
        nome: key === '__sem_partida__' ? 'Notas gerais' : key,
        data: n.data,
        notas: [],
      }
      if (n.tipo !== 'partida') {
        byKey[key].notas.push({ id: Date.now().toString(36), tipo: n.tipo, jogador: n.jogador || '', texto: n.texto, data: n.data })
      }
    })
    return { id: t.id, nome: t.nome, liga: t.liga || '', partidas: Object.values(byKey) }
  })
}

export function saveTimes(data: Time[]): void {
  localStorage.setItem(TIMES_KEY, JSON.stringify(data))
}
