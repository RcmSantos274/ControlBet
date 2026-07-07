import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validate, asyncHandler, surebetSchema, surebetUpdateSchema } from '../lib/validate'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const surebets = await prisma.surebet.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  })
  res.json(surebets)
}))

router.post('/', validate(surebetSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const sb = await prisma.surebet.create({
    data: { ...req.body, userId: req.userId! },
  })
  res.status(201).json(sb)
}))

router.put('/:id', validate(surebetUpdateSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const sb = await prisma.surebet.findFirst({ where: { id, userId: req.userId! } })
  if (!sb) { res.status(404).json({ error: 'Surebet não encontrada.' }); return }

  const updated = await prisma.surebet.update({ where: { id }, data: req.body })
  res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const sb = await prisma.surebet.findFirst({ where: { id, userId: req.userId! } })
  if (!sb) { res.status(404).json({ error: 'Surebet não encontrada.' }); return }

  await prisma.surebet.delete({ where: { id } })
  res.json({ ok: true })
}))

export default router
