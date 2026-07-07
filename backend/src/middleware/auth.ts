import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.cb_token

  if (!token) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    req.userId = payload.userId
    req.userEmail = payload.email
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
