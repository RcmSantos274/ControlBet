'use client'
import type { Aposta } from '@/types'
import { fmt, normBet } from '@/lib/utils'
import styles from './SelectionBar.module.css'

interface Props {
  selected: Set<string>
  apostas: Aposta[]
  onClear: () => void
}

export default function SelectionBar({ selected, apostas, onClear }: Props) {
  if (!selected.size) return null

  let apostado = 0, retorno = 0, lucro = 0
  selected.forEach(id => {
    const b = apostas.find(x => x.id === id)
    if (!b) return
    apostado += b.valor
    if (b.resultado !== 'pendente') {
      const n = normBet(b)
      retorno += n.retorno
      lucro += n.lucro
    }
  })

  const count = selected.size
  return (
    <div className={`${styles.bar} ${styles.open}`}>
      <span className={styles.count}>{count} selecionada{count !== 1 ? 's' : ''}</span>
      <div className={styles.stats}>
        <div className={styles.stat}>Apostado: <strong>{fmt(apostado)}</strong></div>
        <div className={styles.stat}>Retorno: <strong>{fmt(retorno)}</strong></div>
        <div className={`${styles.stat} ${lucro >= 0 ? styles.green : styles.red}`}>
          Lucro: <strong>{fmt(lucro)}</strong>
        </div>
      </div>
      <button className={styles.clearBtn} onClick={onClear}>✕ Limpar</button>
    </div>
  )
}
