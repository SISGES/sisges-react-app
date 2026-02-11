import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle'
import { ColorPalette } from '../../components/ColorPalette/ColorPalette'
import { ExampleComponents } from '../../components/ExampleComponents/ExampleComponents'
import './Home.css'

export function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="home-container">
      <ThemeToggle />
      <header className="home-header">
        <div className="header-content">
          <div>
            <h1>SISGES</h1>
            <p className="text-secondary">Sistema de Gestão Escolar</p>
          </div>
          <div className="user-info">
            <span className="text-secondary">Olá, {user?.name || user?.email}</span>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/register')}
                className="btn-admin-action"
              >
                Cadastrar Usuário
              </button>
            )}
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main>
        <ColorPalette />
        <ExampleComponents />
      </main>
    </div>
  )
}
