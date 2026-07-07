import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/validate'

const router = Router()
router.use(authMiddleware)

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tipo, jogador, texto, partidaId } = req.body
  const partida = await prisma.partida.findFirst({ where: { id: partidaId, time: { userId: req.userId! } } })
  if (!partida) { res.status(404).json({ error: 'Partida não encontrada.' }); return }
  const nota = await prisma.nota.create({
    data: { tipo, jogador: jogador ?? '', texto, partidaId, data: new Date().toISOString() },
  })
  res.status(201).json(nota)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const nota = await prisma.nota.findFirst({ where: { id: String(req.params.id), partida: { time: { userId: req.userId! } } } })
  if (!nota) { res.status(404).json({ error: 'Nota não encontrada.' }); return }
  await prisma.nota.delete({ where: { id: String(req.params.id) } })
  res.json({ ok: true })
}))

export default router
