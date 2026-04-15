import { prisma } from '../lib/prisma.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { ProjetoService } from '../Service/ProjetoService.js'
import type { RoleProjeto } from '@prisma/client'


const service  = new ProjetoService()


// POST /projects — só ADMIN
export const createProjeto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nome, descricao, responsavelProjetoId, status } = req.body
        if (!nome || !responsavelProjetoId) {
            res.status(400).json({ message: "nome e responsavelProjetoId são obrigatórios." })
            return
        }
        const projeto = await service.criarProjeto(req.userId!, { nome, descricao, responsavelProjetoId, status })
        res.status(201).json(projeto)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao criar projeto."
        res.status(400).json({ message: msg })
    }
}

// GET /projects — ADMIN e USER
// Query params: roleFiltro=RESPONSAVEL|COLABORADOR  &  nomeAluno=string
export const listProjetos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roleFiltro, nomeAluno } = req.query

        const filtros: { roleFiltro?: RoleProjeto; nomeAluno?: string } = {}
        if (roleFiltro) filtros.roleFiltro = roleFiltro as RoleProjeto
        if (nomeAluno)  filtros.nomeAluno  = nomeAluno as string

        const projetos = await service.listarProjetos(req.userId!, req.roleSistema!, filtros)
        res.json(projetos)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao listar projetos."
        res.status(400).json({ message: msg })
    }
}

// PUT /projects/:id — só ADMIN
export const editProjeto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projeto = await service.editarProjeto(Number(req.params.id), req.userId!, req.body)
        res.json(projeto)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao editar projeto."
        res.status(400).json({ message: msg })
    }
}

// DELETE /projects/:id — só ADMIN
export const deleteProjeto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await service.deletarProjeto(Number(req.params.id), req.userId!)
        res.status(204).send()
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao deletar projeto."
        res.status(400).json({ message: msg })
    }
}

// POST /projects/:id/colaboradores — só ADMIN
export const addColaborador = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.body
        if (!userId) {
            res.status(400).json({ message: "userId é obrigatório." })
            return
        }
        const role = await service.adicionarColaborador(req.userId!, Number(req.params.id), userId)
        res.status(201).json(role)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao adicionar colaborador."
        res.status(400).json({ message: msg })
    }
}

// GET /projects/:id/dashboard — visão geral das ratas do projeto
// Query params opcionais: linhagem, grupo, prenhez, inclusao
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projetoId = Number(req.params.id)
    const { linhagem, grupo, prenhez, inclusao } = req.query

    const where: Record<string, unknown> = { projetoId }
    if (linhagem  !== undefined) where.linhagem  = linhagem
    if (grupo     !== undefined) where.grupo      = grupo
    if (prenhez   !== undefined) where.prenhez    = prenhez   === 'true'
    if (inclusao  !== undefined) where.inclusao   = inclusao  === 'true'

    const ratas = await prisma.rata.findMany({
      where,
      include: {
        totg:          true,
        historicoDados: { orderBy: { dataMedicao: 'desc' }, take: 1 },
      },
      orderBy: { numero: 'asc' },
    })

    const linhas = ratas.map(r => ({
      id:                  r.id,
      numero:              r.numero,
      identificacao:       r.identificacao,
      linhagem:            r.linhagem,
      linhagemOutro:       r.linhagemOutro,
      grupo:               r.grupo,
      prenhez:             r.prenhez,
      inclusao:            r.inclusao,
      recebeuSTZ:          r.recebeuSTZ,
      diagnosticoTOTG:     r.totg?.diagnostico      ?? null,
      dataRealizacaoTOTG:  r.totg?.dataRealizacao   ?? null,
      ultimaAvaliacao:     r.historicoDados[0]       ?? null,
    }))

    res.json({ projetoId, total: linhas.length, ratas: linhas })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao carregar dashboard.'
    res.status(400).json({ message: msg })
  }
}

// GET /projects/:id/permissoes — ADMIN e USER
export const getPermissoes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const permissoes = await service.obterPermissoesInterface(Number(req.params.id), req.userId!)
        res.json(permissoes)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao obter permissões."
        res.status(400).json({ message: msg })
    }
}
