import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { api } from '../api/client'

type Grupo        = 'DMod' | 'FDmod' | 'NDmod' | 'Controle'
type Linhagem     = 'WISTAR' | 'SPRAGUE_DAWLEY' | 'SHR' | 'WAR' | 'OUTRO'
type PeriodoMorte = 'PRE_IMPLANTACAO' | 'LOGO_APOS_IMPLANTACAO' | 'FINAL_PRENHEZ' | 'VIVO'

type Feto = {
  id: number
  identificacao: string
  statusPeriodo: PeriodoMorte
  pesoFeto?: number | null
  pesoPlacenta?: number | null
  dataPrenhez?: string | null
  dataMorte?: string | null
}

type DadoGeral = {
  id: number
  peso: number
  consumoAgua: number
  consumoRacao: number
  dataMedicao: string
}

type Gestacao = {
  dataPrenhez: string
  ganhoPesoMaterno?: number | null
  nCorposLuteos?: number | null
  nImplantacoes?: number | null
  nFetosVivos?: number | null
  nFetosMortos?: number | null
  nMortesEmbrionarias?: number | null
  perdasPreImplantacao?: number | null
  perdasPosImplantacao?: number | null
  pesoTotalNinhada?: number | null
}

type TOTG = {
  dataRealizacao: string
  t0: number
  t30: number
  t60: number
  t120: number
  diagnostico?: string | null
}

type Rata = {
  id: number
  numero: number
  identificacao: number
  linhagem: Linhagem
  linhagemOutro?: string | null
  prenhez: boolean
  recebeuSTZ: boolean
  inclusao: boolean
  morte?: boolean | null
  grupo?: Grupo | null
  dataNascimento: string
  dataFinalExperimento: string
  gestacao?: Gestacao | null
  totg?: TOTG | null
  fetos: Feto[]
  historicoDados: DadoGeral[]
}

const LINHAGEM_LABEL: Record<Linhagem, string> = {
  WISTAR: 'Wistar', SPRAGUE_DAWLEY: 'Sprague-Dawley',
  SHR: 'SHR', WAR: 'WAR', OUTRO: 'Outro',
}

const PERIODO_LABEL: Record<PeriodoMorte, string> = {
  VIVO:                  'Vivo',
  PRE_IMPLANTACAO:       'Pré-implantação',
  LOGO_APOS_IMPLANTACAO: 'Logo após implantação',
  FINAL_PRENHEZ:         'Final da prenhez',
}

const GRUPO_BADGE: Record<Grupo, string> = {
  DMod: 'badge-dmod', Controle: 'badge-controle',
  FDmod: 'badge-fdmod', NDmod: 'badge-ndmod',
}

function fmt(v: number | null | undefined, decimais = 2) {
  return v != null ? v.toFixed(decimais) : '—'
}

function fmtData(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

export function RataDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [rata, setRata]         = useState<Rata | null>(null)
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')

  useEffect(() => {
    if (!id) return
    api.get<Rata>(`/ratas/${id}`)
      .then(setRata)
      .finally(() => setLoading(false))
  }, [id])

  async function toggleMorte() {
    if (!rata) return
    setSalvando(true); setErro('')
    try {
      const atualizado = await api.put<Rata>(`/ratas/${rata.id}`, { morte: !rata.morte })
      setRata(prev => prev ? { ...prev, morte: atualizado.morte } : prev)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <><Header /><div className="page"><p className="sem-dados">Carregando...</p></div></>
  if (!rata)   return <><Header /><div className="page"><p className="sem-dados">Rata não encontrada.</p></div></>

  const podeAdicionarFetos =
    rata.morte === true && rata.prenhez && !!rata.gestacao?.dataPrenhez

  return (
    <>
      <Header />
      <div className="page">
        <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>

        {/* ── Cabeçalho ── */}
        <div className="rata-header">
          <div>
            <h2>Rata Nº {rata.numero}</h2>
            <div className="rata-sub">
              {rata.linhagem === 'OUTRO' ? rata.linhagemOutro : LINHAGEM_LABEL[rata.linhagem]}
              {rata.grupo && (
                <span className={`badge ${GRUPO_BADGE[rata.grupo]}`}>{rata.grupo}</span>
              )}
              {!rata.totg
                ? <span className="badge badge-pendente">Pendente</span>
                : <span className={`badge ${rata.inclusao ? 'badge-incluida' : 'badge-excluida'}`}>
                    {rata.inclusao ? 'Incluída' : 'Excluída'}
                  </span>
              }
            </div>
          </div>

          <div className={`morte-toggle ${rata.morte ? 'morta' : 'viva'}`}>
            <div className="morte-toggle-info">
              <span className="morte-toggle-label">Status</span>
              <span className="morte-toggle-valor">{rata.morte ? 'Morta' : 'Viva'}</span>
            </div>
            <button
              className={`btn-morte ${rata.morte ? 'desfazer' : 'confirmar'}`}
              onClick={toggleMorte}
              disabled={salvando}
            >
              {salvando ? '...' : rata.morte ? 'Desfazer morte' : 'Marcar como morta'}
            </button>
          </div>
        </div>

        {erro && <p className="erro-msg">{erro}</p>}

        {/* ── Dados gerais da rata ── */}
        <Secao titulo="Informações gerais">
          <div className="info-grid">
            <InfoItem label="Prenhe"          valor={rata.prenhez ? 'Sim' : 'Não'} />
            <InfoItem label="Recebeu STZ"     valor={rata.recebeuSTZ ? 'Sim' : 'Não'} />
            <InfoItem label="Nascimento"      valor={fmtData(rata.dataNascimento)} />
            <InfoItem label="Fim experimento" valor={fmtData(rata.dataFinalExperimento)} />
          </div>
        </Secao>

        {/* ── TOTG ── */}
        <Secao titulo="TOTG">
          {!rata.totg ? (
            <p className="sem-dados">TOTG não registrado.</p>
          ) : (
            <>
              <div className="info-grid">
                <InfoItem label="Data realização" valor={fmtData(rata.totg.dataRealizacao)} />
                <InfoItem label="Diagnóstico"     valor={rata.totg.diagnostico ?? '—'} destaque />
                <InfoItem label="T0 (jejum)"      valor={`${fmt(rata.totg.t0, 1)} mg/dL`} />
                <InfoItem label="T30"             valor={`${fmt(rata.totg.t30, 1)} mg/dL`} />
                <InfoItem label="T60"             valor={`${fmt(rata.totg.t60, 1)} mg/dL`} />
                <InfoItem label="T120"            valor={`${fmt(rata.totg.t120, 1)} mg/dL`} />
              </div>
            </>
          )}
        </Secao>

        {/* ── Gestação ── */}
        {rata.prenhez && (
          <Secao titulo="Gestação">
            {!rata.gestacao ? (
              <p className="sem-dados">Dados de gestação não registrados.</p>
            ) : (
              <div className="info-grid">
                <InfoItem label="Data de prenhez"         valor={fmtData(rata.gestacao.dataPrenhez)} />
                <InfoItem label="Ganho peso materno (g)"  valor={fmt(rata.gestacao.ganhoPesoMaterno)} />
                <InfoItem label="Nº corpos lúteos"        valor={fmt(rata.gestacao.nCorposLuteos, 0)} />
                <InfoItem label="Nº implantações"         valor={fmt(rata.gestacao.nImplantacoes, 0)} />
                <InfoItem label="Nº fetos vivos"          valor={fmt(rata.gestacao.nFetosVivos, 0)} />
                <InfoItem label="Nº fetos mortos"         valor={fmt(rata.gestacao.nFetosMortos, 0)} />
                <InfoItem label="Mortes embrionárias"     valor={fmt(rata.gestacao.nMortesEmbrionarias, 0)} />
                <InfoItem label="Perdas pré-implant. (%)" valor={fmt(rata.gestacao.perdasPreImplantacao)} />
                <InfoItem label="Perdas pós-implant. (%)" valor={fmt(rata.gestacao.perdasPosImplantacao)} />
                <InfoItem label="Peso total ninhada (g)"  valor={fmt(rata.gestacao.pesoTotalNinhada)} />
              </div>
            )}
          </Secao>
        )}

        {/* ── Fetos ── */}
        {rata.prenhez && (
          <Secao
            titulo="Fetos"
            acao={podeAdicionarFetos ? {
              label: 'Gerenciar fetos',
              onClick: () => navigate(`/ratas/${rata.id}/fetos`),
            } : undefined}
          >
            {!podeAdicionarFetos && (
              <div className="aviso-fetos">
                {!rata.morte        && <p>⚠ Rata precisa estar <strong>morta</strong> para análise fetal.</p>}
                {rata.morte && !rata.gestacao?.dataPrenhez && (
                  <p>⚠ Gestação precisa ter <strong>data de prenhez</strong> registrada.</p>
                )}
              </div>
            )}
            {rata.fetos.length === 0 ? (
              <p className="sem-dados">Nenhum feto registrado.</p>
            ) : (
              <div className="tabela-wrapper">
                <table className="tabela-ratas">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Peso feto (g)</th>
                      <th>Peso placenta (g)</th>
                      <th>Data prenhez</th>
                      <th>Data morte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rata.fetos.map(f => (
                      <tr key={f.id}>
                        <td>{f.identificacao}</td>
                        <td>{PERIODO_LABEL[f.statusPeriodo]}</td>
                        <td>{fmt(f.pesoFeto)}</td>
                        <td>{fmt(f.pesoPlacenta)}</td>
                        <td>{fmtData(f.dataPrenhez)}</td>
                        <td>{fmtData(f.dataMorte)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Secao>
        )}

        {/* ── Dados Gerais (peso, água, ração) ── */}
        <Secao titulo={`Dados Gerais (${rata.historicoDados.length} registros)`}>
          {rata.historicoDados.length === 0 ? (
            <p className="sem-dados">Nenhum dado registrado.</p>
          ) : (
            <div className="tabela-wrapper">
              <table className="tabela-ratas">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Peso (g)</th>
                    <th>Consumo água (mL)</th>
                    <th>Consumo ração (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {rata.historicoDados.map(d => (
                    <tr key={d.id}>
                      <td>{fmtData(d.dataMedicao)}</td>
                      <td>{fmt(d.peso)}</td>
                      <td>{fmt(d.consumoAgua)}</td>
                      <td>{fmt(d.consumoRacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Secao>
      </div>
    </>
  )
}

// ── Componentes auxiliares ───────────────────────────────────────────────────

function Secao({
  titulo, children, acao,
}: {
  titulo: string
  children: React.ReactNode
  acao?: { label: string; onClick: () => void }
}) {
  return (
    <div className="secao">
      <div className="secao-titulo">
        <h3>{titulo}</h3>
        {acao && (
          <button className="btn-acessar" onClick={acao.onClick}>{acao.label}</button>
        )}
      </div>
      {children}
    </div>
  )
}

function InfoItem({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div>
      <span className="info-label">{label}</span>
      <span style={destaque ? { fontWeight: 700, fontSize: '1rem' } : {}}>{valor}</span>
    </div>
  )
}
