'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/auth.module.css'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
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
        <p className={styles.tagline}>● SISTEMA FINANCEIRO INTELIGENTE</p>

        <h2 className={styles.title}>Criar sua conta</h2>
        <p className={styles.subtitle}>Registre-se para começar a acompanhar suas apostas com inteligência.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nome</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} autoFocus/>
            </div>
          </div>
          <div className={styles.field}>
            <label>E-mail</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 5l7 5 7-5" strokeLinecap="round"/>
              </svg>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round"/>
              </svg>
              <input type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required/>
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/>
                </svg>
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <label>Confirmar senha</label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round"/>
              </svg>
              <input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)} required/>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta →'}
          </button>
        </form>

        <p className={styles.foot}>
          Já tem uma conta? <Link href="/login">Fazer login</Link>
        </p>
      </div>
    </div>
  )
}
