import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type DadosGestacao = {
  dataPrenhez: Date
  ganhoPesoMaterno?: number
  nCorposLuteos?: number
  nImplantacoes?: number
  nFetosVivos?: number
  nFetosMortos?: number
  nMortesEmbrionarias?: number
  perdasPreImplantacao?: number
  perdasPosImplantacao?: number
  pesoTotalNinhada?: number
}

function calcularPerdas(dados: DadosGestacao) {
  const { nCorposLuteos: cl, nImplantacoes: impl, nFetosVivos: vivos } = dados

  const perdasPreImplantacao =
    cl != null && impl != null && cl > 0
      ? ((cl - impl) / cl) * 100
      : undefined

  const perdasPosImplantacao =
    impl != null && vivos != null && impl > 0
      ? ((impl - vivos) / impl) * 100
      : undefined

  return { perdasPreImplantacao, perdasPosImplantacao }
}

export const upsertGestacao = async (rataId: number, dados: DadosGestacao) => {
  const rata = await prisma.rata.findUnique({ where: { id: rataId } })
  if (!rata) throw new Error('Rata não encontrada.')
  if (!rata.prenhez) throw new Error('Apenas ratas prenhes podem ter dados de gestação.')

  const perdas = calcularPerdas(dados)

  const payload = {
    ...dados,
    perdasPreImplantacao: perdas.perdasPreImplantacao ?? dados.perdasPreImplantacao ?? null,
    perdasPosImplantacao: perdas.perdasPosImplantacao ?? dados.perdasPosImplantacao ?? null,
  }

  return prisma.gestacao.upsert({
    where: { rataId },
    create: { rataId, ...payload },
    update: { ...payload },
  })
}

export const getGestacao = async (rataId: number) => {
  const gestacao = await prisma.gestacao.findUnique({ where: { rataId } })
  if (!gestacao) throw new Error('Gestação não encontrada para esta rata.')
  return gestacao
}
