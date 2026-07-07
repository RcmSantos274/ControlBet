'use client'
import { useState, useMemo } from 'react'
import { useApostas } from '@/hooks/useApostas'
import { fmt, today, normBet } from '@/lib/utils'
import type { Aposta, Filters, SortState, SortCol } from '@/types'
import BetModalBasquete from '@/components/basquete/BetModalBasquete'
import BetsTable from '@/components/dashboard/BetsTable'
import FiltersBar, { type MercadoGroup } from '@/components/dashboard/FiltersBar'
import SelectionBar from '@/components/dashboard/SelectionBar'
import styles from '../dashboard.module.css'

const emptyFilters: Filters = { mercado: '', situacao: '', resultado: '', valorMin: '', valorMax: '', oddMin: '', oddMax: '' }

const MERCADO_GROUPS: MercadoGroup[] = [
  { label: 'Resultado Final', items: ['Moneyline Casa','Moneyline Visitante'] },
  { label: 'Handicap', items: ['Handicap Casa (-)','Handicap Visitante (+)'] },
  { label: 'Pontos', items: ['Over Pontos','Under Pontos','Over 1º Tempo','Under 1º Tempo'] },
  { label: 'Período', items: ['Vencedor 1º Quarto','Vencedor 2º Quarto','Vencedor 3º Quarto','Vencedor 4º Quarto','Vencedor 1º Tempo','Vencedor 2º Tempo'] },
  { label: 'Jogador', items: ['Pontos do Jogador','Rebotes do Jogador','Assistências do Jogador','PRA (Pts+Reb+Ast)','3 Pontos Convertidos','Double-Double','Triplo-Duplo','Maior Pontuador da Partida'] },
  { label: 'Especiais', items: ['Prorrogação na Partida','Race to 10 Pontos','Race to 20 Pontos','Múltipla'] },
]

export default function BasqueteDashboard() {
  const { apostas, add, update, remove } = useApostas('basquete')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Aposta | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [sortState, setSortState] = useState<SortState>({ col: null, dir: 'desc' })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const resolved = apostas.filter(b => b.resultado !== 'pendente')
  const winners = apostas.filter(b => b.resultado === 'ganhou' || b.resultado === 'cash')
  const totalApostado = apostas.reduce((s, b) => s + b.valor, 0)
  const totalRetornos = winners.reduce((s, b) => s + normBet(b).retorno, 0)
  const lucroLiquido = totalRetornos - resolved.reduce((s, b) => s + b.valor, 0)
  const ganhas = apostas.filter(b => b.resultado === 'ganhou').length

  const filtered = useMemo(() => {
    const f = filters
    const vMin = parseFloat(f.valorMin) || 0
    const vMax = parseFloat(f.valorMax) || Infinity
    const oMin = parseFloat(f.oddMin) || 0
    const oMax = parseFloat(f.oddMax) || Infinity
    return apostas.filter(b =>
      (!f.mercado || b.mercado === f.mercado) &&
      (!f.situacao || b.situacao === f.situacao) &&
      (!f.resultado || b.resultado === f.resultado) &&
      b.valor >= vMin && b.valor <= vMax &&
      b.odd >= oMin && b.odd <= oMax
    )
  }, [apostas, filters])

  const sorted = useMemo(() => {
    if (!sortState.col) return filtered
    const key = sortState.col
    const dir = sortState.dir === 'desc' ? -1 : 1
    return [...filtered].sort((a, b) => {
      if (key === 'data') {
        const da = (a.data || '').slice(0, 10)
        const db = (b.data || '').slice(0, 10)
        return da < db ? -dir : da > db ? dir : 0
      }
      const va = key === 'retorno' ? normBet(a).retorno : key === 'lucro' ? normBet(a).lucro : (a as any)[key]
      const vb = key === 'retorno' ? normBet(b).retorno : key === 'lucro' ? normBet(b).lucro : (b as any)[key]
      return (va - vb) * dir
    })
  }, [filtered, sortState])

  function handleSort(col: SortCol) {
    setSortState(s => {
      if (s.col === col) {
        if (s.dir === 'desc') return { col, dir: 'asc' }
        return { col: null, dir: 'desc' }
      }
      return { col, dir: 'desc' }
    })
  }

  function handleSave(bet: Aposta) {
    if (editing) update(bet)
    else add(bet)
    setModalOpen(false)
    setEditing(null)
  }

  function handleEdit(b: Aposta) { setEditing(b); setModalOpen(true) }
  function handleDelete(id: string) { if (confirm('Remover esta aposta?')) remove(id) }

  function handleSelect(id: string, checked: boolean) {
    setSelected(s => { const n = new Set(s); checked ? n.add(id) : n.delete(id); return n })
  }
  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(sorted.map(b => b.id)) : new Set())
  }

  function exportCSV() {
    const cols = ['Partida','Liga','Mercado','Situação','Valor','Odd','Retorno','Lucro Líq.','Resultado','Obs','Data']
    const rows = apostas.map(b => [
      `"${b.partida}"`, b.liga ?? '',  b.mercado,
      b.situacao === 'pre' ? 'Pré Live' : 'Ao Vivo',
      b.valor, b.odd,
      b.retorno.toFixed(2), b.lucro.toFixed(2), b.resultado,
      `"${(b.obs || '').replace(/"/g, '""')}"`,
      new Date(b.data).toLocaleDateString('pt-BR'),
    ])
    const url = URL.createObjectURL(new Blob(['﻿' + [cols, ...rows].map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' }))
    Object.assign(document.createElement('a'), { href: url, download: `basquete_${today()}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  function exportJSON() {
    const d = JSON.stringify({ apostas, exportedAt: new Date().toISOString() }, null, 2)
    const url = URL.createObjectURL(new Blob([d], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: `basquete_${today()}.json` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className={styles.main}>
      <div className={styles.cards}>
        <div className="card"><div className="card-label">Total Apostado</div><div className="card-value blue">{fmt(totalApostado)}</div></div>
        <div className="card"><div className="card-label">Total Retornos</div><div className="card-value">{fmt(totalRetornos)}</div></div>
        <div className="card"><div className="card-label">Lucro Líquido</div><div className={`card-value ${lucroLiquido >= 0 ? 'green' : 'red'}`}>{fmt(lucroLiquido)}</div></div>
        <div className="card"><div className="card-label">Apostas / Ganhas</div><div className="card-value">{apostas.length} / {ganhas}</div></div>
      </div>

      <div className={styles.toolbar}>
        <h2 className={styles.counter}>{apostas.length} registro{apostas.length !== 1 ? 's' : ''}</h2>
        <div className={styles.actions}>
          <button className="btn ghost sm" onClick={exportCSV}>↓ CSV</button>
          <button className="btn ghost sm" onClick={exportJSON}>↓ JSON</button>
          <button className="btn" onClick={() => { setEditing(null); setModalOpen(true) }}>+ Nova Aposta</button>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} total={apostas.length} filtered={filtered.length} mercadoGroups={MERCADO_GROUPS} />

      <BetsTable
        rows={sorted}
        sortState={sortState}
        onSort={handleSort}
        selected={selected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenDrawer={() => {}}
        times={[]}
      />

      <BetModalBasquete open={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={handleSave} />
      <SelectionBar selected={selected} apostas={apostas} onClear={() => setSelected(new Set())} />
    </main>
  )
}
