'use client'
import type { Time } from '@/types'
import styles from './NotesDrawer.module.css'

interface Props {
  partida: string | null
  times: Time[]
  onClose: () => void
}

function getNotas(partida: string, times: Time[]) {
  const p = partida.toLowerCase().trim()
  const result: { time: Time; notas: Time['partidas'][0]['notas'] }[] = []
  times.forEach(t => {
    (t.partidas || []).forEach(mp => {
      if (mp.nome.toLowerCase().trim() === p && (mp.notas || []).length) {
        result.push({ time: t, notas: mp.notas })
      }
    })
  })
  return result
}

const TIPO_LABEL: Record<string, string> = { time: 'Time', jogador: 'Jogador', geral: 'Geral' }

export default function NotesDrawer({ partida, times, onClose }: Props) {
  const groups = partida ? getNotas(partida, times) : []

  return (
    <>
      <div className={`${styles.backdrop} ${partida ? styles.open : ''}`} onClick={onClose}/>
      <div className={`${styles.drawer} ${partida ? styles.open : ''}`}>
        <div className={styles.header}>
          <div>
            <div className={styles.label}>Observações da Partida</div>
            <div className={styles.match}>{partida || '—'}</div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className={styles.body}>
          {!groups.length ? (
            <div className={styles.empty}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📝</div>
              <div style={{ fontSize: '.88rem' }}>Nenhuma observação para esta partida.</div>
              <div style={{ fontSize: '.78rem', marginTop: '.6rem', lineHeight: 1.5 }}>
                Vá em <strong style={{ color: 'var(--text)' }}>Anotações</strong> e adicione uma nota com o mesmo nome.
              </div>
            </div>
          ) : groups.map((g, gi) => (
            <div className={styles.group} key={gi}>
              <div className={styles.groupName}>{g.time.nome}</div>
              {g.notas.map((n, ni) => (
                <div className={styles.nota} key={ni}>
                  <div className={styles.notaHeader}>
                    <span className={`nota-tag ${n.tipo}`}>{TIPO_LABEL[n.tipo] || n.tipo}</span>
                    <span className={styles.notaDate}>{new Date(n.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  {n.jogador && <div className={styles.notaSub}>👤 {n.jogador}</div>}
                  <div className={styles.notaText}>{n.texto}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <a href="/anotacoes">+ Adicionar nota em Anotações</a>
        </div>
      </div>
    </>
  )
}
