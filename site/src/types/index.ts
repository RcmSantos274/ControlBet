export interface Aposta {
  id: string
  partida: string
  mercado: string
  liga?: string
  sport?: string
  situacao: 'pre' | 'ao-vivo'
  resultado: 'ganhou' | 'perdeu' | 'cash' | 'pendente'
  valor: number
  odd: number
  retorno: number
  lucro: number
  cashVal: number | null
  obs: string
  data: string
}

export interface Nota {
  id: string
  tipo: 'time' | 'jogador' | 'geral'
  jogador: string
  texto: string
  data: string
}

export interface Partida {
  id: string
  nome: string
  data: string
  notas: Nota[]
}

export interface Time {
  id: string
  nome: string
  liga: string
  partidas: Partida[]
}

export interface Surebet {
  id: string
  dataAposta: string
  dataEvento: string
  esporte: string
  evento: string
  casa1: string
  mercado1: string
  odd1: number
  stake1: number
  resultado1: 'green' | 'meio-green' | 'devolvido' | 'red' | 'meio-red' | 'pendente'
  casa2: string
  mercado2: string
  odd2: number
  stake2: number
  resultado2: 'green' | 'meio-green' | 'devolvido' | 'red' | 'meio-red' | 'pendente'
  lucro: number
  obs: string
}

export type SortCol = 'data' | 'valor' | 'odd' | 'retorno' | 'lucro' | null
export type SortDir = 'asc' | 'desc'

export interface SortState {
  col: SortCol
  dir: SortDir
}

export interface Filters {
  mercado: string
  situacao: string
  resultado: string
  valorMin: string
  valorMax: string
  oddMin: string
  oddMax: string
}
