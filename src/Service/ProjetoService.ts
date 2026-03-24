import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export class ProjetoService {
    async criarProjeto(data: {
        nome: string;
        descricao?: string;
        responsavelId: number;
        status: 'EM ANDAMENTO' | 'CONCLUÍDO' | 'INTERROMPIDO';
        executorId: number; // ID do usuário logado
    }) {
        const executor = await prisma.user.findUnique({ where: { id: data.executorId } });
        
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Ação não permitida: Apenas administradores podem criar projetos.");
        }

        //Criacao do projeto pelos campos pre definidos
        return await prisma.projeto.create({
            data: {
                nome: data.nome,
                descricao: data.descricao ?? null,
                status: data.status,
                responsavelProjetoId: data.responsavelId
            }
        });
    }

    // Metodo para o Admin gerenciar os membros (Responsável, Colaborador, Leitor)
    async gerenciarMembros(projetoId: number, userId: number, role: 'RESPONSAVEL' | 'COLABORADOR' | 'LEITOR', executorId: number) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } });
        if (executor?.roleSistema !== 'ADMIN') throw new Error("Não autorizado.");

        return await prisma.projetoRole.upsert({
            where: { userId_projetoId: { userId, projetoId } },
            update: { role },
            create: { userId, projetoId, role }
        });
    }
}