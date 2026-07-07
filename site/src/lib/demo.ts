import type { Aposta } from '@/types'

const MERCADOS = [
  'Over 2.5','Over 1.5','Over 0.5','Under 2.5','Casa','Fora',
  'Ambas Recebem Cartão','Jogador Cartão','Escanteio','Múltipla',
  'Chute a Gol','Finalização de Cabeça','DC Casa','Empate Anula',
]
const PARTIDAS = [
  'Brasil x Argentina','Portugal x Espanha','Inglaterra x França',
  'Alemanha x Holanda','Colômbia x Uruguai','México x EUA',
  'Japão x Coreia','Marrocos x Senegal','Itália x Bélgica',
  'Austrália x Nova Zelândia','Chile x Peru','Croácia x Sérvia',
]
const RESULTADOS: Aposta['resultado'][] = ['ganhou','perdeu','ganhou','ganhou','perdeu','cash','pendente','ganhou','perdeu','ganhou']
const SITUACOES: Aposta['situacao'][] = ['pre','ao-vivo','pre','pre','ao-vivo','pre']

function rnd(min: number, max: number, dec = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
}
function rndItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function seedDemoApostas(): Aposta[] {
  const bets: Aposta[] = []
  const now = Date.now()

  for (let i = 0; i < 60; i++) {
    const resultado = rndItem(RESULTADOS)
    const valor = rnd(10, 150, 2)
    const odd = rnd(1.10, 4.50, 2)
    const cashVal = resultado === 'cash' ? rnd(valor * 0.5, valor * odd * 0.85, 2) : null
    const retorno = resultado === 'ganhou' ? valor * odd : resultado === 'cash' ? (cashVal ?? 0) : 0
    const lucro = resultado === 'ganhou' ? retorno - valor : resultado === 'cash' ? (cashVal ?? 0) - valor : resultado === 'perdeu' ? -valor : 0

    bets.push({
      id: (now + i).toString(36) + i,
      partida: rndItem(PARTIDAS),
      mercado: rndItem(MERCADOS),
      situacao: rndItem(SITUACOES),
      resultado,
      valor,
      odd,
      retorno: parseFloat(retorno.toFixed(2)),
      lucro: parseFloat(lucro.toFixed(2)),
      cashVal,
      obs: '',
      data: dateOffset(Math.floor(Math.random() * 45)),
    })
  }

  return bets
}
