import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { getTOTG, upsertTOTG } from '../Service/TOTGService.js'

// GET /ratas/:rataId/totg
export const getTOTGHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totg = await getTOTG(Number(req.params.rataId))
    res.json(totg)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao buscar TOTG.'
    res.status(404).json({ message: msg })
  }
}

// PUT /ratas/:rataId/totg
export const upsertTOTGHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dataRealizacao, t0, t30, t60, t120, diagnostico } = req.body

    if (!dataRealizacao || t0 === undefined || t30 === undefined || t60 === undefined || t120 === undefined) {
      res.status(400).json({ message: 'dataRealizacao, t0, t30, t60 e t120 são obrigatórios.' })
      return
    }

    const resultado = await upsertTOTG(Number(req.params.rataId), {
      dataRealizacao: new Date(dataRealizacao),
      t0: Number(t0),
      t30: Number(t30),
      t60: Number(t60),
      t120: Number(t120),
      diagnostico,
    })

    res.json(resultado)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar TOTG.'
    res.status(400).json({ message: msg })
  }
}
