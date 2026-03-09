import { useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle'
import { AdminDashboard } from '../../components/AdminDashboard/AdminDashboard'
import { AnnouncementFeed } from '../../components/AnnouncementFeed/AnnouncementFeed'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
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
      <header className="home-header">
        <div className="header-content">
          <div>
            <h1>SISGES</h1>
            <p className="text-secondary">Sistema de Gestão Escolar</p>
          </div>
          <div className="user-info">
            <span className="text-secondary">Olá, {user?.name || user?.email}</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="btn-logout-icon"
              title="Sair"
              aria-label="Sair"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main>
        <AnnouncementFeed />
        {user?.role === 'ADMIN' && user.id && (
          <AdminDashboard currentUserId={user.id} />
        )}
        {user?.role === 'TEACHER' && (
          <div className="home-teacher-section">
            <div className="teacher-hub-card" onClick={() => navigate('/aulas')}>
              <h3>Aulas</h3>
              <span className="teacher-hub-action">Gerenciar aulas →</span>
            </div>
            <div className="teacher-hub-card" onClick={() => navigate('/materiais')}>
              <h3>Materiais de Estudo</h3>
              <span className="teacher-hub-action">Inserir materiais →</span>
            </div>
          </div>
        )}
        {user?.role === 'STUDENT' && (
          <StudentHomeSection />
        )}
      </main>
    </div>
  )
}
