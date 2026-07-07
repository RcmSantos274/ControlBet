'use client'
import { useState, useEffect } from 'react'
import type { Aposta } from '@/types'
import { fmt, today } from '@/lib/utils'
import GroupSelect, { type SelectGroup } from '../dashboard/GroupSelect'

interface Props {
  open: boolean
  editing: Aposta | null
  onClose: () => void
  onSave: (bet: Aposta) => void
}

const MERCADOS: SelectGroup[] = [
  {
    group: '🏀 Resultado Final',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.07)',
    items: ['Moneyline Casa', 'Moneyline Visitante'],
  },
  {
    group: '📏 Handicap',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.07)',
    items: ['Handicap Casa (-)', 'Handicap Visitante (+)'],
  },
  {
    group: '📊 Pontos',
    color: '#00f0a8',
    bg: 'rgba(0,240,168,0.06)',
    items: ['Over Pontos', 'Under Pontos', 'Over 1º Tempo', 'Under 1º Tempo'],
  },
  {
    group: '⏱️ Período',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.07)',
    items: [
      'Vencedor 1º Quarto', 'Vencedor 2º Quarto',
      'Vencedor 3º Quarto', 'Vencedor 4º Quarto',
      'Vencedor 1º Tempo', 'Vencedor 2º Tempo',
    ],
  },
  {
    group: '🏃 Jogador',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.07)',
    items: [
      'Pontos do Jogador', 'Rebotes do Jogador', 'Assistências do Jogador',
      'PRA (Pts+Reb+Ast)', '3 Pontos Convertidos',
      'Double-Double', 'Triplo-Duplo', 'Maior Pontuador da Partida',
    ],
  },
  {
    group: '🎯 Especiais',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.07)',
    items: ['Prorrogação na Partida', 'Race to 10 Pontos', 'Race to 20 Pontos', 'Múltipla'],
  },
]

const LIGAS: SelectGroup[] = [
  {
    group: '🏆 Principais',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    items: ['NBA', 'Euroliga', 'Copa do Mundo FIBA', 'Olimpíadas'],
  },
  {
    group: '🌎 Sul-americanas',
    color: '#00f0a8',
    bg: 'rgba(0,240,168,0.06)',
    items: ['NBB (Brasil)', 'LNB (Argentina)', 'Liga BSL (Colômbia)'],
  },
  {
    group: '🌍 Europeias',
    color: '#4f8ef7',
    bg: 'rgba(79,142,247,0.06)',
    items: ['EuroCup', 'Liga ACB (Espanha)', 'Bundesliga (Alemanha)', 'Lega Basket (Itália)', 'Pro A (França)', 'BSL (Turquia)', 'VTB United League (Rússia/Europa)'],
  },
  {
    group: '🌐 América do Norte',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.06)',
    items: ['NBA G-League', 'NCAA', 'WNBA'],
  },
  {
    group: '🌏 Asiáticas & Oceania',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.06)',
    items: ['CBA (China)', 'NBL (Austrália)', 'KBL (Coreia do Sul)', 'B.League (Japão)'],
  },
]

function initForm() {
  return { data: today(), partida: '', liga: '', mercado: '', situacao: '', resultado: 'pendente', valor: '', odd: '', cashVal: '', obs: '' }
}

export default function BetModalBasquete({ open, editing, onClose, onSave }: Props) {
  const [f, setF] = useState(initForm())

  useEffect(() => {
    if (!open) return
    if (editing) {
      setF({
        data: editing.data?.slice(0, 10) || today(),
        partida: editing.partida,
        liga: editing.liga || '',
        mercado: editing.mercado,
        situacao: editing.situacao,
        resultado: editing.resultado,
        valor: String(editing.valor),
        odd: String(editing.odd),
        cashVal: editing.cashVal ? String(editing.cashVal) : '',
        obs: editing.obs || '',
      })
    } else {
      setF(initForm())
    }
  }, [open, editing])

  function set(key: string, val: string) { setF(p => ({ ...p, [key]: val })) }

  const v = parseFloat(f.valor) || 0
  const o = parseFloat(f.odd) || 0
  const c = parseFloat(f.cashVal) || 0

  function calcRetorno(): { retorno: string; lucro: string; lucroColor: string } {
    if (f.resultado === 'ganhou' && v && o) return { retorno: fmt(v * o), lucro: fmt(v * o - v), lucroColor: 'var(--green)' }
    if (f.resultado === 'perdeu' && v) return { retorno: 'R$ 0,00', lucro: fmt(-v), lucroColor: 'var(--red)' }
    if (f.resultado === 'cash' && v && c) return { retorno: fmt(c), lucro: fmt(c - v), lucroColor: (c - v) >= 0 ? 'var(--green)' : 'var(--red)' }
    if (v && o) return { retorno: fmt(v * o), lucro: fmt(v * o - v), lucroColor: 'var(--green)' }
    return { retorno: '', lucro: '', lucroColor: 'var(--green)' }
  }

  const calc = calcRetorno()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valor = parseFloat(f.valor)
    const odd = parseFloat(f.odd)
    const cashVal = f.resultado === 'cash' ? (parseFloat(f.cashVal) || 0) : null
    const retorno = f.resultado === 'ganhou' ? valor * odd : f.resultado === 'perdeu' ? 0 : f.resultado === 'cash' ? cashVal! : valor * odd
    const lucro = f.resultado === 'ganhou' ? valor * odd - valor : f.resultado === 'perdeu' ? -valor : f.resultado === 'cash' ? cashVal! - valor : valor * odd - valor
    onSave({
      id: editing?.id || Date.now().toString(),
      partida: f.partida.trim(),
      liga: f.liga || undefined,
      mercado: f.mercado,
      situacao: f.situacao as Aposta['situacao'],
      resultado: f.resultado as Aposta['resultado'],
      valor, odd, retorno, lucro, cashVal,
      obs: f.obs.trim(),
      data: f.data || today(),
    })
  }

  if (!open) return null

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h3>{editing ? 'Editar Aposta' : 'Nova Aposta — Basquete'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Data</label>
              <input type="date" value={f.data} onChange={e => set('data', e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Partida</label>
              <input type="text" value={f.partida} onChange={e => set('partida', e.target.value)} placeholder="Ex: Lakers x Celtics" required />
            </div>

            <div className="form-group">
              <label>Liga</label>
              <GroupSelect value={f.liga} onChange={v => set('liga', v)} groups={LIGAS} placeholder="Selecione a liga…" />
            </div>

            <div className="form-group">
              <label>Mercado</label>
              <GroupSelect value={f.mercado} onChange={v => set('mercado', v)} groups={MERCADOS} required />
            </div>

            <div className="form-group">
              <label>Situação</label>
              <select value={f.situacao} onChange={e => set('situacao', e.target.value)} required>
                <option value="" disabled>Selecione…</option>
                <option value="pre">Pré Live</option>
                <option value="ao-vivo">Ao Vivo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resultado</label>
              <select value={f.resultado} onChange={e => set('resultado', e.target.value)} required>
                <option value="pendente">Pendente</option>
                <option value="ganhou">Ganhou</option>
                <option value="perdeu">Perdeu</option>
                <option value="cash">Cash Out</option>
              </select>
            </div>

            {f.resultado === 'cash' && (
              <div className="form-group full">
                <label style={{ color: '#ff9800', fontWeight: 700, fontSize: '.82rem', letterSpacing: '.04em' }}>💰 Valor do Cash (R$)</label>
                <input type="number" value={f.cashVal} onChange={e => set('cashVal', e.target.value)}
                  placeholder="0.00" step="0.01" min="0"
                  style={{ borderColor: '#ff9800', background: 'rgba(255,152,0,.07)' }} />
              </div>
            )}

            <div className="form-group">
              <label>Valor (R$)</label>
              <input type="number" value={f.valor} onChange={e => set('valor', e.target.value)} placeholder="0.00" step="0.01" min="0" required />
            </div>

            <div className="form-group">
              <label>Odd</label>
              <input type="number" value={f.odd} onChange={e => set('odd', e.target.value)} placeholder="0.00" step="0.01" min="1" required />
            </div>

            <div className="form-group">
              <label>Retorno (calculado)</label>
              <input type="text" value={calc.retorno} readOnly placeholder="—" />
            </div>

            <div className="form-group">
              <label>Lucro Líquido (calculado)</label>
              <input type="text" value={calc.lucro} readOnly placeholder="—" style={{ color: calc.lucroColor }} />
            </div>

            <div className="form-group full">
              <label style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: '.82rem', letterSpacing: '.04em' }}>OBS</label>
              <textarea value={f.obs} onChange={e => set('obs', e.target.value)}
                placeholder="Anote detalhes da aposta…"
                style={{ borderColor: 'var(--yellow)', background: 'rgba(255,193,77,.06)', minHeight: 90 }} />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
