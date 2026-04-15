import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { UserService } from '../Service/UserService.js'

const service = new UserService()

// POST /auth/login — público
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, senha } = req.body
        if (!email || !senha) {
            res.status(400).json({ message: "Email e senha são obrigatórios." })
            return
        }
        const resultado = await service.login(email, senha)
        res.json(resultado)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao fazer login."
        res.status(401).json({ message: msg })
    }
}

// POST /users — só ADMIN
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nome, email, senha } = req.body
        if (!nome || !email || !senha) {
            res.status(400).json({ message: "nome, email e senha são obrigatórios." })
            return
        }
        const user = await service.create(nome, email, senha, req.userId!)
        res.status(201).json(user)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao criar usuário."
        res.status(400).json({ message: msg })
    }
}

// GET /users/me — usuário autenticado
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await service.findById(req.userId!)
        if (!user) { res.status(404).json({ message: 'Usuário não encontrado.' }); return }
        res.json(user)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao buscar usuário.'
        res.status(400).json({ message: msg })
    }
}

// GET /users — só ADMIN
export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await service.listAll(req.userId!)
        res.json(users)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao listar usuários."
        res.status(403).json({ message: msg })
    }
}
