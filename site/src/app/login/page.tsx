'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="52" height="52" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="10" fill="#111827"/>
            <path d="M17 4C9.82 4 4 9.82 4 17s5.82 13 13 13" stroke="#00c896" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M17 4c7.18 0 13 5.82 13 13" stroke="#00c896" strokeWidth="2.2" strokeLinecap="round" opacity=".3"/>
            <rect x="9"  y="19" width="3" height="8"  rx="1.2" fill="#00c896"/>
            <rect x="14" y="14" width="3" height="13" rx="1.2" fill="#00c896"/>
            <rect x="19" y="10" width="3" height="17" rx="1.2" fill="#00c896"/>
            <path d="M22 10l3-3m0 0h-3m3 0v3" stroke="#00c896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.brand}>Control<span>Bet</span></h1>
        <p className={styles.tagline}>● SISTEMA DE APOSTAS INTELIGENTE</p>

        <h2 className={styles.title}>Seja Bem-vindo!</h2>
        <p className={styles.subtitle}>Faça login para acessar seu painel e continuar crescendo.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>E-mail</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="1" y="3" width="14" height="10" rx="2"/>
                <path d="M1 5l7 5 7-5" strokeLinecap="round"/>
              </svg>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
            </div>
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="7" width="10" height="8" rx="1.5"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round"/>
              </svg>
              <input type={showPass ? 'text' : 'password'} placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required/>
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/><line x1="2" y1="2" x2="14" y2="14"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar na conta →'}
          </button>
        </form>

        <p className={styles.foot}>
          Não tem uma conta? <Link href="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
