import { prisma } from '../lib/prisma.js'




export async function podeEscreverNoProjeto(
  userId: number,
  roleSistema: string,
  projetoId: number
): Promise<boolean> {
  if (roleSistema === 'ADMIN') return true
  const role = await prisma.projetoRole.findFirst({
    where: { userId, projetoId, role: 'RESPONSAVEL' },
  })
  return role !== null
}

export async function projetoIdDaRata(rataId: number): Promise<number | null> {
  const rata = await prisma.rata.findUnique({ where: { id: rataId }, select: { projetoId: true } })
  return rata?.projetoId ?? null
}

export async function projetoIdDoFeto(fetoId: number): Promise<number | null> {
  const feto = await prisma.feto.findUnique({
    where: { id: fetoId },
    include: { rata: { select: { projetoId: true } } },
  })
  return feto?.rata.projetoId ?? null
}
