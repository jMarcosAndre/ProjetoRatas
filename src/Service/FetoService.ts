import { prisma } from '../lib/prisma.js'
import { PeriodoMorte  } from '@prisma/client'



export const createFeto = async (rataId: number, dados: {
  statusPeriodo?: PeriodoMorte
  pesoFeto?: number
  pesoPlacenta?: number
  dataMorte?: Date
}) => {
  const rata = await prisma.rata.findUnique({
    where: { id: rataId },
    include: { fetos: true, gestacao: true },
  })
  if (!rata) throw new Error('Rata não encontrada.')
  if (!rata.prenhez) throw new Error('Apenas ratas prenhes podem ter fetos registrados.')
  if (!rata.gestacao?.dataPrenhez) throw new Error('A rata precisa ter data de prenhez registrada na gestação antes de adicionar fetos.')
  if (!rata.morte) throw new Error('A rata precisa estar morta para registrar análise fetal.')

  const sequencia = rata.fetos.length + 1
  const identificacao = `${rata.numero}.${sequencia}`
  const status = dados.statusPeriodo ?? 'VIVO'

  if (status !== 'VIVO' && !dados.dataMorte)
    throw new Error('dataMorte é obrigatória quando o feto não está vivo.')

  return prisma.feto.create({
    data: {
      rataId,
      identificacao,
      statusPeriodo:  status,
      pesoFeto:       dados.pesoFeto      ?? null,
      pesoPlacenta:   dados.pesoPlacenta  ?? null,
      dataPrenhez:    rata.gestacao.dataPrenhez,
      dataMorte:      dados.dataMorte     ?? null,
    },
  })
}

export const listFetos = (rataId: number) =>
  prisma.feto.findMany({ where: { rataId }, orderBy: { id: 'asc' } })

export const updateFeto = async (id: number, dados: {
  statusPeriodo?: PeriodoMorte
  pesoFeto?: number | null
  pesoPlacenta?: number | null
  dataMorte?: Date | null
}) => {
  if (dados.statusPeriodo && dados.statusPeriodo !== 'VIVO' && dados.dataMorte === null)
    throw new Error('dataMorte é obrigatória quando o feto não está vivo.')

  return prisma.feto.update({ where: { id }, data: dados })
}

export const deleteFeto = (id: number) =>
  prisma.feto.delete({ where: { id } })
