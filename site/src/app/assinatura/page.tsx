'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './assinatura.module.css'
import PixModal from '@/components/assinatura/PixModal'

type PlanInfo = {
  planStatus: string
  trialEndsAt: string | null
  planExpiresAt: string | null
  planExpired: boolean
}

type PixData = {
  paymentId: string
  plano: string
  qr_code: string
  qr_code_base64: string
}

function computeTrialLabel(trialEndsAt: string): string {
  const remaining = Math.max(0, new Date(trialEndsAt).getTime() - Date.now())
  if (remaining === 0) return 'EXPIRADO'
  const hours = Math.floor(remaining / 3600000)
  const mins  = Math.floor((remaining % 3600000) / 60000)
  return hours > 0 ? `${hours}H ${mins}MIN RESTANTES` : `${mins} MIN RESTANTES`
}

export default function AssinaturaPage() {
  const router = useRouter()
  const [planInfo, setPlanInfo]   = useState<PlanInfo | null>(null)
  const [loading, setLoading]     = useState<string | null>(null) // plano sendo processado
  const [pixData, setPixData]     = useState<PixData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError]         = useState('')

  const fetchPlan = useCallback(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) setPlanInfo(u) })
  }, [])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  const isActive = planInfo?.planStatus === 'ativo'
  const expired  = !!planInfo?.planExpired
  const isTrial  = planInfo?.planStatus === 'trial'

  const statusDot  = expired ? styles.dotRed : styles.dotGreen
  const statusText = expired ? 'EXPIRADO' : isActive ? 'ATIVO' : 'TRIAL'
  const rightText  = expired
    ? 'ASSINE AGORA'
    : isActive ? 'PLANO ATIVO'
    : planInfo?.trialEndsAt ? computeTrialLabel(planInfo.trialEndsAt) : 'TRIAL GRATUITO'

  const expiryDate = isActive && planInfo?.planExpiresAt
    ? new Date(planInfo.planExpiresAt).toLocaleDateString('pt-BR')
    : planInfo?.trialEndsAt
    ? new Date(planInfo.trialEndsAt).toLocaleDateString('pt-BR')
    : '—'

  async function assinar(plano: 'mensal' | 'trimestral' | 'anual') {
    setError('')
    setLoading(plano)
    try {
      const res = await fetch('/api/pagamentos/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao gerar pagamento.'); return }
      setPixData({ paymentId: data.paymentId, plano, qr_code: data.qr_code, qr_code_base64: data.qr_code_base64 })
      setModalOpen(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  function handleApproved() {
    setModalOpen(false)
    fetchPlan()
    router.refresh()
  }

  return (
    <main className={styles.main}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.statusBadge}>
          <span className={`${styles.dot} ${statusDot}`} />
          {statusText} • {rightText}
        </div>

        <h1 className={styles.heroTitle}>
          Escolha o plano ideal<br />
          <span>para potencializar seus resultados</span>
        </h1>

        <p className={styles.heroSub}>
          Acesse ferramentas exclusivas, análises avançadas e recursos que vão te ajudar
          a tomar <em>decisões mais inteligentes</em> e <em>lucrativas.</em>
        </p>

        <div className={styles.heroBenefits}>
          <span><i>✓</i> Cancele quando quiser</span>
          <span><i>🛡</i> Pagamento 100% seguro</span>
          <span><i>⚡</i> Acesso imediato</span>
          <span><i>🔄</i> Atualizações constantes</span>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <div className={styles.plansTitle}>
        <h2>Planos e preços 👑</h2>
        <p>Escolha o plano que melhor se adapta ao seu momento.</p>
      </div>

      {error && <p style={{ textAlign: 'center', color: '#ff3b68', marginBottom: '1rem', fontSize: '14px' }}>{error}</p>}

      <div className={styles.plansGrid}>

        {/* MENSAL */}
        <div className={`${styles.planCard} ${styles.featured}`}>
          <div className={styles.featuredBadge}>MAIS ESCOLHIDO</div>
          <div className={styles.planIcon}>📅</div>
          <h3>Mensal</h3>
          <span className={styles.planDesc}>Ideal para começar</span>
          <div className={styles.price}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>19,90</span>
            <small>/mês</small>
          </div>
          <ul className={styles.featureList}>
            <li>Acesso completo ao painel</li>
            <li>Todas as funcionalidades</li>
            <li>Estatísticas ilimitadas</li>
            <li>Cancelamento a qualquer momento</li>
          </ul>
          <button
            className={styles.btnPrimary}
            onClick={() => assinar('mensal')}
            disabled={!!loading || isActive}
          >
            {loading === 'mensal' ? 'Gerando PIX…' : isActive ? 'Plano ativo' : 'Assinar plano mensal'}
          </button>
        </div>

        {/* TRIMESTRAL */}
        <div className={styles.planCard}>
          <div className={styles.discountBadge}>17% OFF</div>
          <div className={styles.planIcon}>📅</div>
          <h3>Trimestral</h3>
          <span className={styles.planDesc}>Mais economia para você</span>
          <div className={styles.price}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>49,90</span>
            <small>/3 meses</small>
          </div>
          <div className={styles.oldPrice}>R$ 59,70</div>
          <div className={styles.saving}>Economize 17%</div>
          <ul className={styles.featureList}>
            <li>Acesso completo ao painel</li>
            <li>Todas as funcionalidades</li>
            <li>Estatísticas ilimitadas</li>
            <li className={styles.highlight}>Economia de 17%</li>
          </ul>
          <button
            className={styles.btnSecondary}
            onClick={() => assinar('trimestral')}
            disabled={!!loading || isActive}
          >
            {loading === 'trimestral' ? 'Gerando PIX…' : isActive ? 'Plano ativo' : 'Assinar plano trimestral'}
          </button>
        </div>

        {/* ANUAL */}
        <div className={styles.planCard}>
          <div className={styles.discountBadge}>31% OFF</div>
          <div className={styles.planIcon}>📅</div>
          <h3>Anual</h3>
          <span className={styles.planDesc}>Máxima economia</span>
          <div className={styles.price}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>164,90</span>
            <small>/ano</small>
          </div>
          <div className={styles.oldPrice}>R$ 238,80</div>
          <div className={styles.saving}>Economize 31%</div>
          <ul className={styles.featureList}>
            <li>Acesso completo ao painel</li>
            <li>Todas as funcionalidades</li>
            <li>Estatísticas ilimitadas</li>
            <li className={styles.highlight}>Economia de 31%</li>
          </ul>
          <button
            className={styles.btnSecondary}
            onClick={() => assinar('anual')}
            disabled={!!loading || isActive}
          >
            {loading === 'anual' ? 'Gerando PIX…' : isActive ? 'Plano ativo' : 'Assinar plano anual'}
          </button>
        </div>

      </div>

      {/* ── SEGURANÇA ── */}
      <div className={styles.securityCard}>
        <div className={styles.securityLeft}>
          <div className={styles.securityIcon}>🛡</div>
          <div>
            <h4>Compra 100% segura</h4>
            <p>Seus dados e pagamentos são protegidos com criptografia de ponta a ponta.</p>
          </div>
        </div>
        <div className={styles.payments}>
          <span className={styles.payVisa}>VISA</span>
          <span className={styles.payMaster}>●● mastercard</span>
          <span className={styles.payPix}>◆ pix</span>
          <span className={styles.paySSL}>🔒 SSL 256-bit</span>
        </div>
      </div>

      {/* ── DETALHES DA ASSINATURA ── */}
      <div className={styles.subInfo}>
        <h3>Detalhes da assinatura</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <small>STATUS</small>
            <strong className={expired ? styles.statusRed : styles.statusGreen}>
              {expired ? 'Expirado' : isActive ? 'Ativo' : 'Trial'}
            </strong>
          </div>
          <div className={styles.infoBox}>
            <small>PLANO ATUAL</small>
            <strong>{isActive ? 'Pago' : 'Trial Gratuito'}</strong>
          </div>
          <div className={styles.infoBox}>
            <small>{isActive ? 'EXPIRA EM' : 'TRIAL EXPIRA EM'}</small>
            <strong>{expiryDate}</strong>
          </div>
        </div>
        <p className={styles.noFidelidade}>
          🛡 Sem fidelidade &bull; Cancele quando quiser &bull; Sem taxas escondidas
        </p>
      </div>

      {/* ── MODAL PIX ── */}
      {pixData && (
        <PixModal
          open={modalOpen}
          plano={pixData.plano}
          paymentId={pixData.paymentId}
          qrCode={pixData.qr_code}
          qrCodeBase64={pixData.qr_code_base64}
          onClose={() => setModalOpen(false)}
          onApproved={handleApproved}
        />
      )}

    </main>
  )
}
