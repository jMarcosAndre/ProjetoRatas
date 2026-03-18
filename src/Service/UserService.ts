import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

export class UserService {
    async create(nome: string, email: string, senha: string, role: 'USER' | 'ADMIN') { // Adicionado 'ADMIN'
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) throw new Error("Email já cadastrado.");

        return prisma.user.create({
            data: { 
                nome, 
                email, 
                password: senha, 
                roleSistema: role 
            }
        });
    }

    async listAll() {
        return prisma.user.findMany({
            select: { 
                id: true, 
                nome: true, 
                email: true, 
                roleSistema: true 
            }
        });
    }
}