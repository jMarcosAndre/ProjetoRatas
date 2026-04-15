import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../api/client'

type User = {
  id: number
  nome: string
  email: string
  roleSistema: 'ADMIN' | 'USER'
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.get<User>('/users/me').then(setUser).catch(() => logout())
    }
  }, [token])

  async function login(email: string, senha: string) {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, senha })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.roleSistema === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
