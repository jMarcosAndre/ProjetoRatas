import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error("JWT_SECRET não configurado no ambiente.")
    return secret
}

export class UserService {
    async create(nome: string, email: string, senha: string, executorId: number) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem cadastrar novos usuários.")
        }

        const exists = await prisma.user.findUnique({ where: { email } })
        if (exists) throw new Error("Email já cadastrado.")

        const hash = await bcrypt.hash(senha, SALT_ROUNDS)

        return prisma.user.create({
            data: { nome, email, password: hash, roleSistema: 'USER' },
            select: { id: true, nome: true, email: true, roleSistema: true }
        })
    }

    async login(email: string, senha: string) {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error("Credenciais inválidas.")

        const senhaValida = await bcrypt.compare(senha, user.password)
        if (!senhaValida) throw new Error("Credenciais inválidas.")

        const token = jwt.sign(
            { id: user.id, roleSistema: user.roleSistema },
            getJwtSecret(),
            { expiresIn: '24h' }
        )

        return {
            token,
            user: { id: user.id, nome: user.nome, email: user.email, roleSistema: user.roleSistema }
        }
    }

    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, nome: true, email: true, roleSistema: true }
        })
    }

    async listAll(executorId: number) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem listar usuários.")
        }

        return prisma.user.findMany({
            select: { id: true, nome: true, email: true, roleSistema: true }
        })
    }
}
