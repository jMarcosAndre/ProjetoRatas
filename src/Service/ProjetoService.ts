import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export class ProjetoService {
    /**
     * Lista os projetos de acordo com o nível de acesso.
     * ADMIN vê tudo. USER vê apenas onde é Responsável ou Colaborador.
     */
    async listarProjetos(userId: number, roleSistema: 'ADMIN' | 'USER') {
        if (roleSistema === 'ADMIN') {
            return await prisma.projeto.findMany({
                include: { responsavel: true, participantes: true }
            });
        }

        return await prisma.projeto.findMany({
            where: {
                participantes: {
                    some: { userId: userId }
                }
            },
            include: { 
                responsavel: true, 
                participantes: {
                    where: { userId: userId } 
                } 
            }
        });
    }

    /**
     * Valida permissão de escrita (Criar/Editar/Deletar).
     * ADMIN e RESPONSAVEL do projeto podem 
     */
    async validarPermissaoEscrita(projetoId: number, userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (user?.roleSistema === 'ADMIN') return true;

        const projetoRole = await prisma.projetoRole.findUnique({
            where: {
                userId_projetoId: { userId, projetoId }
            }
        });

        if (!projetoRole || projetoRole.role !== 'RESPONSAVEL') {
            throw new Error("Acesso negado: Apenas o Responsável pelo projeto tem permissão para esta ação.");
        }

        return true;
    }

    /**
     * Método para o Frontend decidir se mostra ou esconde botões de edição.
     */
    async obterPermissoesInterface(projetoId: number, userId: number) {
        try {
            await this.validarPermissaoEscrita(projetoId, userId);
            return { podeEditar: true };
        } catch {
            return { podeEditar: false };
        }
    }

    async editarProjeto(projetoId: number, executorId: number, dados: any) {
        await this.validarPermissaoEscrita(projetoId, executorId);

        return await prisma.projeto.update({
            where: { id: projetoId },
            data: dados
        });
    }
}

