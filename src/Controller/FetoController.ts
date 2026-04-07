import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { createFeto, listFetos, updateFeto, deleteFeto } from '../Service/FetoService.js'

// GET /ratas/:rataId/fetos
export const listFetosHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fetos = await listFetos(Number(req.params.rataId))
    res.json(fetos)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar fetos.'
    res.status(400).json({ message: msg })
  }
}

// POST /ratas/:rataId/fetos
export const createFetoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identificacao, statusPeriodo, pesoFeto, pesoPlacenta, dataPrenhez, dataMorte } = req.body
    if (!identificacao) {
      res.status(400).json({ message: 'identificacao é obrigatória.' })
      return
    }
    const feto = await createFeto(Number(req.params.rataId), {
      identificacao,
      statusPeriodo,
      pesoFeto,
      pesoPlacenta,
      dataPrenhez: dataPrenhez ? new Date(dataPrenhez) : undefined,
      dataMorte:   dataMorte   ? new Date(dataMorte)   : undefined,
    })
    res.status(201).json(feto)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar feto.'
    res.status(400).json({ message: msg })
  }
}

// PUT /fetos/:id
export const updateFetoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dataPrenhez, dataMorte, ...rest } = req.body
    const feto = await updateFeto(Number(req.params.id), {
      ...rest,
      ...(dataPrenhez !== undefined && { dataPrenhez: dataPrenhez ? new Date(dataPrenhez) : null }),
      ...(dataMorte   !== undefined && { dataMorte:   dataMorte   ? new Date(dataMorte)   : null }),
    })
    res.json(feto)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar feto.'
    res.status(400).json({ message: msg })
  }
}

// DELETE /fetos/:id
export const deleteFetoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteFeto(Number(req.params.id))
    res.status(204).send()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao deletar feto.'
    res.status(400).json({ message: msg })
  }
}
