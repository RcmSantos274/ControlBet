import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/validate'

const router = Router()
router.use(authMiddleware)

const include = { partidas: { orderBy: { createdAt: 'asc' as const }, include: { notas: { orderBy: { createdAt: 'asc' as const } } } } }

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const times = await prisma.time.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: 'asc' }, include })
  res.json(times)
}))

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nome, liga } = req.body
  const time = await prisma.time.create({ data: { nome, liga: liga ?? '', userId: req.userId! }, include })
  res.status(201).json(time)
}))

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const t = await prisma.time.findFirst({ where: { id: String(req.params.id), userId: req.userId! } })
  if (!t) { res.status(404).json({ error: 'Time não encontrado.' }); return }
  const { nome, liga } = req.body
  const updated = await prisma.time.update({ where: { id: String(req.params.id) }, data: { nome, liga } })
  res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const t = await prisma.time.findFirst({ where: { id: String(req.params.id), userId: req.userId! } })
  if (!t) { res.status(404).json({ error: 'Time não encontrado.' }); return }
  await prisma.time.delete({ where: { id: String(req.params.id) } })
  res.json({ ok: true })
}))

// Sync completo (mantém interface do frontend)
router.post('/sync', asyncHandler(async (req: AuthRequest, res: Response) => {
  const times: any[] = req.body
  const userTimes = await prisma.time.findMany({ where: { userId: req.userId! }, select: { id: true } })
  const ids = userTimes.map(t => t.id)
  if (ids.length) {
    await prisma.nota.deleteMany({ where: { partida: { timeId: { in: ids } } } })
    await prisma.partida.deleteMany({ where: { timeId: { in: ids } } })
    await prisma.time.deleteMany({ where: { userId: req.userId! } })
  }
  for (const t of times) {
    await prisma.time.create({
      data: {
        id: t.id, nome: t.nome, liga: t.liga ?? '', userId: req.userId!,
        partidas: {
          create: (t.partidas || []).map((p: any) => ({
            id: p.id, nome: p.nome, data: p.data ?? new Date().toISOString(),
            notas: {
              create: (p.notas || []).map((n: any) => ({
                id: n.id, tipo: n.tipo, jogador: n.jogador ?? '',
                texto: n.texto, data: n.data ?? new Date().toISOString(),
              })),
            },
          })),
        },
      },
    })
  }
  res.json({ ok: true })
}))

export default router
