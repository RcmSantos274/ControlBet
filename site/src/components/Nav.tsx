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
    color: '#00f0a8',
    items: [
      { label: 'Apostas', href: '/apostas' },
      { label: 'Gráficos', href: '/analise' },
    ],
  },
  {
    id: 'basquete',
    label: 'Basquete',
    color: '#ffb300',
    items: [
      { label: 'Apostas', href: '/basquete' },
      { label: 'Gráficos', href: '/basquete/analise' },
    ],
  },
  {
    id: 'surebet',
    label: 'Surebet',
    color: '#258cff',
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
    if (s.items.some(i => i.href === path || path.startsWith(i.href + '/'))) return s.id
  }
  return null
}

function isActive(href: string, path: string) {
  return path === href || (href !== '/apostas' && path.startsWith(href + '/'))
}

function IconApostas() {
  return (
    <svg width="14" height="14" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x=".8" y=".8" width="3.2" height="3.2" rx=".7"/>
      <line x1="5.5" y1="2" x2="12" y2="2"/>
      <line x1="5.5" y1="3.8" x2="10" y2="3.8" opacity=".5"/>
      <rect x=".8" y="5.5" width="3.2" height="3.2" rx=".7"/>
      <line x1="5.5" y1="6.7" x2="12" y2="6.7"/>
      <line x1="5.5" y1="8.5" x2="10" y2="8.5" opacity=".5"/>
    </svg>
  )
}

function IconGraficos() {
  return (
    <svg width="14" height="14" viewBox="0 0 13 13" fill="currentColor">
      <rect x=".5" y="7" width="2.5" height="5.5" rx=".7"/>
      <rect x="4.5" y="4" width="2.5" height="8.5" rx=".7"/>
      <rect x="8.5" y="1" width="2.5" height="11.5" rx=".7"/>
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L8.5 1Z"/>
      <path d="M8.5 1V5.5H13"/>
      <path d="M4.5 8.5h5M4.5 6.5h3"/>
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.5 3.1 3.5.5-2.5 2.4.6 3.5L7 9.5l-3.1 1.6.6-3.5L2 5.1l3.5-.5L7 1.5Z"/>
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12.5 9A6 6 0 0 1 5 1.5a6 6 0 1 0 7.5 7.5Z"/>
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7" cy="7" r="2.5"/>
      <line x1="7" y1="1" x2="7" y2="2.5"/>
      <line x1="7" y1="11.5" x2="7" y2="13"/>
      <line x1="1" y1="7" x2="2.5" y2="7"/>
      <line x1="11.5" y1="7" x2="13" y2="7"/>
      <line x1="2.9" y1="2.9" x2="4" y2="4"/>
      <line x1="10" y1="10" x2="11.1" y2="11.1"/>
      <line x1="11.1" y1="2.9" x2="10" y2="4"/>
      <line x1="4" y1="10" x2="2.9" y2="11.1"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M5 2H2.5a.8.8 0 0 0-.8.8v7.4a.8.8 0 0 0 .8.8H5"/>
      <path d="M8.5 9l3-2.5L8.5 4"/><line x1="11.5" y1="6.5" x2="5" y2="6.5"/>
    </svg>
  )
}

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [open, setOpen] = useState<string | null>(() => sectionForPath(path))
  const [dark, setDark] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(u => {
      if (u) setUserName(u.name || u.email)
    })
  }, [])

  useEffect(() => {
    const s = sectionForPath(path)
    if (s) setOpen(s)
  }, [path])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function toggle(id: string) {
    setOpen(prev => prev === id ? null : id)
  }

  const initial = userName ? userName[0].toUpperCase() : '?'

  return (
    <aside className={styles.sidebar}>

      {/* LOGO */}
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,84 A 34,34 0 1,1 74,26" stroke="#00f0a8" strokeWidth="11" strokeLinecap="round"/>
            <rect x="29" y="62" width="9" height="13" rx="2.5" fill="white"/>
            <rect x="43" y="55" width="9" height="20" rx="2.5" fill="white"/>
            <rect x="57" y="48" width="9" height="27" rx="2.5" fill="white"/>
            <polyline points="33.5,61 47.5,54 61.5,47 72,30" stroke="#00f0a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="33.5" cy="61" r="3.2" fill="#00f0a8"/>
            <circle cx="47.5" cy="54" r="3.2" fill="#00f0a8"/>
            <circle cx="61.5" cy="47" r="3.2" fill="#00f0a8"/>
          </svg>
        </div>
        <span className={styles.logoText}>Control<strong>Bet</strong></span>
      </Link>

      {/* MENU */}
      <nav className={styles.nav}>
        {SECTIONS.map((section, idx) => (
          <div key={section.id}>
            {idx > 0 && <div className={styles.divider} />}
            <button
              className={styles.sectionBtn}
              onClick={() => toggle(section.id)}
            >
              <span className={styles.sectionLabel}>
                <span className={styles.sectionDot} style={{ background: section.color, color: section.color }} />
                <span className={styles.sectionTitle} style={{ color: open === section.id ? section.color : '#8492a7' }}>
                  {section.label}
                </span>
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

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{initial}</div>
          {userName && <span className={styles.username}>{userName}</span>}
        </div>
        <div className={styles.footerActions}>
          <button className={styles.footerBtn} onClick={() => setDark(d => !d)}>
            {dark ? <IconMoon /> : <IconSun />}
            <span>{dark ? 'Dark' : 'Light'}</span>
          </button>
          <button className={`${styles.footerBtn} ${styles.logout}`} onClick={handleLogout}>
            <IconLogout />
            <span>Sair</span>
          </button>
        </div>
      </div>

    </aside>
  )
}
