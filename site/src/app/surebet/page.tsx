'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useSurebets } from '@/hooks/useSurebets'
import { today } from '@/lib/utils'
import type { Surebet } from '@/types'
import SurebetModal from '@/components/surebet/SurebetModal'
import SurebetsTable from '@/components/surebet/SurebetsTable'
import styles from './surebet.module.css'

const SurebetCharts = dynamic(() => import('./SurebetChartsClient'), { ssr: false })

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SurebetPage() {
  const { surebets, add, update, remove } = useSurebets()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Surebet | null>(null)

  const done = surebets.filter(sb => sb.resultado1 !== 'pendente' || sb.resultado2 !== 'pendente')
  const totalInvestido = surebets.reduce((s, sb) => s + sb.stake1 + sb.stake2, 0)
  const lucroTotal = done.reduce((s, sb) => s + sb.lucro, 0)
  const roi = totalInvestido > 0 ? lucroTotal / totalInvestido * 100 : 0
  const wins = done.filter(sb => sb.lucro > 0).length

  function handleSave(sb: Omit<Surebet, 'id'> & { id?: string }) {
    if (sb.id) update(sb as Surebet)
    else add(sb)
    setModalOpen(false)
    setEditing(null)
  }

  function handleEdit(sb: Surebet) { setEditing(sb); setModalOpen(true) }

  function exportCSV() {
    const cols = ['Data Aposta','Data Evento','Esporte','Evento','Casa 1','Mercado 1','Odd 1','Stake 1','Resultado 1','Casa 2','Mercado 2','Odd 2','Stake 2','Resultado 2','Lucro']
    const rows = surebets.map(sb => [
      sb.dataAposta, sb.dataEvento, sb.esporte, `"${sb.evento}"`,
      sb.casa1, sb.mercado1, sb.odd1, sb.stake1, sb.resultado1,
      sb.casa2, sb.mercado2, sb.odd2, sb.stake2, sb.resultado2,
      sb.lucro.toFixed(2),
    ])
    const url = URL.createObjectURL(new Blob(['﻿' + [cols, ...rows].map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' }))
    Object.assign(document.createElement('a'), { href: url, download: `surebets_${today()}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className={styles.main}>
      {/* Cards */}
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

      {/* Gráficos */}
      <SurebetCharts surebets={surebets} />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <h2 className={styles.counter}>{surebets.length} surebet{surebets.length !== 1 ? 's' : ''}</h2>
        <div className={styles.actions}>
          <button className="btn ghost sm" onClick={exportCSV}>↓ CSV</button>
          <button className="btn" onClick={() => { setEditing(null); setModalOpen(true) }}>+ Nova Surebet</button>
        </div>
      </div>

      {/* Tabela */}
      <SurebetsTable surebets={surebets} onEdit={handleEdit} onDelete={remove} />

      <SurebetModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
      />
    </main>
  )
}
