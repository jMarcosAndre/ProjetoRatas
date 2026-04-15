import { prisma } from '../lib/prisma.js'
import { Prisma  } from '@prisma/client'



type FiltroData = {
  data?: Date        // filtra registros de um dia específico (início e fim do dia)
  dataInicio?: Date
  dataFim?: Date
}

export const registrarDados = async (rataId: number, dados: {
  peso: number
  consumoAgua: number
  consumoRacao: number
  dataMedicao: Date
}) => {
  const rata = await prisma.rata.findUnique({ where: { id: rataId } })
  if (!rata) throw new Error('Rata não encontrada.')

  return prisma.dadosGerais.create({
    data: { rataId, ...dados },
  })
}

export const listarDados = (rataId: number, filtros: FiltroData = {}) => {
  const where: Prisma.DadosGeraisWhereInput = { rataId }

  if (filtros.data) {
    const inicio = new Date(filtros.data)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(filtros.data)
    fim.setHours(23, 59, 59, 999)
    where.dataMedicao = { gte: inicio, lte: fim }
  } else if (filtros.dataInicio || filtros.dataFim) {
    where.dataMedicao = {
      ...(filtros.dataInicio && { gte: filtros.dataInicio }),
      ...(filtros.dataFim && { lte: filtros.dataFim }),
    }
  }

  return prisma.dadosGerais.findMany({
    where,
    orderBy: { dataMedicao: 'asc' },
  })
}

export const deletarDados = (id: number) =>
  prisma.dadosGerais.delete({ where: { id } })
