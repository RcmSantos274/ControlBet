'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './PixModal.module.css'

type Props = {
  open: boolean
  plano: string
  paymentId: string
  qrCode: string
  qrCodeBase64: string
  onClose: () => void
  onApproved: () => void
}

const PLANO_LABELS: Record<string, string> = {
  mensal: 'MENSAL R$19,90',
  trimestral: 'TRIMESTRAL R$49,90',
  anual: 'ANUAL R$164,90',
}

export default function PixModal({ open, plano, paymentId, qrCode, qrCodeBase64, onClose, onApproved }: Props) {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'pending' | 'approved'>('pending')

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/pagamentos/status/${paymentId}`)
      const data = await res.json()
      if (data.status === 'approved') {
        setStatus('approved')
        setTimeout(onApproved, 2200)
      }
    } catch {}
  }, [paymentId, onApproved])

  useEffect(() => {
    if (!open || status === 'approved') return
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [open, status, poll])

  // Reset ao abrir novo pagamento
  useEffect(() => { if (open) setStatus('pending') }, [open])

  function copy() {
    navigator.clipboard.writeText(qrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget && status !== 'approved') onClose() }}>
      <div className={styles.modal}>
        {status === 'approved' ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3>Pagamento confirmado!</h3>
            <p>Seu plano foi ativado. Redirecionando...</p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3>Pagar via PIX</h3>
              <span className={styles.planLabel}>{PLANO_LABELS[plano] ?? plano.toUpperCase()}</span>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>
            </div>

            <p className={styles.instruction}>
              Abra o app do seu banco, escolha <strong>Pix</strong> e escaneie o QR Code abaixo.
              O acesso é liberado automaticamente após o pagamento.
            </p>

            <div className={styles.qrWrap}>
              {qrCodeBase64
                ? <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" className={styles.qrImg} />
                : <div className={styles.qrPlaceholder}>Gerando QR Code…</div>
              }
            </div>

            <p className={styles.orText}>— ou use o código copia e cola —</p>

            <div className={styles.copyRow}>
              <input readOnly value={qrCode} className={styles.pixCode} title={qrCode} />
              <button className={styles.copyBtn} onClick={copy}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            <div className={styles.polling}>
              <span className={styles.pollingDot} />
              Aguardando confirmação do pagamento…
            </div>

            <button className={styles.cancelLink} onClick={onClose}>Cancelar</button>
          </>
        )}
      </div>
    </div>
  )
}
