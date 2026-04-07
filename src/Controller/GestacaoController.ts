import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { upsertGestacao, getGestacao } from '../Service/GestacaoService.js'

// GET /ratas/:rataId/gestacao
export const getGestacaoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gestacao = await getGestacao(Number(req.params.rataId))
    res.json(gestacao)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao buscar gestação.'
    res.status(404).json({ message: msg })
  }
}

// PUT /ratas/:rataId/gestacao
export const upsertGestacaoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dataPrenhez, ...rest } = req.body
    if (!dataPrenhez) {
      res.status(400).json({ message: 'dataPrenhez é obrigatória.' })
      return
    }
    const gestacao = await upsertGestacao(Number(req.params.rataId), {
      dataPrenhez: new Date(dataPrenhez),
      ...rest,
    })
    res.json(gestacao)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar gestação.'
    res.status(400).json({ message: msg })
  }
}
