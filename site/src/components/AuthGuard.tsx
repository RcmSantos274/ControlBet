'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Nav from './Nav'

const PUBLIC = ['/login', '/cadastro']

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

  useEffect(() => {
    if (PUBLIC.includes(path)) { setChecked(true); return }
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) { router.replace('/login'); return null }
        return r.json()
      })
      .then((u: PlanInfo | null) => {
        if (!u) return
        setPlanInfo(u)
        if (u.planExpired && path !== '/assinatura') {
          router.replace('/assinatura')
          return
        }
        setChecked(true)
      })
      .catch(() => router.replace('/login'))
  }, [path, router])

  const isPublic = PUBLIC.includes(path)

  if (!checked && !isPublic) return null
  if (isPublic) return <>{children}</>

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
