import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
    async create(nome: string, email: string, senha: string, role: 'USER', executorId: number) {
        // Verificacao de Adm
        const executor = await prisma.user.findUnique({
            where: { id: executorId }
        });

        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem cadastrar novos usuários.");
        }

        // Verificacao se email ja existe
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) throw new Error("Email já cadastrado.");

        // Criacao
        return prisma.user.create({
            data: { 
                nome, 
                email, 
                password: senha, 
                roleSistema: 'USER'
            }
        });
    }

    async listAll() {
        return prisma.user.findMany({
            select: { id: true, nome: true, email: true, roleSistema: true }
        });
    }
}