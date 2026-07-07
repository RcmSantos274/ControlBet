import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validate, asyncHandler, apostaSchema, apostaUpdateSchema } from '../lib/validate'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const sport = typeof req.query.sport === 'string' ? req.query.sport : 'futebol'
  const apostas = await prisma.aposta.findMany({
    where: { userId: req.userId!, sport },
    orderBy: { createdAt: 'desc' },
  })
  res.json(apostas)
}))

router.post('/', validate(apostaSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const aposta = await prisma.aposta.create({
    data: { ...req.body, userId: req.userId! },
  })
  res.status(201).json(aposta)
}))

router.put('/:id', validate(apostaUpdateSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const aposta = await prisma.aposta.findFirst({ where: { id, userId: req.userId! } })
  if (!aposta) { res.status(404).json({ error: 'Aposta não encontrada.' }); return }

  const updated = await prisma.aposta.update({ where: { id }, data: req.body })
  res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const aposta = await prisma.aposta.findFirst({ where: { id, userId: req.userId! } })
  if (!aposta) { res.status(404).json({ error: 'Aposta não encontrada.' }); return }

  await prisma.aposta.delete({ where: { id } })
  res.json({ ok: true })
}))

// Bulk replace — valida cada item do array antes de persistir
const bulkSchema = z.array(apostaSchema).max(5000, 'Limite de 5000 apostas por envio.')

router.post('/bulk', asyncHandler(async (req: AuthRequest, res: Response) => {
  const sport = typeof req.query.sport === 'string' ? req.query.sport : 'futebol'

  const result = bulkSchema.safeParse(req.body)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Dados inválidos.'
    res.status(400).json({ error: msg })
    return
  }

  const apostas = result.data
  await prisma.aposta.deleteMany({ where: { userId: req.userId!, sport } })

  if (apostas.length) {
    await prisma.aposta.createMany({
      data: apostas.map(b => ({ ...b, userId: req.userId! })),
    })
  }

  res.json({ ok: true })
}))

export default router
