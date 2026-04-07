import type { Request, Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import type { GrupoExperimental, Linhagem } from '@prisma/client'
import {
  findAllRatas,
  findRataById,
  createRata,
  updateRata,
  deleteRata,
} from '../Service/RataService.js'
import { podeEscreverNoProjeto, projetoIdDaRata } from '../utils/permissao.js'

type FiltroRata = NonNullable<Parameters<typeof findAllRatas>[0]>

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { projetoId, grupo, inclusao, morte, linhagem, prenhez, recebeuSTZ } = req.query

  const filtros: FiltroRata = {}
  if (projetoId  !== undefined) filtros.projetoId  = Number(projetoId)
  if (grupo      !== undefined) filtros.grupo      = grupo as GrupoExperimental
  if (inclusao   !== undefined) filtros.inclusao   = inclusao === 'true'
  if (morte      !== undefined) filtros.morte      = morte === 'true'
  if (linhagem   !== undefined) filtros.linhagem   = linhagem as Linhagem
  if (prenhez    !== undefined) filtros.prenhez    = prenhez === 'true'
  if (recebeuSTZ !== undefined) filtros.recebeuSTZ = recebeuSTZ === 'true'

  const ratas = await findAllRatas(filtros)
  res.json(ratas)
}

export const getById = async (req: Request, res: Response): Promise<void> => {
  const rata = await findRataById(Number(req.params.id))
  if (!rata) { res.status(404).json({ message: 'Rata não encontrada' }); return }
  res.json(rata)
}

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projetoId } = req.body
    if (!projetoId) { res.status(400).json({ message: 'projetoId é obrigatório.' }); return }
    if (!await podeEscreverNoProjeto(req.userId!, req.roleSistema!, Number(projetoId))) {
      res.status(403).json({ message: 'Apenas ADMIN ou responsável pelo projeto pode cadastrar ratas.' })
      return
    }
    const rata = await createRata(req.body)
    res.status(201).json(rata)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar rata.'
    res.status(400).json({ message: msg })
  }
}

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rataId = Number(req.params.id)
    const projetoId = await projetoIdDaRata(rataId)
    if (!projetoId) { res.status(404).json({ message: 'Rata não encontrada.' }); return }
    if (!await podeEscreverNoProjeto(req.userId!, req.roleSistema!, projetoId)) {
      res.status(403).json({ message: 'Apenas ADMIN ou responsável pelo projeto pode editar ratas.' })
      return
    }
    const rata = await updateRata(rataId, req.body)
    res.json(rata)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar rata.'
    res.status(400).json({ message: msg })
  }
}

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rataId = Number(req.params.id)
    const projetoId = await projetoIdDaRata(rataId)
    if (!projetoId) { res.status(404).json({ message: 'Rata não encontrada.' }); return }
    if (!await podeEscreverNoProjeto(req.userId!, req.roleSistema!, projetoId)) {
      res.status(403).json({ message: 'Apenas ADMIN ou responsável pelo projeto pode remover ratas.' })
      return
    }
    await deleteRata(rataId)
    res.status(204).send()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao remover rata.'
    res.status(400).json({ message: msg })
  }
}
