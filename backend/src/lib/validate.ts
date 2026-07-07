import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

// ── Middleware helper ──────────────────────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Dados inválidos.'
      res.status(400).json({ error: msg })
      return
    }
    req.body = result.data
    next()
  }
}

// ── Async handler ─────────────────────────────────────────────────
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

// ── Auth schemas ──────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório.')
    .email('E-mail inválido.')
    .max(254, 'E-mail muito longo.')
    .transform(s => s.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .max(128, 'Senha muito longa.'),
  name: z.string().max(100, 'Nome muito longo.').trim().optional().default(''),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório.')
    .email('E-mail inválido.')
    .transform(s => s.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Senha é obrigatória.')
    .max(128),
})

// ── Aposta schemas ────────────────────────────────────────────────
const SITUACOES  = ['pre', 'ao-vivo'] as const
const RESULTADOS = ['pendente', 'ganhou', 'perdeu', 'cash'] as const
const SPORTS     = ['futebol', 'basquete'] as const

export const apostaSchema = z.object({
  partida:   z.string().min(1, 'Partida é obrigatória.').max(200).trim(),
  mercado:   z.string().min(1, 'Mercado é obrigatório.').max(100).trim(),
  situacao:  z.enum(SITUACOES),
  resultado: z.enum(RESULTADOS).default('pendente'),
  valor:     z.number().positive('Valor deve ser positivo.').max(1_000_000),
  odd:       z.number().min(1, 'Odd mínima é 1.').max(10_000),
  retorno:   z.number().default(0),
  lucro:     z.number().default(0),
  cashVal:   z.number().nullable().optional(),
  liga:      z.string().max(100).trim().default(''),
  sport:     z.enum(SPORTS).default('futebol'),
  obs:       z.string().max(1000).trim().default(''),
  data:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD).'),
})

export const apostaUpdateSchema = apostaSchema.partial()

// ── Surebet schemas ───────────────────────────────────────────────
const RESULTADOS_SB = ['pendente', 'green', 'meio-green', 'devolvido', 'red', 'meio-red'] as const

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD).')

export const surebetSchema = z.object({
  dataAposta: dateField,
  dataEvento: dateField,
  esporte:    z.string().min(1).max(100).trim(),
  evento:     z.string().min(1).max(200).trim(),

  casa1:      z.string().min(1).max(100).trim(),
  mercado1:   z.string().min(1).max(100).trim(),
  odd1:       z.number().min(1).max(10_000),
  stake1:     z.number().positive().max(1_000_000),
  resultado1: z.enum(RESULTADOS_SB).default('pendente'),

  casa2:      z.string().min(1).max(100).trim(),
  mercado2:   z.string().min(1).max(100).trim(),
  odd2:       z.number().min(1).max(10_000),
  stake2:     z.number().positive().max(1_000_000),
  resultado2: z.enum(RESULTADOS_SB).default('pendente'),

  lucro:      z.number().default(0),
  obs:        z.string().max(1000).trim().default(''),
})

export const surebetUpdateSchema = surebetSchema.partial()
