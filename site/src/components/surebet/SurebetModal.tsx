'use client'
import { useState, useEffect } from 'react'
import type { Surebet } from '@/types'
import styles from './SurebetModal.module.css'

interface Props {
  open: boolean
  editing: Surebet | null
  onClose: () => void
  onSave: (sb: Omit<Surebet, 'id'> & { id?: string }) => void
}

const ESPORTES = ['Futebol', 'Basquete', 'Tênis', 'Am. Football', 'Vôlei', 'Hóquei', 'Beisebol', 'MMA/UFC', 'Outros']

const CASAS = [
  'Bet365', 'Betano', 'Betfair', 'Betmgm', 'Blaze', 'Bookmaker',
  'Br4bet', 'Novibet', 'Pinnacle', 'Sportingbet', 'Stake',
  'Superbet', 'Vaidebet', '1xBet', 'Outras',
]

type Resultado = 'green' | 'meio-green' | 'devolvido' | 'red' | 'meio-red' | 'pendente'

const RES_OPTS: { value: Resultado; label: string; cls: string }[] = [
  { value: 'pendente',   label: 'Pendente',   cls: 'pendente'  },
  { value: 'green',      label: 'Green',      cls: 'green'     },
  { value: 'meio-green', label: 'Meio Green', cls: 'meiogreen' },
  { value: 'devolvido',  label: 'Devolvido',  cls: 'devolvido' },
  { value: 'red',        label: 'Red',        cls: 'red'       },
  { value: 'meio-red',   label: 'Meio Red',   cls: 'meiored'   },
]

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function getReturn(stake: number, odd: number, resultado: Resultado): number {
  switch (resultado) {
    case 'green':      return stake * odd
    case 'meio-green': return stake * (odd + 1) / 2
    case 'devolvido':  return stake
    case 'red':        return 0
    case 'meio-red':   return stake / 2
    default:           return 0
  }
}

function calcLucro(s1: number, o1: number, r1: Resultado, s2: number, o2: number, r2: Resultado) {
  if (r1 === 'pendente' && r2 === 'pendente') return 0
  const total = s1 + s2
  const ret1 = r1 === 'pendente' ? 0 : getReturn(s1, o1, r1)
  const ret2 = r2 === 'pendente' ? 0 : getReturn(s2, o2, r2)
  return ret1 + ret2 - total
}

function calcPct(stake: number, odd: number, total: number) {
  if (!total) return 0
  return (stake * odd - total) / total * 100
}

function initForm() {
  const now = nowLocal()
  return {
    dataAposta: now, dataEvento: now, esporte: '', evento: '',
    casa1: '', casa1Custom: '',
    mercado1: '', odd1: '', stake1: '', resultado1: 'pendente' as Resultado,
    casa2: '', casa2Custom: '',
    mercado2: '', odd2: '', stake2: '', resultado2: 'pendente' as Resultado,
    obs: '',
  }
}

export default function SurebetModal({ open, editing, onClose, onSave }: Props) {
  const [f, setF] = useState(initForm())

  useEffect(() => {
    if (!open) return
    if (editing) {
      const c1InList = CASAS.includes(editing.casa1)
      const c2InList = CASAS.includes(editing.casa2)
      setF({
        dataAposta: editing.dataAposta?.slice(0, 16) || nowLocal(),
        dataEvento: editing.dataEvento?.slice(0, 16) || nowLocal(),
        esporte: editing.esporte,
        evento: editing.evento,
        casa1: c1InList ? editing.casa1 : 'Outras',
        casa1Custom: c1InList ? '' : editing.casa1,
        mercado1: editing.mercado1,
        odd1: String(editing.odd1), stake1: String(editing.stake1),
        resultado1: (editing.resultado1 as Resultado) || 'pendente',
        casa2: c2InList ? editing.casa2 : 'Outras',
        casa2Custom: c2InList ? '' : editing.casa2,
        mercado2: editing.mercado2,
        odd2: String(editing.odd2), stake2: String(editing.stake2),
        resultado2: (editing.resultado2 as Resultado) || 'pendente',
        obs: editing.obs || '',
      })
    } else {
      setF(initForm())
    }
  }, [open, editing])

  function set(key: string, val: string) { setF(p => ({ ...p, [key]: val })) }

  const s1 = parseFloat(f.stake1) || 0
  const o1 = parseFloat(f.odd1) || 0
  const s2 = parseFloat(f.stake2) || 0
  const o2 = parseFloat(f.odd2) || 0
  const total = s1 + s2
  const pct1 = calcPct(s1, o1, total)
  const pct2 = calcPct(s2, o2, total)
  const lucroPreview = calcLucro(s1, o1, f.resultado1, s2, o2, f.resultado2)

  function fmtBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function resolveCasa(val: string, custom: string) {
    return val === 'Outras' ? custom.trim() || 'Outras' : val
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const stake1 = parseFloat(f.stake1)
    const odd1 = parseFloat(f.odd1)
    const stake2 = parseFloat(f.stake2)
    const odd2 = parseFloat(f.odd2)
    const lucro = calcLucro(stake1, odd1, f.resultado1, stake2, odd2, f.resultado2)
    onSave({
      id: editing?.id,
      dataAposta: f.dataAposta, dataEvento: f.dataEvento,
      esporte: f.esporte, evento: f.evento.trim(),
      casa1: resolveCasa(f.casa1, f.casa1Custom),
      mercado1: f.mercado1.trim(), odd1, stake1, resultado1: f.resultado1,
      casa2: resolveCasa(f.casa2, f.casa2Custom),
      mercado2: f.mercado2.trim(), odd2, stake2, resultado2: f.resultado2,
      lucro: parseFloat(lucro.toFixed(2)),
      obs: f.obs.trim(),
    })
  }

  if (!open) return null

  function LegPanel({ leg }: { leg: 1 | 2 }) {
    const casaKey  = `casa${leg}`        as 'casa1'      | 'casa2'
    const custKey  = `casa${leg}Custom`  as 'casa1Custom' | 'casa2Custom'
    const mercKey  = `mercado${leg}`     as 'mercado1'   | 'mercado2'
    const oddKey   = `odd${leg}`         as 'odd1'        | 'odd2'
    const stakeKey = `stake${leg}`       as 'stake1'      | 'stake2'
    const resKey   = `resultado${leg}`   as 'resultado1'  | 'resultado2'
    const casaVal  = f[casaKey]
    const resVal   = f[resKey] as Resultado
    const stake    = leg === 1 ? s1 : s2
    const odd      = leg === 1 ? o1 : o2
    const pct      = leg === 1 ? pct1 : pct2
    const color    = leg === 1 ? '#00f0a8' : '#4f8ef7'

    return (
      <div className={styles.leg}>
        <div className={styles.legTitle} style={{ color }}>Aposta {leg}</div>
        <div className={styles.legGrid}>
          <div className="form-group">
            <label>Casa</label>
            <select value={casaVal} onChange={e => set(casaKey, e.target.value)} required>
              <option value="" disabled>Selecione…</option>
              {CASAS.map(c => <option key={c}>{c}</option>)}
            </select>
            {casaVal === 'Outras' && (
              <input
                type="text"
                value={f[custKey]}
                onChange={e => set(custKey, e.target.value)}
                placeholder="Nome da casa…"
                required
                style={{ marginTop: '.4rem' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Mercado</label>
            <input type="text" value={f[mercKey]} onChange={e => set(mercKey, e.target.value)} placeholder="Ex: TO (18.5)" required />
          </div>
          <div className="form-group">
            <label>Odd</label>
            <input type="number" value={f[oddKey]} onChange={e => set(oddKey, e.target.value)} placeholder="1.00" step="0.001" min="1" required />
          </div>
          <div className="form-group">
            <label>Stake (R$)</label>
            <input type="number" value={f[stakeKey]} onChange={e => set(stakeKey, e.target.value)} placeholder="0.00" step="0.01" min="0" required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Resultado</label>
            <div className={styles.resOpts}>
              {RES_OPTS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.resBtn} ${styles[opt.cls as keyof typeof styles]} ${resVal === opt.value ? styles.resBtnActive : ''}`}
                  onClick={() => set(resKey, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {stake > 0 && odd > 0 && total > 0 && (
          <div className={styles.pct} style={{ color: pct >= 0 ? '#00f0a8' : '#ff3b68' }}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h3>{editing ? 'Editar Surebet' : 'Nova Surebet'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className="form-grid">
              <div className="form-group">
                <label>Esporte</label>
                <select value={f.esporte} onChange={e => set('esporte', e.target.value)} required>
                  <option value="" disabled>Selecione…</option>
                  {ESPORTES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Evento</label>
                <input type="text" value={f.evento} onChange={e => set('evento', e.target.value)} placeholder="Ex: Arsenal x Chelsea" required />
              </div>
              <div className="form-group">
                <label>Data da Aposta</label>
                <input type="datetime-local" value={f.dataAposta} onChange={e => set('dataAposta', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Data do Evento</label>
                <input type="datetime-local" value={f.dataEvento} onChange={e => set('dataEvento', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className={styles.legs}>
            <LegPanel leg={1} />
            <LegPanel leg={2} />
          </div>

          {total > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span>Total Investido</span>
                <strong>{fmtBRL(total)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Lucro</span>
                <strong style={{ color: lucroPreview >= 0 ? '#00f0a8' : '#ff3b68' }}>
                  {lucroPreview >= 0 ? '+' : ''}{fmtBRL(lucroPreview)}
                </strong>
              </div>
              <div className={styles.summaryItem}>
                <span>ROI</span>
                <strong style={{ color: lucroPreview >= 0 ? '#00f0a8' : '#ff3b68' }}>
                  {(lucroPreview / total * 100).toFixed(2)}%
                </strong>
              </div>
            </div>
          )}

          <div className="form-group" style={{ margin: '0 0 1rem' }}>
            <label style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: '.82rem', letterSpacing: '.04em' }}>OBS</label>
            <textarea value={f.obs} onChange={e => set('obs', e.target.value)}
              placeholder="Observações…"
              style={{ borderColor: 'var(--yellow)', background: 'rgba(255,193,77,.06)', minHeight: 70 }} />
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
