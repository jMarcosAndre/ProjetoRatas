import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage }         from './pages/LoginPage'
import { ProjetosPage }      from './pages/ProjetosPage'
import { ProjetoDetailPage } from './pages/ProjetoDetailPage'
import { CadastroPage }      from './pages/CadastroPage'
import { RataDetailPage }    from './pages/RataDetailPage'
import './styles/global.css'

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/projetos" replace /> : <LoginPage />} />

      <Route path="/projetos" element={
        <RotaProtegida><ProjetosPage /></RotaProtegida>
      } />

      <Route path="/projetos/:id" element={
        <RotaProtegida><ProjetoDetailPage /></RotaProtegida>
      } />

      <Route path="/ratas/:id" element={
        <RotaProtegida><RataDetailPage /></RotaProtegida>
      } />

      <Route path="/cadastro" element={
        <RotaProtegida><CadastroPage /></RotaProtegida>
      } />

      <Route path="*" element={<Navigate to={token ? '/projetos' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
