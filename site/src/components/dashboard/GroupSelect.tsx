'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export interface SelectGroup {
  group: string
  color: string
  bg: string
  items: string[]
}

interface Props {
  value: string
  onChange: (v: string) => void
  groups: SelectGroup[]
  placeholder?: string
  required?: boolean
}

export default function GroupSelect({ value, onChange, groups, placeholder = 'Selecione…', required }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const dropH = 300
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow >= dropH ? r.bottom + 4 : r.top - dropH - 4
    setPos({ top, left: r.left, width: r.width })
  }, [])

  function toggle() { calcPos(); setOpen(o => !o) }

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // hidden native input for form required validation
  return (
    <>
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
        />
      )}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 8,
          color: value ? 'var(--text)' : 'var(--muted)',
          fontSize: '.9rem',
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-color .2s',
          outline: 'none',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <span>{value || placeholder}</span>
        <span style={{ opacity: .5, fontSize: '.75rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: 300,
            overflowY: 'auto',
            background: '#1a1f2e',
            border: '1.5px solid rgba(255,255,255,.1)',
            borderRadius: 10,
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,.55)',
          }}
        >
          {value && (
            <div
              onClick={() => { onChange(''); setOpen(false) }}
              style={{ padding: '8px 14px', color: 'var(--muted)', fontSize: '.82rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.06)' }}
            >
              Limpar seleção
            </div>
          )}
          {groups.map(g => (
            <div key={g.group}>
              <div style={{
                padding: '6px 12px 4px',
                fontSize: '.7rem',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: g.color,
                background: g.bg,
                borderBottom: `1px solid ${g.color}25`,
                position: 'sticky',
                top: 0,
              }}>
                {g.group}
              </div>
              {g.items.map(item => (
                <div
                  key={item}
                  onClick={() => { onChange(item); setOpen(false) }}
                  style={{
                    padding: '8px 18px',
                    fontSize: '.88rem',
                    cursor: 'pointer',
                    color: value === item ? g.color : 'var(--text)',
                    background: value === item ? `${g.color}18` : 'transparent',
                    borderLeft: value === item ? `3px solid ${g.color}` : '3px solid transparent',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${g.color}12`)}
                  onMouseLeave={e => (e.currentTarget.style.background = value === item ? `${g.color}18` : 'transparent')}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
