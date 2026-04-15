import { useEffect, useState, type FormEvent } from 'react'
import { Header } from '../components/Header'
import { api } from '../api/client'

type User    = { id: number; nome: string; email: string; roleSistema: string }
type Projeto = { id: number; nome: string }

type Aba = 'usuario' | 'projeto' | 'atribuir'

export function CadastroPage() {
  const [aba, setAba] = useState<Aba>('usuario')

  return (
    <>
      <Header />
      <div className="page">
        <h1 className="page-titulo">Cadastro</h1>

        <div className="abas-cadastro">
          <button className={aba === 'usuario'  ? 'ativo' : ''} onClick={() => setAba('usuario')}>
            Novo Usuário
          </button>
          <button className={aba === 'projeto'  ? 'ativo' : ''} onClick={() => setAba('projeto')}>
            Novo Projeto
          </button>
          <button className={aba === 'atribuir' ? 'ativo' : ''} onClick={() => setAba('atribuir')}>
            Atribuir ao Projeto
          </button>
        </div>

        {aba === 'usuario'  && <FormNovoUsuario />}
        {aba === 'projeto'  && <FormNovoProjeto />}
        {aba === 'atribuir' && <FormAtribuir />}
      </div>
    </>
  )
}

// ─── Formulário: Novo Usuário ─────────────────────────────────────────────────
function FormNovoUsuario() {
  const [nome,  setNome]  = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg,   setMsg]   = useState<{ texto: string; erro: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      await api.post('/users', { nome, email, senha })
      setMsg({ texto: `Usuário "${nome}" criado com sucesso.`, erro: false })
      setNome(''); setEmail(''); setSenha('')
    } catch (err) {
      setMsg({ texto: err instanceof Error ? err.message : 'Erro ao criar usuário.', erro: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-cadastro" onSubmit={handleSubmit}>
      <div className="campo">
        <label>Nome completo</label>
        <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Maria Silva" />
      </div>
      <div className="campo">
        <label>E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="maria@email.com" />
      </div>
      <div className="campo">
        <label>Senha inicial</label>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••••" minLength={6} />
      </div>
      {msg && <p className={msg.erro ? 'erro-msg' : 'ok-msg'}>{msg.texto}</p>}
      <button className="btn-primario" type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Usuário'}
      </button>
    </form>
  )
}

// ─── Formulário: Novo Projeto ─────────────────────────────────────────────────
function FormNovoProjeto() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [nome,         setNome]         = useState('')
  const [descricao,    setDescricao]    = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [msg,   setMsg]   = useState<{ texto: string; erro: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<User[]>('/users').then(setUsuarios).catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      await api.post('/projects', {
        nome,
        descricao: descricao || undefined,
        responsavelProjetoId: Number(responsavelId),
      })
      setMsg({ texto: `Projeto "${nome}" criado com sucesso.`, erro: false })
      setNome(''); setDescricao(''); setResponsavelId('')
    } catch (err) {
      setMsg({ texto: err instanceof Error ? err.message : 'Erro ao criar projeto.', erro: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-cadastro" onSubmit={handleSubmit}>
      <div className="campo">
        <label>Nome do projeto</label>
        <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Projeto Diabetes 2025" />
      </div>
      <div className="campo">
        <label>Descrição (opcional)</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Descreva brevemente o projeto..." />
      </div>
      <div className="campo">
        <label>Responsável</label>
        <select value={responsavelId} onChange={e => setResponsavelId(e.target.value)} required>
          <option value="">Selecionar responsável...</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>
          ))}
        </select>
      </div>
      {msg && <p className={msg.erro ? 'erro-msg' : 'ok-msg'}>{msg.texto}</p>}
      <button className="btn-primario" type="submit" disabled={loading || !responsavelId}>
        {loading ? 'Criando...' : 'Criar Projeto'}
      </button>
    </form>
  )
}

// ─── Formulário: Atribuir Usuário ao Projeto ──────────────────────────────────
function FormAtribuir() {
  const [usuarios,  setUsuarios]  = useState<User[]>([])
  const [projetos,  setProjetos]  = useState<Projeto[]>([])
  const [userId,    setUserId]    = useState('')
  const [projetoId, setProjetoId] = useState('')
  const [msg,   setMsg]   = useState<{ texto: string; erro: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<User[]>('/users'),
      api.get<Projeto[]>('/projects'),
    ]).then(([u, p]) => { setUsuarios(u); setProjetos(p) }).catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      await api.post(`/projects/${projetoId}/colaboradores`, { userId: Number(userId) })
      const u = usuarios.find(x => x.id === Number(userId))
      const p = projetos.find(x => x.id === Number(projetoId))
      setMsg({ texto: `"${u?.nome}" atribuído ao projeto "${p?.nome}" como Colaborador.`, erro: false })
      setUserId(''); setProjetoId('')
    } catch (err) {
      setMsg({ texto: err instanceof Error ? err.message : 'Erro ao atribuir.', erro: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-cadastro" onSubmit={handleSubmit}>
      <div className="campo">
        <label>Usuário</label>
        <select value={userId} onChange={e => setUserId(e.target.value)} required>
          <option value="">Selecionar usuário...</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label>Projeto</label>
        <select value={projetoId} onChange={e => setProjetoId(e.target.value)} required>
          <option value="">Selecionar projeto...</option>
          {projetos.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        O usuário será adicionado como <strong>Colaborador</strong>. Para definir como Responsável, use "Novo Projeto".
      </p>
      {msg && <p className={msg.erro ? 'erro-msg' : 'ok-msg'}>{msg.texto}</p>}
      <button className="btn-primario" type="submit" disabled={loading || !userId || !projetoId}>
        {loading ? 'Atribuindo...' : 'Atribuir ao Projeto'}
      </button>
    </form>
  )
}
