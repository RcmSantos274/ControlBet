'use client'
import { useState } from 'react'
import { useTimes } from '@/hooks/useTimes'
import { uid, initials } from '@/lib/utils'
import type { Time, Partida, Nota } from '@/types'
import styles from './anotacoes.module.css'

type View = 'none' | 'partidas' | 'notas'
type NoteFilter = 'todos' | 'time' | 'jogador' | 'geral'

export default function AnotacoesPage() {
  const { times, save } = useTimes()
  const [search, setSearch] = useState('')
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [activePartidaId, setActivePartidaId] = useState<string | null>(null)
  const [view, setView] = useState<View>('none')
  const [noteFilter, setNoteFilter] = useState<NoteFilter>('todos')

  // Team modal
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [teamEditId, setTeamEditId] = useState('')
  const [tNome, setTNome] = useState('')
  const [tLiga, setTLiga] = useState('')

  // Partida modal
  const [partidaModalOpen, setPartidaModalOpen] = useState(false)
  const [partidaEditId, setPartidaEditId] = useState('')
  const [pNome, setPNome] = useState('')

  // Nova nota
  const [notaTipo, setNotaTipo] = useState<'time'|'jogador'|'geral'>('time')
  const [notaJogador, setNotaJogador] = useState('')
  const [notaTexto, setNotaTexto] = useState('')

  const filtered = times.filter(t => t.nome.toLowerCase().includes(search.toLowerCase()))
  const activeTeam = times.find(t => t.id === activeTeamId) || null
  const activePartida = activeTeam?.partidas?.find(p => p.id === activePartidaId) || null

  function selectTeam(id: string) {
    setActiveTeamId(id); setActivePartidaId(null); setView('partidas')
  }

  function selectPartida(id: string) {
    setActivePartidaId(id); setNoteFilter('todos'); setView('notas')
  }

  // ── Team CRUD ──
  function openAddTeam() { setTeamEditId(''); setTNome(''); setTLiga(''); setTeamModalOpen(true) }
  function openEditTeam() {
    if (!activeTeam) return
    setTeamEditId(activeTeam.id); setTNome(activeTeam.nome); setTLiga(activeTeam.liga || ''); setTeamModalOpen(true)
  }
  function saveTeam(e: React.FormEvent) {
    e.preventDefault()
    if (teamEditId) {
      save(times.map(t => t.id === teamEditId ? { ...t, nome: tNome, liga: tLiga } : t))
    } else {
      save([{ id: uid(), nome: tNome, liga: tLiga, partidas: [] }, ...times])
    }
    setTeamModalOpen(false)
  }
  function deleteTeam() {
    if (!activeTeam) return
    if (!confirm(`Remover "${activeTeam.nome}" e todas as partidas?`)) return
    save(times.filter(t => t.id !== activeTeamId))
    setActiveTeamId(null); setActivePartidaId(null); setView('none')
  }

  // ── Partida CRUD ──
  function openAddPartida() { setPartidaEditId(''); setPNome(''); setPartidaModalOpen(true) }
  function openEditPartida() {
    if (!activePartida) return
    setPartidaEditId(activePartida.id); setPNome(activePartida.nome); setPartidaModalOpen(true)
  }
  function savePartida(e: React.FormEvent) {
    e.preventDefault()
    if (partidaEditId) {
      save(times.map(t => t.id === activeTeamId ? {
        ...t, partidas: (t.partidas || []).map(p => p.id === partidaEditId ? { ...p, nome: pNome } : p)
      } : t))
      setView('notas')
    } else {
      const nova: Partida = { id: uid(), nome: pNome, data: new Date().toISOString(), notas: [] }
      save(times.map(t => t.id === activeTeamId ? { ...t, partidas: [...(t.partidas || []), nova] } : t))
      setView('partidas')
    }
    setPartidaModalOpen(false)
  }
  function deletePartida(id: string) {
    const p = activeTeam?.partidas?.find(x => x.id === id)
    if (!confirm(`Remover "${p?.nome}" e todas as anotações?`)) return
    save(times.map(t => t.id === activeTeamId ? { ...t, partidas: (t.partidas || []).filter(x => x.id !== id) } : t))
    if (activePartidaId === id) { setActivePartidaId(null); setView('partidas') }
  }

  // ── Nota CRUD ──
  function addNota() {
    if (!activeTeamId || !activePartidaId || !notaTexto.trim()) return
    const nota: Nota = { id: uid(), tipo: notaTipo, jogador: notaTipo === 'jogador' ? notaJogador : '', texto: notaTexto.trim(), data: new Date().toISOString() }
    save(times.map(t => t.id === activeTeamId ? {
      ...t, partidas: (t.partidas || []).map(p => p.id === activePartidaId ? { ...p, notas: [...(p.notas || []), nota] } : p)
    } : t))
    setNotaTexto(''); setNotaJogador('')
  }
  function deleteNota(idx: number) {
    save(times.map(t => t.id === activeTeamId ? {
      ...t, partidas: (t.partidas || []).map(p => p.id === activePartidaId ? { ...p, notas: (p.notas || []).filter((_, i) => i !== idx) } : p)
    } : t))
  }

  const visibleNotas = (activePartida?.notas || []).filter(n => noteFilter === 'todos' || n.tipo === noteFilter)
  const TIPO_LABEL: Record<string, string> = { time: 'Time', jogador: 'Jogador', geral: 'Geral' }

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Times</h2>
          <input className={styles.search} type="text" placeholder="Buscar time…" value={search} onChange={e => setSearch(e.target.value)}/>
          <button className={styles.btnSidebar} onClick={openAddTeam}>+ Adicionar Time</button>
        </div>
        <div className={styles.teamList}>
          {filtered.length === 0
            ? <div className={styles.emptyList}>{search ? 'Nenhum time encontrado.' : 'Nenhum time cadastrado.'}</div>
            : filtered.map(t => (
              <div key={t.id} className={`${styles.teamItem} ${t.id === activeTeamId ? styles.active : ''}`} onClick={() => selectTeam(t.id)}>
                <div className={styles.avatar}>{initials(t.nome)}</div>
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{t.nome}</div>
                  <div className={styles.teamMeta}>{t.liga || 'Sem liga'} · {(t.partidas||[]).length} partida{(t.partidas||[]).length!==1?'s':''}</div>
                </div>
              </div>
            ))
          }
        </div>
      </aside>

      {/* MAIN */}
      <section className={styles.detail}>
        {view === 'none' && (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>⚽</div>
            <p>Selecione um time para ver as partidas</p>
          </div>
        )}

        {view === 'partidas' && activeTeam && (
          <div className={styles.partidasView}>
            <div className={styles.panelHeader}>
              <div className={styles.panelAvatar}>{initials(activeTeam.nome)}</div>
              <div className={styles.panelTitle}>
                <h2>{activeTeam.nome}</h2>
                <p>{activeTeam.liga || 'Sem liga'}</p>
              </div>
              <div className={styles.panelActions}>
                <button className="btn ghost" onClick={openEditTeam}>Editar</button>
                <button className="btn danger" onClick={deleteTeam}>Remover</button>
              </div>
            </div>
            <div className={styles.partidasToolbar}>
              <span>{(activeTeam.partidas||[]).length} partida{(activeTeam.partidas||[]).length!==1?'s':''}</span>
              <button className="btn primary" onClick={openAddPartida}>+ Nova Partida</button>
            </div>
            <div className={styles.partidasList}>
              {!(activeTeam.partidas||[]).length
                ? <div className={styles.emptyPartidas}><div className={styles.emptyIcon}>📅</div><p>Nenhuma partida cadastrada.</p><p className={styles.hint}>Clique em &quot;+ Nova Partida&quot; para adicionar.</p></div>
                : [...(activeTeam.partidas||[])].reverse().map(p => (
                  <div key={p.id} className={styles.partidaCard} onClick={() => selectPartida(p.id)}>
                    <div className={styles.partidaIcon}>⚽</div>
                    <div className={styles.partidaInfo}>
                      <div className={styles.partidaNome}>{p.nome}</div>
                      <div className={styles.partidaMeta}>
                        <span>{new Date(p.data).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}</span>
                        <span>{(p.notas||[]).length} anotaç{(p.notas||[]).length!==1?'ões':'ão'}</span>
                      </div>
                    </div>
                    <button className={styles.partidaDel} onClick={e=>{e.stopPropagation();deletePartida(p.id)}}>✕</button>
                    <div className={styles.arrow}>›</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {view === 'notas' && activeTeam && activePartida && (
          <div className={styles.notasView}>
            <div className={styles.notasHeader}>
              <button className={styles.backBtn} onClick={() => setView('partidas')}>← Voltar</button>
              <div className={styles.notasInfo}>
                <div className={styles.notasTeam}>{activeTeam.nome}</div>
                <div className={styles.notasMatch}>{activePartida.nome}</div>
              </div>
              <div className={styles.panelActions}>
                <button className="btn ghost" onClick={openEditPartida}>Editar</button>
                <button className="btn danger" onClick={() => { deletePartida(activePartida.id); setView('partidas') }}>Remover</button>
              </div>
            </div>
            <div className={styles.notasFilters}>
              {(['todos','time','jogador','geral'] as const).map(f => (
                <button key={f} className={`${styles.filterBtn} ${noteFilter===f?styles.filterActive:''}`} onClick={() => setNoteFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.notasArea}>
              {!visibleNotas.length
                ? <div style={{textAlign:'center',padding:'2rem',color:'var(--muted)',fontSize:'.84rem'}}>
                    {noteFilter==='todos' ? 'Nenhuma observação ainda. Adicione abaixo.' : `Nenhuma nota do tipo "${noteFilter}".`}
                  </div>
                : [...visibleNotas].reverse().map((n, i) => (
                  <div key={i} className={styles.notaCard}>
                    <button className={styles.notaDel} onClick={() => deleteNota((activePartida.notas||[]).indexOf(n))}>✕</button>
                    <div className={styles.notaHeader}>
                      <span className={`nota-tag ${n.tipo}`}>{TIPO_LABEL[n.tipo]||n.tipo}</span>
                      <span className={styles.notaData}>{new Date(n.data).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    {n.tipo==='jogador'&&n.jogador&&<div className={styles.notaSub}>👤 {n.jogador}</div>}
                    <div className={styles.notaTexto}>{n.texto}</div>
                  </div>
                ))
              }
            </div>
            <div className={styles.novaNota}>
              <div className={styles.novaNotaTop}>
                <select value={notaTipo} onChange={e => setNotaTipo(e.target.value as any)}>
                  <option value="time">Time</option>
                  <option value="jogador">Jogador</option>
                  <option value="geral">Geral</option>
                </select>
                {notaTipo === 'jogador' && (
                  <input type="text" value={notaJogador} onChange={e => setNotaJogador(e.target.value)} placeholder="Nome do jogador…" className={styles.extraField}/>
                )}
              </div>
              <textarea value={notaTexto} onChange={e => setNotaTexto(e.target.value)} placeholder="Escreva sua observação sobre esta partida…"/>
              <div className={styles.novaNotaActions}>
                <button className={styles.btnAddNota} onClick={addNota}>Adicionar</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal Time */}
      {teamModalOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target===e.currentTarget) setTeamModalOpen(false) }}>
          <div className="modal" style={{width:'min(400px,95vw)'}}>
            <div className="modal-header">
              <h3>{teamEditId ? 'Editar Time' : 'Novo Time'}</h3>
              <button className="close-btn" onClick={() => setTeamModalOpen(false)}>×</button>
            </div>
            <form onSubmit={saveTeam}>
              <div className="form-group"><label>Nome do Time *</label><input type="text" value={tNome} onChange={e=>setTNome(e.target.value)} placeholder="Ex: Colômbia" required/></div>
              <div className="form-group"><label>Liga / Campeonato</label><input type="text" value={tLiga} onChange={e=>setTLiga(e.target.value)} placeholder="Ex: Copa do Mundo 2026"/></div>
              <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={() => setTeamModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Partida */}
      {partidaModalOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target===e.currentTarget) setPartidaModalOpen(false) }}>
          <div className="modal" style={{width:'min(400px,95vw)'}}>
            <div className="modal-header">
              <h3>{partidaEditId ? 'Editar Partida' : 'Nova Partida'}</h3>
              <button className="close-btn" onClick={() => setPartidaModalOpen(false)}>×</button>
            </div>
            <form onSubmit={savePartida}>
              <div className="form-group"><label>Partida *</label><input type="text" value={pNome} onChange={e=>setPNome(e.target.value)} placeholder="Ex: Colômbia x Uzbequistão" required/></div>
              <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={() => setPartidaModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
