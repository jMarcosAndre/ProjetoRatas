import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Aba = { label: string; path: string; apenasAdmin?: boolean }

const ABAS: Aba[] = [
  { label: 'Cadastro',       path: '/cadastro',      apenasAdmin: true },
  { label: 'Alunos',         path: '/alunos',         apenasAdmin: true },
  { label: 'Colaboradores',  path: '/colaboradores',  apenasAdmin: true },
  { label: 'Projetos',       path: '/projetos' },
]

export function Header() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAdmin, logout } = useAuth()

  const abas = ABAS.filter(a => !a.apenasAdmin || isAdmin)

  return (
    <header className="header">
      <div className="header-logo">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span>Unesp</span>
      </div>

      <nav className="header-nav">
        {abas.map(a => (
          <button
            key={a.path}
            className={location.pathname.startsWith(a.path) ? 'ativo' : ''}
            onClick={() => navigate(a.path)}
          >
            {a.label}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        style={{ padding: '0 16px', background: 'none', border: 'none', borderLeft: '1px solid #aaa', fontSize: '0.85rem', color: '#555' }}
      >
        Sair
      </button>
    </header>
  )
}
