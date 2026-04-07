import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: number
    roleSistema?: 'ADMIN' | 'USER'
}

export const autenticar = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Token não fornecido." })
        return
    }

    const token = authHeader.slice(7) // remove "Bearer "
    const secret = process.env.JWT_SECRET ?? ''
    if (!secret) {
        res.status(500).json({ message: "Configuração de servidor inválida." })
        return
    }

    try {
        const payload = jwt.verify(token, secret) as unknown as { id: number; roleSistema: 'ADMIN' | 'USER' }
        req.userId = payload.id
        req.roleSistema = payload.roleSistema
        next()
    } catch {
        res.status(401).json({ message: "Token inválido ou expirado." })
    }
}

export const apenasAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.roleSistema !== 'ADMIN') {
        res.status(403).json({ message: "Acesso negado: rota exclusiva para administradores." })
        return
    }
    next()
}
