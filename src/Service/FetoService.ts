import { PrismaClient, PeriodoMorte } from '@prisma/client'

const prisma = new PrismaClient()

export const createFeto = async (rataId: number, dados: {
  identificacao: string
  statusPeriodo?: PeriodoMorte
  pesoFeto?: number
  pesoPlacenta?: number
  dataPrenhez?: Date
  dataMorte?: Date
}) => {
  const rata = await prisma.rata.findUnique({ where: { id: rataId } })
  if (!rata) throw new Error('Rata não encontrada.')

  const status = dados.statusPeriodo ?? 'VIVO'

  if (status !== 'VIVO' && !dados.dataMorte)
    throw new Error('dataMorte é obrigatória quando o feto não está vivo.')

  return prisma.feto.create({
    data: {
      rataId,
      identificacao: dados.identificacao,
      statusPeriodo: status,
      pesoFeto: dados.pesoFeto,
      pesoPlacenta: dados.pesoPlacenta,
      dataPrenhez: dados.dataPrenhez,
      dataMorte: dados.dataMorte,
    },
  })
}

export const listFetos = (rataId: number) =>
  prisma.feto.findMany({ where: { rataId }, orderBy: { id: 'asc' } })

export const updateFeto = async (id: number, dados: {
  identificacao?: string
  statusPeriodo?: PeriodoMorte
  pesoFeto?: number
  pesoPlacenta?: number
  dataPrenhez?: Date | null
  dataMorte?: Date | null
}) => {
  if (dados.statusPeriodo && dados.statusPeriodo !== 'VIVO' && dados.dataMorte === null)
    throw new Error('dataMorte é obrigatória quando o feto não está vivo.')

  return prisma.feto.update({ where: { id }, data: dados })
}

export const deleteFeto = (id: number) =>
  prisma.feto.delete({ where: { id } })
