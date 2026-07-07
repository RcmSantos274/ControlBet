import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validate, asyncHandler, registerSchema, loginSchema } from '../lib/validate'

const router = Router()
const COOKIE  = 'cb_token'
const EXPIRES = 60 * 60 * 24 * 7

function cookieOpts(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRES * 1000,
    path: '/',
  })
}

router.post('/register', validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) { res.status(409).json({ error: 'Este e-mail já está cadastrado.' }); return }

  const hash = await bcrypt.hash(password, 12)
  const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const user = await prisma.user.create({
    data: { email, password: hash, name, trialEndsAt },
  })

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: EXPIRES })
  cookieOpts(res, token)
  res.status(201).json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
}))

router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { res.status(401).json({ error: 'E-mail ou senha incorretos.' }); return }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) { res.status(401).json({ error: 'E-mail ou senha incorretos.' }); return }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: EXPIRES })
  cookieOpts(res, token)
  res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
}))

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE, { path: '/' })
  res.json({ ok: true })
})

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, planStatus: true, trialEndsAt: true, planExpiresAt: true },
  })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado.' }); return }

  const now = new Date()
  const trialExpired = user.planStatus === 'trial' && !!user.trialEndsAt && user.trialEndsAt < now
  const atoExpired   = user.planStatus === 'ativo'  && !!user.planExpiresAt && user.planExpiresAt < now
  const planExpired  = trialExpired || atoExpired
  res.json({ ...user, planExpired })
}))

export default router
