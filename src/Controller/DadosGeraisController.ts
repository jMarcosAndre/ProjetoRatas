import { prisma } from '../lib/prisma.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { registrarDados, listarDados, deletarDados } from '../Service/DadosGeraisService.js'
import { podeEscreverNoProjeto, projetoIdDaRata } from '../utils/permissao.js'




async function podeEscrever(userId: number, roleSistema: string, rataId: number): Promise<boolean> {
  const projetoId = await projetoIdDaRata(rataId)
  if (!projetoId) return false
  return podeEscreverNoProjeto(userId, roleSistema, projetoId)
}

// GET /ratas/:rataId/dados-gerais
// Query: ?data=YYYY-MM-DD  ou  ?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export const listarDadosHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, dataInicio, dataFim } = req.query
    const filtros: { data?: Date; dataInicio?: Date; dataFim?: Date } = {}
    if (data)       filtros.data       = new Date(data as string)
    if (dataInicio) filtros.dataInicio = new Date(dataInicio as string)
    if (dataFim)    filtros.dataFim    = new Date(dataFim as string)

    const dados = await listarDados(Number(req.params.rataId), filtros)
    res.json(dados)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar dados gerais.'
    res.status(400).json({ message: msg })
  }
}

// POST /ratas/:rataId/dados-gerais
export const registrarDadosHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rataId = Number(req.params.rataId)
    if (!await podeEscrever(req.userId!, req.roleSistema!, rataId)) {
      res.status(403).json({ message: 'Apenas ADMIN ou responsável pelo projeto pode registrar dados.' })
      return
    }
    const { peso, consumoAgua, consumoRacao, dataMedicao } = req.body
    if (peso === undefined || consumoAgua === undefined || consumoRacao === undefined || !dataMedicao) {
      res.status(400).json({ message: 'peso, consumoAgua, consumoRacao e dataMedicao são obrigatórios.' })
      return
    }
    const registro = await registrarDados(rataId, {
      peso,
      consumoAgua,
      consumoRacao,
      dataMedicao: new Date(dataMedicao),
    })
    res.status(201).json(registro)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao registrar dados gerais.'
    res.status(400).json({ message: msg })
  }
}

// DELETE /dados-gerais/:id
export const deletarDadosHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registro = await prisma.dadosGerais.findUnique({ where: { id: Number(req.params.id) } })
    if (!registro) { res.status(404).json({ message: 'Registro não encontrado.' }); return }
    if (!await podeEscrever(req.userId!, req.roleSistema!, registro.rataId)) {
      res.status(403).json({ message: 'Apenas ADMIN ou responsável pelo projeto pode deletar dados.' })
      return
    }
    await deletarDados(Number(req.params.id))
    res.status(204).send()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao deletar registro.'
    res.status(400).json({ message: msg })
  }
}
