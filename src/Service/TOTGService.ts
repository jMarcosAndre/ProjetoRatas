import { PrismaClient, GrupoExperimental } from '@prisma/client'

const prisma = new PrismaClient()

// Critérios de diagnóstico (mg/dL) — ajuste os limiares conforme necessário
const LIMIAR_JEJUM_DIABETICA = 126   // t0 ≥ este valor → diabética
const LIMIAR_2H_DIABETICA    = 200   // t120 ≥ este valor → diabética

function calcularDiagnostico(t0: number, t120: number): string {
  if (t0 >= LIMIAR_JEJUM_DIABETICA || t120 >= LIMIAR_2H_DIABETICA) return 'DIABETICA'
  return 'NORMAL'
}

// Grupo sugerido quando recebeuSTZ=true e é diabética
// O usuário pode trocar depois via PUT /ratas/:id
const GRUPO_SUGERIDO_STZ_DIABETICA: GrupoExperimental = 'DMod'

type DadosTOTG = {
  dataRealizacao: Date
  t0: number
  t30: number
  t60: number
  t120: number
  diagnostico?: string  // se fornecido, sobrepõe o cálculo automático
}

export const upsertTOTG = async (rataId: number, dados: DadosTOTG) => {
  const rata = await prisma.rata.findUnique({ where: { id: rataId } })
  if (!rata) throw new Error('Rata não encontrada.')

  const diagnosticoCalculado = calcularDiagnostico(dados.t0, dados.t120)
  const diagnosticoFinal = dados.diagnostico ?? diagnosticoCalculado

  const totg = await prisma.tOTG.upsert({
    where:  { rataId },
    create: { rataId, dataRealizacao: dados.dataRealizacao, t0: dados.t0, t30: dados.t30, t60: dados.t60, t120: dados.t120, diagnostico: diagnosticoFinal },
    update: {         dataRealizacao: dados.dataRealizacao, t0: dados.t0, t30: dados.t30, t60: dados.t60, t120: dados.t120, diagnostico: diagnosticoFinal },
  })

  // --- Classificação automática da rata ---
  let inclusaoSugerida: boolean
  let grupoSugerido: GrupoExperimental | null

  if (!rata.recebeuSTZ) {
    // Não recebeu STZ → sempre Controle (TOTG serve apenas para confirmar normalidade)
    inclusaoSugerida = true
    grupoSugerido    = 'Controle'
  } else if (diagnosticoFinal === 'DIABETICA') {
    // Recebeu STZ e é diabética → incluída; mantém grupo já definido ou sugere DMod
    inclusaoSugerida = true
    grupoSugerido    = rata.grupo ?? GRUPO_SUGERIDO_STZ_DIABETICA
  } else {
    // Recebeu STZ mas NÃO ficou diabética → excluída do experimento
    inclusaoSugerida = false
    grupoSugerido    = null
  }

  await prisma.rata.update({
    where: { id: rataId },
    data:  { inclusao: inclusaoSugerida, grupo: grupoSugerido },
  })

  return {
    totg,
    classificacaoAplicada: {
      diagnostico:  diagnosticoFinal,
      inclusao:     inclusaoSugerida,
      grupo:        grupoSugerido,
      calculadoAutomaticamente: dados.diagnostico === undefined,
    },
  }
}

export const getTOTG = async (rataId: number) => {
  const totg = await prisma.tOTG.findUnique({ where: { rataId } })
  if (!totg) throw new Error('TOTG não encontrado para esta rata.')
  return totg
}
