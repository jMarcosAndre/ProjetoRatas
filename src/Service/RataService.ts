import { prisma } from '../lib/prisma.js'
import { GrupoExperimental, Linhagem, Prisma  } from '@prisma/client'



type FiltroRata = {
  projetoId?: number
  grupo?: GrupoExperimental
  inclusao?: boolean
  morte?: boolean
  linhagem?: Linhagem
  prenhez?: boolean
  recebeuSTZ?: boolean
}

export const findAllRatas = (filtros: FiltroRata = {}) => {
  const where: Prisma.RataWhereInput = {}

  if (filtros.projetoId !== undefined) where.projetoId = filtros.projetoId
  if (filtros.grupo !== undefined)     where.grupo     = filtros.grupo
  if (filtros.inclusao !== undefined)  where.inclusao  = filtros.inclusao
  if (filtros.morte !== undefined)     where.morte     = filtros.morte
  if (filtros.linhagem !== undefined)  where.linhagem  = filtros.linhagem
  if (filtros.prenhez !== undefined)   where.prenhez   = filtros.prenhez
  if (filtros.recebeuSTZ !== undefined) where.recebeuSTZ = filtros.recebeuSTZ

  return prisma.rata.findMany({
    where,
    include: {
      gestacao:       true,
      fetos:          { orderBy: { id: 'asc' } },
      historicoDados: { orderBy: { dataMedicao: 'asc' } },
      totg:           true,
    },
    orderBy: { numero: 'asc' },
  })
}

export const findRataById = (id: number) =>
  prisma.rata.findUnique({
    where: { id },
    include: {
      gestacao:       true,
      fetos:          { orderBy: { id: 'asc' } },
      historicoDados: { orderBy: { dataMedicao: 'asc' } },
      totg:           true,
    },
  })

export const createRata = async (data: {
  identificacao: number
  numero: number
  linhagem: Linhagem
  linhagemOutro?: string
  dataNascimento: Date
  dataFinalExperimento: Date
  recebeuSTZ: boolean
  projetoId: number
  prenhez?: boolean
  morte?: boolean
}) => {
  if (data.linhagem === 'OUTRO' && !data.linhagemOutro?.trim())
    throw new Error('linhagemOutro é obrigatório quando linhagem é OUTRO.')
  if (data.linhagem !== 'OUTRO' && data.linhagemOutro)
    throw new Error('linhagemOutro só pode ser preenchido quando linhagem é OUTRO.')

  return prisma.rata.create({
    data: {
      identificacao: data.identificacao,
      numero: data.numero,
      linhagem: data.linhagem,
      linhagemOutro: data.linhagem === 'OUTRO' ? (data.linhagemOutro ?? null) : null,
      dataNascimento: data.dataNascimento,
      dataFinalExperimento: data.dataFinalExperimento,
      recebeuSTZ: data.recebeuSTZ,
      inclusao: false,
      projetoId: data.projetoId,
      prenhez: data.prenhez ?? false,
      morte: data.morte ?? null,
      grupo: null,
    },
  })
}

export const updateRata = async (
  id: number,
  data: {
    identificacao?: number
    numero?: number
    linhagem?: Linhagem
    linhagemOutro?: string | null
    dataNascimento?: Date
    dataFinalExperimento?: Date
    recebeuSTZ?: boolean
    inclusao?: boolean
    morte?: boolean
    grupo?: GrupoExperimental | null
    projetoId?: number
  }
) => {
  if (data.linhagem === 'OUTRO' && !data.linhagemOutro?.trim())
    throw new Error('linhagemOutro é obrigatório quando linhagem é OUTRO.')
  if (data.linhagem !== undefined && data.linhagem !== 'OUTRO' && data.linhagemOutro)
    throw new Error('linhagemOutro só pode ser preenchido quando linhagem é OUTRO.')

  const update: Prisma.RataUpdateInput = {}

  if (data.identificacao !== undefined)        update.identificacao        = data.identificacao
  if (data.numero !== undefined)               update.numero               = data.numero
  if (data.linhagem !== undefined) {
    update.linhagem     = data.linhagem
    update.linhagemOutro = data.linhagem === 'OUTRO' ? (data.linhagemOutro ?? null) : null
  }
  if (data.dataNascimento !== undefined)       update.dataNascimento       = data.dataNascimento
  if (data.dataFinalExperimento !== undefined) update.dataFinalExperimento = data.dataFinalExperimento
  if (data.recebeuSTZ !== undefined)           update.recebeuSTZ           = data.recebeuSTZ
  if (data.inclusao !== undefined)             update.inclusao             = data.inclusao
  if (data.morte !== undefined)                update.morte                = data.morte
  if (data.grupo !== undefined)                update.grupo                = data.grupo
  if (data.projetoId !== undefined)            update.projeto              = { connect: { id: data.projetoId } }

  return prisma.rata.update({ where: { id }, data: update })
}

export const deleteRata = (id: number) =>
  prisma.rata.delete({ where: { id } })
