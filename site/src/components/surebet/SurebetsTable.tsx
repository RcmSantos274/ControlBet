'use client'
import type { Surebet } from '@/types'
import styles from './SurebetsTable.module.css'

interface Props {
  surebets: Surebet[]
  onEdit: (sb: Surebet) => void
  onDelete: (id: string) => void
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDt(s: string) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function calcPct(stake: number, odd: number, total: number) {
  if (!total) return 0
  return (stake * odd - total) / total * 100
}

function ResTag({ r }: { r: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    green:       { label: 'Green',      cls: styles.green      },
    'meio-green':{ label: 'Meio Green', cls: styles.meioGreen  },
    devolvido:   { label: 'Devolvido',  cls: styles.devolvido  },
    red:         { label: 'Red',        cls: styles.red        },
    'meio-red':  { label: 'Meio Red',   cls: styles.meioRed    },
    pendente:    { label: 'Pendente',   cls: styles.pend       },
    void:        { label: 'Void',       cls: styles.devolvido  },
  }
  const { label, cls } = map[r] ?? map.pendente
  return <span className={`${styles.tag} ${cls}`}>{label}</span>
}

export default function SurebetsTable({ surebets, onEdit, onDelete }: Props) {
  if (surebets.length === 0) {
    return (
      <div className={styles.empty}>
        Nenhuma surebet registrada ainda.
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data Aposta</th>
            <th>Data Evento</th>
            <th>Esporte</th>
            <th>Evento</th>
            <th>Casa</th>
            <th>Mercado</th>
            <th>ODD</th>
            <th>Stake</th>
            <th>%</th>
            <th>Resultado</th>
            <th>Lucro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {surebets.map((sb, i) => {
            const total = sb.stake1 + sb.stake2
            const pct1 = calcPct(sb.stake1, sb.odd1, total)
            const pct2 = calcPct(sb.stake2, sb.odd2, total)
            const lucroColor = sb.lucro > 0 ? styles.lucroPos : sb.lucro < 0 ? styles.lucroNeg : ''
            const isEven = i % 2 === 0

            return (
              <>
                <tr key={`${sb.id}-1`} className={`${styles.row1} ${isEven ? styles.even : styles.odd}`}>
                  <td rowSpan={2} className={styles.dtCell}>{fmtDt(sb.dataAposta)}</td>
                  <td rowSpan={2} className={styles.dtCell}>{fmtDt(sb.dataEvento)}</td>
                  <td rowSpan={2} className={styles.esporte}>{sb.esporte}</td>
                  <td rowSpan={2} className={styles.evento}>{sb.evento}</td>
                  <td className={styles.casa}>{sb.casa1}</td>
                  <td className={styles.mercado}>{sb.mercado1}</td>
                  <td className={styles.num}>{sb.odd1.toFixed(3)}</td>
                  <td className={styles.num}>{fmtBRL(sb.stake1)}</td>
                  <td className={`${styles.num} ${pct1 >= 0 ? styles.pctPos : styles.pctNeg}`}>
                    {pct1 >= 0 ? '+' : ''}{pct1.toFixed(2)}%
                  </td>
                  <td><ResTag r={sb.resultado1} /></td>
                  <td rowSpan={2} className={`${styles.lucro} ${lucroColor}`}>
                    {sb.resultado1 === 'pendente' && sb.resultado2 === 'pendente'
                      ? '—'
                      : (sb.lucro >= 0 ? '+' : '') + fmtBRL(sb.lucro)}
                  </td>
                  <td rowSpan={2} className={styles.actions}>
                    <button className={styles.btn} onClick={() => onEdit(sb)} title="Editar">✎</button>
                    <button className={`${styles.btn} ${styles.btnDel}`} onClick={() => { if (confirm('Remover surebet?')) onDelete(sb.id) }} title="Remover">✕</button>
                  </td>
                </tr>
                <tr key={`${sb.id}-2`} className={`${styles.row2} ${isEven ? styles.even : styles.odd}`}>
                  <td className={styles.casa}>{sb.casa2}</td>
                  <td className={styles.mercado}>{sb.mercado2}</td>
                  <td className={styles.num}>{sb.odd2.toFixed(3)}</td>
                  <td className={styles.num}>{fmtBRL(sb.stake2)}</td>
                  <td className={`${styles.num} ${pct2 >= 0 ? styles.pctPos : styles.pctNeg}`}>
                    {pct2 >= 0 ? '+' : ''}{pct2.toFixed(2)}%
                  </td>
                  <td><ResTag r={sb.resultado2} /></td>
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
