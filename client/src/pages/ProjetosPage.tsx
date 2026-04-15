import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { api } from '../api/client'

type Projeto = {
  id: number
  nome: string
  descricao?: string
  status: 'EM_CURSO' | 'CONCLUIDO' | 'INTERROMPIDO'
  responsavel?: { nome: string }
}

const STATUS_LABEL: Record<Projeto['status'], string> = {
  EM_CURSO:      'Em curso',
  CONCLUIDO:     'Concluído',
  INTERROMPIDO:  'Interrompido',
}

export function ProjetosPage() {
  const [projetos, setProjetos]   = useState<Projeto[]>([])
  const [busca, setBusca]         = useState('')
  const [abertos, setAbertos]     = useState<Set<number>>(new Set())
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<Projeto[]>('/projects')
      .then(setProjetos)
      .finally(() => setLoading(false))
  }, [])

  const filtrados = projetos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.responsavel?.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function toggleAberto(id: number) {
    setAbertos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      <Header />
      <div className="page">
        <div className="search-bar">
          <input
            placeholder="Pesquisar por projeto ou responsável..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <span className="icon">🔍</span>
        </div>

        <h1 className="page-titulo">Projetos</h1>

        {loading && <p className="sem-dados">Carregando...</p>}

        {!loading && filtrados.length === 0 && (
          <p className="sem-dados">Nenhum projeto encontrado.</p>
        )}

        {filtrados.map(p => (
          <div key={p.id} className="project-card">
            <div className="project-card-header">
              <span className="project-card-nome">{p.nome}</span>
              <button className="btn-acessar" onClick={() => navigate(`/projetos/${p.id}`)}>
                Acessar
              </button>
              <button
                className={`btn-chevron ${abertos.has(p.id) ? 'aberto' : ''}`}
                onClick={() => toggleAberto(p.id)}
              >
                ▼
              </button>
            </div>

            {abertos.has(p.id) && (
              <div className="project-card-body">
                {p.descricao && <span><b>Descrição:</b> {p.descricao}</span>}
                {p.responsavel && <span><b>Responsável:</b> {p.responsavel.nome}</span>}
                <span><b>Status:</b> {STATUS_LABEL[p.status]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
