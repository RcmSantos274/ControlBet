import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/validate'

const router = Router()
router.use(authMiddleware)

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nome, timeId } = req.body
  const time = await prisma.time.findFirst({ where: { id: timeId, userId: req.userId! } })
  if (!time) { res.status(404).json({ error: 'Time não encontrado.' }); return }
  const partida = await prisma.partida.create({
    data: { nome, timeId, data: new Date().toISOString() },
    include: { notas: true },
  })
  res.status(201).json(partida)
}))

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = await prisma.partida.findFirst({ where: { id: String(req.params.id), time: { userId: req.userId! } } })
  if (!p) { res.status(404).json({ error: 'Partida não encontrada.' }); return }
  const updated = await prisma.partida.update({ where: { id: String(req.params.id) }, data: { nome: req.body.nome } })
  res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = await prisma.partida.findFirst({ where: { id: String(req.params.id), time: { userId: req.userId! } } })
  if (!p) { res.status(404).json({ error: 'Partida não encontrada.' }); return }
  await prisma.partida.delete({ where: { id: String(req.params.id) } })
  res.json({ ok: true })
}))

export default router
