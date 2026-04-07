import { PrismaClient, RoleProjeto, ProjetoStatus } from '@prisma/client'
const prisma = new PrismaClient()

type FiltrosProjeto = {
    roleFiltro?: RoleProjeto  // filtra projetos onde o usuário tem esse papel
    nomeAluno?: string        // filtra projetos que têm um participante com esse nome
}

export class ProjetoService {
    /**
     * Somente ADMIN pode criar projetos.
     * O responsável é automaticamente adicionado como RESPONSAVEL na ProjetoRole.
     */
    async criarProjeto(executorId: number, dados: {
        nome: string
        descricao?: string
        responsavelProjetoId: number
        status?: ProjetoStatus
    }) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem criar projetos.")
        }

        const responsavel = await prisma.user.findUnique({ where: { id: dados.responsavelProjetoId } })
        if (!responsavel) {
            throw new Error("Responsável não encontrado.")
        }

        return await prisma.projeto.create({
            data: {
                nome: dados.nome,
                descricao: dados.descricao ?? null,
                status: dados.status ?? 'EM_CURSO',
                responsavelProjetoId: dados.responsavelProjetoId,
                participantes: {
                    create: {
                        userId: dados.responsavelProjetoId,
                        role: 'RESPONSAVEL'
                    }
                }
            },
            include: { responsavel: true, participantes: true }
        })
    }

    /**
     * Adiciona um colaborador a um projeto. Somente ADMIN pode fazer isso.
     */
    async adicionarColaborador(executorId: number, projetoId: number, userId: number) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem adicionar colaboradores.")
        }

        return await prisma.projetoRole.create({
            data: { userId, projetoId, role: 'COLABORADOR' }
        })
    }

    /**
     * Lista projetos com filtros opcionais.
     * - ADMIN vê todos os projetos.
     * - USER vê apenas projetos onde participa (como RESPONSAVEL ou COLABORADOR).
     * Filtros disponíveis para ambos:
     *   - roleFiltro: retorna apenas projetos onde o usuário tem esse papel (USER) ou onde existe alguém com esse papel (ADMIN)
     *   - nomeAluno: retorna projetos que têm um participante com esse nome
     */
    async listarProjetos(userId: number, roleSistema: 'ADMIN' | 'USER', filtros: FiltrosProjeto = {}) {
        const { roleFiltro, nomeAluno } = filtros

        if (roleSistema === 'ADMIN') {
            return await prisma.projeto.findMany({
                where: {
                    ...(nomeAluno && {
                        participantes: {
                            some: {
                                user: { nome: { contains: nomeAluno } }
                            }
                        }
                    })
                },
                include: { responsavel: true, participantes: { include: { user: true } } }
            })
        }

        // Para USER: só projetos onde participa, com filtros adicionais
        return await prisma.projeto.findMany({
            where: {
                participantes: {
                    some: {
                        userId,
                        ...(roleFiltro && { role: roleFiltro }),
                        ...(nomeAluno && {
                            user: { nome: { contains: nomeAluno } }
                        })
                    }
                }
            },
            include: {
                responsavel: true,
                participantes: {
                    include: { user: true }
                }
            }
        })
    }

    /**
     * Valida permissão de escrita (Criar/Editar/Deletar dados do projeto).
     * ADMIN tem acesso total a todos os projetos.
     * Entre os usuários comuns, somente o RESPONSAVEL do projeto pode escrever.
     */
    async validarPermissaoEscrita(projetoId: number, userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (user?.roleSistema === 'ADMIN') return true

        const projetoRole = await prisma.projetoRole.findUnique({
            where: { userId_projetoId: { userId, projetoId } }
        })

        if (!projetoRole || projetoRole.role !== 'RESPONSAVEL') {
            throw new Error("Acesso negado: Apenas o Responsável pelo projeto pode adicionar, editar ou deletar dados.")
        }

        return true
    }

    /**
     * Valida permissão de leitura (visualizar dados do projeto).
     * RESPONSAVEL e COLABORADOR podem visualizar.
     */
    async validarPermissaoLeitura(projetoId: number, userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.roleSistema === 'ADMIN') return true

        const projetoRole = await prisma.projetoRole.findUnique({
            where: { userId_projetoId: { userId, projetoId } }
        })

        if (!projetoRole) {
            throw new Error("Acesso negado: Você não participa deste projeto.")
        }

        return true
    }

    /**
     * Retorna as permissões do usuário em um projeto (para o frontend controlar a UI).
     */
    async obterPermissoesInterface(projetoId: number, userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.roleSistema === 'ADMIN') {
            return { podeEditar: false, podeVisualizar: true, isAdmin: true }
        }

        const projetoRole = await prisma.projetoRole.findUnique({
            where: { userId_projetoId: { userId, projetoId } }
        })

        if (!projetoRole) {
            return { podeEditar: false, podeVisualizar: false, isAdmin: false }
        }

        return {
            podeEditar: projetoRole.role === 'RESPONSAVEL',
            podeVisualizar: true,
            isAdmin: false
        }
    }

    async editarProjeto(projetoId: number, executorId: number, dados: {
        nome?: string
        descricao?: string
        status?: ProjetoStatus
    }) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem editar projetos.")
        }

        return await prisma.projeto.update({
            where: { id: projetoId },
            data: dados
        })
    }

    async deletarProjeto(projetoId: number, executorId: number) {
        const executor = await prisma.user.findUnique({ where: { id: executorId } })
        if (!executor || executor.roleSistema !== 'ADMIN') {
            throw new Error("Acesso negado: Apenas administradores podem deletar projetos.")
        }

        return await prisma.projeto.delete({ where: { id: projetoId } })
    }
}
