'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './Nav.module.css'

interface NavItem { label: string; href: string }
interface Section { id: string; label: string; color: string; items: NavItem[] }

const SECTIONS: Section[] = [
  {
    id: 'futebol',
    label: 'Futebol',
    color: '#00c896',
    items: [
      { label: 'Apostas', href: '/' },
      { label: 'Gráficos', href: '/analise' },
    ],
  },
  {
    id: 'basquete',
    label: 'Basquete',
    color: '#f59e0b',
    items: [
      { label: 'Apostas', href: '/basquete' },
      { label: 'Gráficos', href: '/basquete/analise' },
    ],
  },
  {
    id: 'surebet',
    label: 'Surebet',
    color: '#4d9fff',
    items: [
      { label: 'Apostas', href: '/surebet' },
      { label: 'Gráficos', href: '/surebet/analise' },
    ],
  },
]

const STANDALONE = [
  { label: 'Anotações', href: '/anotacoes' },
  { label: 'Assinatura', href: '/assinatura' },
]

function sectionForPath(path: string): string | null {
  for (const s of SECTIONS) {
    if (s.items.some(i => i.href === path || (i.href !== '/' && path.startsWith(i.href)))) return s.id
  }
  return null
}

function isActive(href: string, path: string) {
  return href === '/' ? path === '/' : path === href || path.startsWith(href + '/')
}

function IconApostas() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x=".8" y=".8" width="3.2" height="3.2" rx=".7"/>
      <line x1="5.5" y1="2" x2="12" y2="2"/>
      <line x1="5.5" y1="3.8" x2="10" y2="3.8" opacity=".5"/>
      <rect x=".8" y="5.5" width="3.2" height="3.2" rx=".7"/>
      <line x1="5.5" y1="6.7" x2="12" y2="6.7"/>
      <line x1="5.5" y1="8.5" x2="10" y2="8.5" opacity=".5"/>
      <line x1=".8" y1="11.5" x2="12.2" y2="11.5" opacity=".3"/>
    </svg>
  )
}

function IconGraficos() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <rect x=".5" y="7" width="2.5" height="5.5" rx=".7"/>
      <rect x="4.5" y="4" width="2.5" height="8.5" rx=".7"/>
      <rect x="8.5" y="1" width="2.5" height="11.5" rx=".7"/>
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L8.5 1Z"/>
      <path d="M8.5 1V5.5H13"/>
      <path d="M4.5 8.5h5M4.5 6.5h3"/>
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.5 3.1 3.5.5-2.5 2.4.6 3.5L7 9.5l-3.1 1.6.6-3.5L2 5.1l3.5-.5L7 1.5Z"/>
    </svg>
  )
}

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [open, setOpen] = useState<string | null>(() => sectionForPath(path))

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(u => {
      if (u) setUserName(u.name || u.email)
    })
  }, [])

  useEffect(() => {
    const s = sectionForPath(path)
    if (s) setOpen(s)
  }, [path])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function toggle(id: string) {
    setOpen(prev => prev === id ? null : id)
  }

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="navG" gradientUnits="userSpaceOnUse" x1="16" y1="84" x2="76" y2="16">
              <stop offset="0%"   stopColor="#15803d"/>
              <stop offset="55%"  stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#4ade80"/>
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="#0a0e1a"/>
          <path d="M 50,84 A 34,34 0 1,1 74,26"
                stroke="url(#navG)" strokeWidth="11" strokeLinecap="round"/>
          <rect x="29" y="62" width="9" height="13" rx="2.5" fill="white"/>
          <rect x="43" y="55" width="9" height="20" rx="2.5" fill="white"/>
          <rect x="57" y="48" width="9" height="27" rx="2.5" fill="white"/>
          <polyline points="33.5,61 47.5,54 61.5,47 72,30"
                    stroke="#4ade80" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="33.5" cy="61" r="3.2" fill="#4ade80"/>
          <circle cx="47.5" cy="54" r="3.2" fill="#4ade80"/>
          <circle cx="61.5" cy="47" r="3.2" fill="#4ade80"/>
          <path d="M70,32 L73,29 L76,32" stroke="#4ade80" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={styles.logoText}>Control<strong>Bet</strong></span>
      </Link>

      <nav className={styles.nav}>
        {SECTIONS.map((section, idx) => (
          <div key={section.id}>
            {idx > 0 && <div className={styles.divider} />}
            <button
              className={styles.sectionBtn}
              style={{ color: open === section.id ? section.color : 'var(--muted)' }}
              onClick={() => toggle(section.id)}
            >
              <span className={styles.sectionLabel}>
                <span className={styles.sectionDot} style={{ background: section.color }} />
                {section.label}
              </span>
              <svg
                className={`${styles.chevron} ${open === section.id ? styles.chevronOpen : ''}`}
                width="11" height="11" viewBox="0 0 11 11" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M3.5 2l4 3.5-4 3.5"/>
              </svg>
            </button>

            <div className={`${styles.items} ${open === section.id ? styles.itemsOpen : ''}`}>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.item} ${isActive(item.href, path) ? styles.active : ''}`}
                >
                  {item.label === 'Apostas' ? <IconApostas /> : <IconGraficos />}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.divider} />

        {STANDALONE.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.standalone} ${path === item.href ? styles.active : ''}`}
          >
            {item.href === '/assinatura' ? <IconStar /> : <IconDoc />}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.user}>
        {userName && <span className={styles.username}>{userName}</span>}
        <button className={styles.logout} onClick={handleLogout} title="Sair">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M5 2H2.5a.8.8 0 0 0-.8.8v7.4a.8.8 0 0 0 .8.8H5"/>
            <path d="M8.5 9l3-2.5L8.5 4"/><line x1="11.5" y1="6.5" x2="5" y2="6.5"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
