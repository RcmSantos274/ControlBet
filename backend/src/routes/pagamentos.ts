import { Router, Request, Response } from 'express'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/validate'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
const paymentApi = new Payment(client)

const PLANOS = {
  mensal:     { valor: 19.90,  dias: 30,  label: 'ControlBet — Plano Mensal' },
  trimestral: { valor: 49.90,  dias: 90,  label: 'ControlBet — Plano Trimestral' },
  anual:      { valor: 164.90, dias: 365, label: 'ControlBet — Plano Anual' },
} as const

type Plano = keyof typeof PLANOS

async function ativarPlano(mpPaymentId: string, dbPaymentId: string, userId: string, plano: Plano) {
  const dias = PLANOS[plano].dias
  const planExpiresAt = new Date(Date.now() + dias * 24 * 60 * 60 * 1000)
  await prisma.$transaction([
    prisma.payment.update({ where: { id: dbPaymentId }, data: { status: 'approved' } }),
    prisma.user.update({ where: { id: userId }, data: { planStatus: 'ativo', planExpiresAt } }),
  ])
}

const router = Router()

// ── Criar pagamento PIX ──────────────────────────────────────────────────────
router.post('/criar', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const plano = req.body.plano as Plano
  if (!PLANOS[plano]) { res.status(400).json({ error: 'Plano inválido.' }); return }

  const user = await prisma.user.findUnique({ where: { id: req.userId! } })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado.' }); return }

  const config = PLANOS[plano]

  const backendUrl = process.env.BACKEND_URL ?? ''
  const notifUrl = backendUrl.startsWith('http://localhost') ? undefined : `${backendUrl}/api/pagamentos/webhook`

  const payment = await paymentApi.create({
    body: {
      transaction_amount: config.valor,
      description: config.label,
      payment_method_id: 'pix',
      payer: { email: user.email, first_name: user.name || 'Cliente' },
      ...(notifUrl ? { notification_url: notifUrl } : {}),
      metadata: { userId: user.id, plano },
    },
  })

  const db = await prisma.payment.create({
    data: { userId: user.id, mpPaymentId: String(payment.id), plano, status: 'pending' },
  })

  const pix = payment.point_of_interaction?.transaction_data
  res.json({ paymentId: String(payment.id), dbId: db.id, qr_code: pix?.qr_code, qr_code_base64: pix?.qr_code_base64 })
}))

// ── Status (polling do frontend — consulta também a API do MP) ───────────────
router.get('/status/:paymentId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const paymentId = String(req.params.paymentId)

  const db = await prisma.payment.findFirst({ where: { mpPaymentId: paymentId, userId: req.userId! } })
  if (!db) { res.status(404).json({ error: 'Pagamento não encontrado.' }); return }

  if (db.status === 'approved') { res.json({ status: 'approved' }); return }

  // Consulta status real no MP (funciona mesmo sem webhook em dev)
  try {
    const mp = await paymentApi.get({ id: paymentId })
    if (mp.status === 'approved') {
      await ativarPlano(paymentId, db.id, db.userId, db.plano as Plano)
      res.json({ status: 'approved' }); return
    }
  } catch {}

  res.json({ status: db.status })
}))

// ── Webhook Mercado Pago ─────────────────────────────────────────────────────
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  res.sendStatus(200) // responde antes de processar (MP exige resposta < 5s)

  const { type, data } = req.body
  if (type !== 'payment' || !data?.id) return

  const mpPaymentId = String(data.id)

  try {
    const mp = await paymentApi.get({ id: mpPaymentId })
    if (mp.status !== 'approved') return

    const db = await prisma.payment.findUnique({ where: { mpPaymentId } })
    if (!db || db.status === 'approved') return

    await ativarPlano(mpPaymentId, db.id, db.userId, db.plano as Plano)
  } catch (err) {
    console.error('[WEBHOOK]', err)
  }
}))

export default router
