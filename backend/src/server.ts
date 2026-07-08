import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth'
import apostasRoutes from './routes/apostas'
import timesRoutes from './routes/times'
import partidasRoutes from './routes/partidas'
import notasRoutes from './routes/notas'
import surebetsRoutes from './routes/surebets'
import pagamentosRoutes from './routes/pagamentos'

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Segurança ──
app.use(helmet())
app.use(express.json({ limit: '200kb' }))
app.use(cookieParser())

// Rate limit global: 200 req / 15 min por IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }))

// Rate limit mais restrito para auth: 20 req / 15 min
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' } })
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Rotas ──
app.use('/api/auth', authRoutes)
app.use('/api/apostas', apostasRoutes)
app.use('/api/times', timesRoutes)
app.use('/api/partidas', partidasRoutes)
app.use('/api/notas', notasRoutes)
app.use('/api/surebets', surebetsRoutes)
app.use('/api/pagamentos', pagamentosRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// Frontend estático (Next.js export) — só existe em produção
const sitePath = path.join(__dirname, '../../site/out')
if (fs.existsSync(sitePath)) {
  app.use(express.static(sitePath, { extensions: ['html'] }))
  app.get('*', (_req, res) => res.sendFile(path.join(sitePath, 'index.html')))
}

// Erro 404 (somente para rotas /api não encontradas)
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }))

// Error handler global — captura erros de asyncHandler e outros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Payload too large
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload muito grande.' })
    return
  }
  // JSON malformado
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido.' })
    return
  }
  console.error('[ERROR]', err.message ?? err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => console.log(`✅ Backend rodando em http://localhost:${PORT}`))
