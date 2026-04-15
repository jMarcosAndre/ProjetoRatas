import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { api } from '../api/client'

type Grupo = 'DMod' | 'FDmod' | 'NDmod' | 'Controle'
type Linhagem = 'WISTAR' | 'SPRAGUE_DAWLEY' | 'SHR' | 'WAR' | 'OUTRO'

type Rata = {
  id: number
  numero: number
  identificacao: number
  linhagem: Linhagem
  linhagemOutro?: string
  prenhez: boolean
  recebeuSTZ: boolean
  inclusao: boolean
  morte?: boolean
  grupo?: Grupo
  totg?: { diagnostico?: string }
}

const LINHAGEM_LABEL: Record<Linhagem, string> = {
  WISTAR:         'Wistar',
  SPRAGUE_DAWLEY: 'Sprague-Dawley',
  SHR:            'SHR',
  WAR:            'WAR',
  OUTRO:          'Outro',
}

const GRUPO_BADGE: Record<Grupo, string> = {
  DMod:     'badge-dmod',
  Controle: 'badge-controle',
  FDmod:    'badge-fdmod',
  NDmod:    'badge-ndmod',
}

type Filtros = {
  linhagem:  string
  prenhez:   string
  inclusao:  string
  grupo:     string
  recebeuSTZ: string
}

const FILTROS_VAZIOS: Filtros = {
  linhagem:   '',
  prenhez:    '',
  inclusao:   '',
  grupo:      '',
  recebeuSTZ: '',
}

export function ProjetoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ratas, setRatas]       = useState<Rata[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtros, setFiltros]   = useState<Filtros>(FILTROS_VAZIOS)

  useEffect(() => {
    if (!id) return
    const params = new URLSearchParams({ projetoId: id })
    api.get<Rata[]>(`/ratas?${params}`)
      .then(setRatas)
      .finally(() => setLoading(false))
  }, [id])

  function setFiltro(campo: keyof Filtros, valor: string) {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const filtradas = ratas.filter(r => {
    if (filtros.linhagem   && r.linhagem     !== filtros.linhagem)              return false
    if (filtros.prenhez    && String(r.prenhez)  !== filtros.prenhez)           return false
    if (filtros.inclusao   && String(r.inclusao) !== filtros.inclusao)          return false
    if (filtros.recebeuSTZ && String(r.recebeuSTZ) !== filtros.recebeuSTZ)      return false
    if (filtros.grupo      && (r.grupo ?? '') !== filtros.grupo)                return false
    return true
  })

  return (
    <>
      <Header />
      <div className="page">
        <button
          onClick={() => navigate('/projetos')}
          style={{ marginBottom: 16, background: 'none', border: 'none', fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Voltar aos projetos
        </button>

        <h1 className="page-titulo">Ratas do Projeto</h1>

        {/* Filtros */}
        <div className="filtros-panel">
          <div className="filtro-grupo">
            <label>Linhagem</label>
            <select value={filtros.linhagem} onChange={e => setFiltro('linhagem', e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(LINHAGEM_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Prenhez</label>
            <select value={filtros.prenhez} onChange={e => setFiltro('prenhez', e.target.value)}>
              <option value="">Todas</option>
              <option value="true">Prenhes</option>
              <option value="false">Não prenhes</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Inclusão</label>
            <select value={filtros.inclusao} onChange={e => setFiltro('inclusao', e.target.value)}>
              <option value="">Todas</option>
              <option value="true">Incluídas</option>
              <option value="false">Excluídas</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Grupo</label>
            <select value={filtros.grupo} onChange={e => setFiltro('grupo', e.target.value)}>
              <option value="">Todos</option>
              <option value="DMod">DMod</option>
              <option value="Controle">Controle</option>
              <option value="FDmod">FDmod</option>
              <option value="NDmod">NDmod</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>STZ</label>
            <select value={filtros.recebeuSTZ} onChange={e => setFiltro('recebeuSTZ', e.target.value)}>
              <option value="">Todas</option>
              <option value="true">Recebeu STZ</option>
              <option value="false">Não recebeu STZ</option>
            </select>
          </div>

          <button className="btn-limpar" onClick={() => setFiltros(FILTROS_VAZIOS)}>
            Limpar filtros
          </button>
        </div>

        {/* Tabela */}
        {loading ? (
          <p className="sem-dados">Carregando...</p>
        ) : filtradas.length === 0 ? (
          <p className="sem-dados">Nenhuma rata encontrada com esses filtros.</p>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela-ratas">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Linhagem</th>
                  <th>Prenhe</th>
                  <th>Morte</th>
                  <th>STZ</th>
                  <th>TOTG</th>
                  <th>Grupo</th>
                  <th>Inclusão</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(r => (
                  <tr key={r.id}>
                    <td>{r.numero}</td>
                    <td>{r.linhagem === 'OUTRO' ? r.linhagemOutro : LINHAGEM_LABEL[r.linhagem]}</td>
                    <td>{r.prenhez ? 'Sim' : 'Não'}</td>
                    <td>
                      {r.morte
                        ? <span className="badge badge-excluida">Morta</span>
                        : <span style={{ color: '#777' }}>—</span>}
                    </td>
                    <td>{r.recebeuSTZ ? 'Sim' : 'Não'}</td>
                    <td>{r.totg?.diagnostico ?? '—'}</td>
                    <td>
                      {r.grupo
                        ? <span className={`badge ${GRUPO_BADGE[r.grupo]}`}>{r.grupo}</span>
                        : '—'}
                    </td>
                    <td>
                      {!r.totg
                        ? <span className="badge badge-pendente">Pendente</span>
                        : <span className={`badge ${r.inclusao ? 'badge-incluida' : 'badge-excluida'}`}>
                            {r.inclusao ? 'Incluída' : 'Excluída'}
                          </span>
                      }
                    </td>
                    <td>
                      <button
                        className="btn-ver"
                        onClick={() => navigate(`/ratas/${r.id}`)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
