'use client'
import type { Filters } from '@/types'
import styles from './FiltersBar.module.css'

export interface MercadoGroup { label: string; items: string[] }

const MERCADOS_FUTEBOL: MercadoGroup[] = [
  { label: 'Gols', items: ['Over 0.5','Over 1.5','Over 2.5','Under 1.5','Under 2.5','Under 3.5','Ambas Marcam (BTTS)','Ambas Marcam ou +2.5'] },
  { label: 'Resultado Final', items: ['Casa','Fora','DC Casa','DC Fora','Empate Anula'] },
  { label: 'Período', items: ['Vitória 1º Tempo','Vitória 2º Tempo'] },
  { label: 'Time', items: ['Time Chute a Gol'] },
  { label: 'Jogador', items: ['Jogador Marca','Jogador Assistência','Jogador Marca ou Assistência','Jogador 2+ Gols','Defesa de Goleiro','Chute','Chute a Gol','Finalização de Cabeça','Cabeceio a Gol','Faltas Sofridas','Faltas Cometidas'] },
  { label: 'Cartões', items: ['Over Cartões','Under Cartões','Ambas Recebem Cartão','Jogador Cartão'] },
  { label: 'Outros', items: ['Escanteio','Múltipla'] },
]

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  total: number
  filtered: number
  mercadoGroups?: MercadoGroup[]
}

export default function FiltersBar({ filters, onChange, total, filtered, mercadoGroups }: Props) {
  function set(key: keyof Filters, val: string) { onChange({ ...filters, [key]: val }) }
  function clear() {
    onChange({ mercado: '', situacao: '', resultado: '', valorMin: '', valorMax: '', oddMin: '', oddMax: '' })
  }
  const active = filtered < total
  const groups = mercadoGroups ?? MERCADOS_FUTEBOL

  return (
    <div className={styles.bar}>
      <label>Mercado</label>
      <select className={styles.select} value={filters.mercado} onChange={e => set('mercado', e.target.value)}>
        <option value="">Todos</option>
        {groups.map(g => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map(i => <option key={i}>{i}</option>)}
          </optgroup>
        ))}
      </select>

      <div className={styles.divider}/>

      <label>Situação</label>
      <select className={styles.select} value={filters.situacao} onChange={e => set('situacao', e.target.value)}>
        <option value="">Todas</option>
        <option value="pre">Pré Live</option>
        <option value="ao-vivo">Ao Vivo</option>
      </select>

      <div className={styles.divider}/>

      <label>Resultado</label>
      <select className={styles.select} value={filters.resultado} onChange={e => set('resultado', e.target.value)}>
        <option value="">Todos</option>
        <option value="ganhou">Ganhou</option>
        <option value="perdeu">Perdeu</option>
        <option value="cash">Cash Out</option>
        <option value="pendente">Pendente</option>
      </select>

      <div className={styles.divider}/>

      <label>Valor mín.</label>
      <input className={styles.input} type="number" value={filters.valorMin} onChange={e => set('valorMin', e.target.value)} placeholder="R$ 0" min="0"/>

      <label>Valor máx.</label>
      <input className={styles.input} type="number" value={filters.valorMax} onChange={e => set('valorMax', e.target.value)} placeholder="∞" min="0"/>

      <div className={styles.divider}/>

      <label>Odd mín.</label>
      <input className={styles.input} type="number" value={filters.oddMin} onChange={e => set('oddMin', e.target.value)} placeholder="1.00" step="0.01" min="1"/>

      <label>Odd máx.</label>
      <input className={styles.input} type="number" value={filters.oddMax} onChange={e => set('oddMax', e.target.value)} placeholder="∞" step="0.01" min="1"/>

      <button className={styles.clearBtn} onClick={clear}>✕ Limpar</button>
      {active && <span className={styles.count}>{filtered} de {total} registros</span>}
    </div>
  )
}
