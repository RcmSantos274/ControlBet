'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Nav from './Nav'

// Strict public: never needs auth, never shows sidebar
const PUBLIC = ['/login', '/cadastro']
// Semi-public: visible to all, but shows sidebar when authenticated
const SEMI_PUBLIC = ['/']

function isPublicPath(p: string) {
  return PUBLIC.some(pub => p === pub || p.startsWith(pub + '/'))
}

function isSemiPublic(p: string) {
  return SEMI_PUBLIC.some(pub => p === pub || p.startsWith(pub + '/'))
}

type PlanInfo = {
  name: string
  email: string
  planStatus: string
  trialEndsAt: string | null
  planExpired: boolean
}

function TrialBanner({ trialEndsAt }: { trialEndsAt: string }) {
  const remaining = Math.max(0, new Date(trialEndsAt).getTime() - Date.now())
  const hours = Math.floor(remaining / 3600000)
  const mins = Math.floor((remaining % 3600000) / 60000)
  const label = hours > 0 ? `${hours}h ${mins}min` : `${mins} minutos`

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245,158,11,.15), rgba(245,158,11,.08))',
      borderBottom: '1px solid rgba(245,158,11,.30)',
      padding: '.55rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '1rem', flexWrap: 'wrap',
      fontSize: '13px', color: '#fbbf24', fontWeight: 500,
    }}>
      <span>
        <strong>Trial gratuito</strong> — expira em {label}. Garanta acesso completo.
      </span>
      <Link href="/assinatura" style={{
        background: '#f59e0b', color: '#0b1220', fontWeight: 700,
        padding: '.25rem .75rem', borderRadius: 6, fontSize: '12px',
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        Ver planos
      </Link>
    </div>
  )
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [checked, setChecked] = useState(false)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)

  // Always reflects the current path — safe to read inside async callbacks
  const pathRef = useRef(path)
  pathRef.current = path

  useEffect(() => {
    if (isPublicPath(path)) { setChecked(true); return }

    const controller = new AbortController()

    fetch('/api/auth/me', { signal: controller.signal })
      .then(r => {
        if (!r.ok) {
          // Semi-public (landing): show anonymously, no redirect
          if (isSemiPublic(pathRef.current)) { setChecked(true); return null }
          if (!isPublicPath(pathRef.current)) router.replace('/login')
          return null
        }
        return r.json()
      })
      .then((u: PlanInfo | null) => {
        if (!u) return
        if (isPublicPath(pathRef.current)) return
        setPlanInfo(u)
        if (u.planExpired && pathRef.current !== '/assinatura' && !isSemiPublic(pathRef.current)) {
          router.replace('/assinatura')
          return
        }
        setChecked(true)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        if (!isPublicPath(pathRef.current) && !isSemiPublic(pathRef.current)) router.replace('/login')
        else setChecked(true)
      })

    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  const isPublic = isPublicPath(path)
  const isLanding = isSemiPublic(path)

  // Strict public (login/cadastro): always show without sidebar
  if (isPublic) return <>{children}</>
  // Landing unauthenticated: show without sidebar (planInfo is null)
  if (isLanding && !planInfo) return <>{children}</>
  // Private routes: block until checked
  if (!checked && !isLanding) return null

  const showTrialBanner =
    planInfo?.planStatus === 'trial' &&
    !planInfo.planExpired &&
    !!planInfo.trialEndsAt

  return (
    <div className="app-layout">
      <Nav />
      <div className="app-content">
        {showTrialBanner && <TrialBanner trialEndsAt={planInfo!.trialEndsAt!} />}
        {children}
      </div>
    </div>
  )
}
