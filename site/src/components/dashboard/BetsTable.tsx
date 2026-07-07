'use client'
import type { Aposta, SortState, SortCol, Time } from '@/types'
import { fmt, formatDate, normBet } from '@/lib/utils'
import styles from './BetsTable.module.css'

interface Props {
  rows: Aposta[]
  sortState: SortState
  onSort: (col: SortCol) => void
  selected: Set<string>
  onSelect: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (b: Aposta) => void
  onDelete: (id: string) => void
  onOpenDrawer: (partida: string) => void
  times: Time[]
}

function SortIcon({ col, state }: { col: SortCol; state: SortState }) {
  const isActive = state.col === col
  return (
    <span className={styles.sortIcon}>
      <svg className={`${styles.arrUp} ${isActive && state.dir === 'asc' ? styles.active : ''}`} width="7" height="5" viewBox="0 0 7 5">
        <path d="M3.5 0L7 5H0z" fill="currentColor"/>
      </svg>
      <svg className={`${styles.arrDown} ${isActive && state.dir === 'desc' ? styles.active : ''}`} width="7" height="5" viewBox="0 0 7 5">
        <path d="M3.5 5L0 0h7z" fill="currentColor"/>
      </svg>
    </span>
  )
}

function notaCount(partida: string, times: Time[]): number {
  const p = partida.toLowerCase().trim()
  let cnt = 0
  times.forEach(t => (t.partidas || []).forEach(mp => {
    if (mp.nome.toLowerCase().trim() === p) cnt += (mp.notas || []).length
  }))
  return cnt
}

const SIT = { pre: 'Pré Live', 'ao-vivo': 'Ao Vivo' } as const

export default function BetsTable({ rows, sortState, onSort, selected, onSelect, onSelectAll, onEdit, onDelete, onOpenDrawer, times }: Props) {
  const allChecked = rows.length > 0 && rows.every(b => selected.has(b.id))
  const someChecked = rows.some(b => selected.has(b.id))

  if (!rows.length) {
    return (
      <div className={styles.wrap}>
        <table className={styles.table}>
          <tbody>
            <tr><td colSpan={13}><div className="empty-state"><div className="icon">📋</div><div>Nenhuma aposta encontrada.</div></div></td></tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}>
              <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                onChange={e => onSelectAll(e.target.checked)}/>
            </th>
            <th>#</th>
            <th className={styles.thSort} onClick={() => onSort('data')}>Data<SortIcon col="data" state={sortState}/></th>
            <th>Partida</th>
            <th>Mercado</th>
            <th>Situação</th>
            <th className={styles.thSort} onClick={() => onSort('valor')}>Valor (R$)<SortIcon col="valor" state={sortState}/></th>
            <th className={styles.thSort} onClick={() => onSort('odd')}>Odd<SortIcon col="odd" state={sortState}/></th>
            <th className={styles.thSort} onClick={() => onSort('retorno')}>Retorno<SortIcon col="retorno" state={sortState}/></th>
            <th className={styles.thSort} onClick={() => onSort('lucro')}>Lucro Líq.<SortIcon col="lucro" state={sortState}/></th>
            <th>Resultado</th>
            <th>Obs</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b, i) => {
            const { retorno, lucro } = normBet(b)
            const cnt = notaCount(b.partida, times)
            const isSelected = selected.has(b.id)
            return (
              <tr key={b.id} className={isSelected ? styles.selected : ''}>
                <td className={styles.checkCol}>
                  <input type="checkbox" checked={isSelected} onChange={e => onSelect(b.id, e.target.checked)}/>
                </td>
                <td className={styles.num}>{rows.length - i}</td>
                <td className={styles.dateCell}>{formatDate(b.data)}</td>
                <td>
                  <div className={styles.partidaCell} onClick={() => onOpenDrawer(b.partida)}>
                    <span className={styles.partidaTxt}>{b.partida}</span>
                    {cnt > 0 && <span className={styles.notasBadge}>{cnt}</span>}
                  </div>
                </td>
                <td>{b.mercado}</td>
                <td><span className={`badge ${b.situacao}`}>{SIT[b.situacao] || b.situacao}</span></td>
                <td>R$ {Number(b.valor).toFixed(2).replace('.', ',')}</td>
                <td>{Number(b.odd).toFixed(2)}</td>
                <td className={b.resultado === 'perdeu' ? 'valor-neg' : 'valor-pos'}>{fmt(retorno)}</td>
                <td className={lucro >= 0 ? 'valor-pos' : 'valor-neg'}>{fmt(lucro)}</td>
                <td>
                  <span className={`badge ${b.resultado}`}>
                    {b.resultado === 'cash' ? '💰 Cash' : b.resultado === 'ganhou' ? 'Ganhou' : b.resultado === 'perdeu' ? 'Perdeu' : 'Pendente'}
                  </span>
                </td>
                <td className={styles.obsCell}>{b.obs || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                <td>
                  <button className="btn ghost sm" onClick={() => onEdit(b)}>Editar</button>
                  <button className="btn danger sm" onClick={() => onDelete(b.id)} style={{ marginLeft: '.3rem' }}>Del</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
