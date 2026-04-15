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
    const { statusPeriodo, pesoFeto, pesoPlacenta, dataMorte } = req.body
    const feto = await createFeto(Number(req.params.rataId), {
      statusPeriodo,
      pesoFeto,
      pesoPlacenta,
      ...(dataMorte && { dataMorte: new Date(dataMorte) }),
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
    const { dataMorte, ...rest } = req.body
    const feto = await updateFeto(Number(req.params.id), {
      ...rest,
      ...(dataMorte !== undefined && { dataMorte: dataMorte ? new Date(dataMorte) : null }),
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
