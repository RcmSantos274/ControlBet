'use client'
import { useSurebets } from '@/hooks/useSurebets'
import dynamic from 'next/dynamic'
import styles from '../surebet.module.css'

const SurebetCharts = dynamic(() => import('../SurebetChartsClient'), { ssr: false })

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SurebetAnalisePage() {
  const { surebets } = useSurebets()

  const done = surebets.filter(sb => sb.resultado1 !== 'pendente' || sb.resultado2 !== 'pendente')
  const totalInvestido = surebets.reduce((s, sb) => s + sb.stake1 + sb.stake2, 0)
  const lucroTotal = done.reduce((s, sb) => s + sb.lucro, 0)
  const roi = totalInvestido > 0 ? lucroTotal / totalInvestido * 100 : 0
  const wins = done.filter(sb => sb.lucro > 0).length

  if (!surebets.length) {
    return (
      <main className={styles.main}>
        <div className="empty-state"><div className="icon">📊</div><div>Nenhuma surebet registrada ainda.</div></div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.cards}>
        <div className="card">
          <div className="card-label">Total Investido</div>
          <div className="card-value blue">{fmtBRL(totalInvestido)}</div>
        </div>
        <div className="card">
          <div className="card-label">Lucro Total</div>
          <div className={`card-value ${lucroTotal >= 0 ? 'green' : 'red'}`}>{fmtBRL(lucroTotal)}</div>
        </div>
        <div className="card">
          <div className="card-label">ROI</div>
          <div className={`card-value ${roi >= 0 ? 'green' : 'red'}`}>{roi.toFixed(2)}%</div>
        </div>
        <div className="card">
          <div className="card-label">Surebets / Lucrativas</div>
          <div className="card-value">{surebets.length} / {wins}</div>
        </div>
      </div>
      <SurebetCharts surebets={surebets} />
    </main>
  )
}
