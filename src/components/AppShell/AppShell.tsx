import { useState } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { getNavItemsForRole } from '../../config/navConfig'
import './AppShell.css'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = getNavItemsForRole(user?.role)
  const showHomeButton = location.pathname !== '/'

  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebar = () => setSidebarOpen((open) => !open)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <div className="app-shell-content">
        <header className="app-shell-header">
          <div className="app-shell-header-start">
            <button
              type="button"
              className={`app-shell-menu-btn ${sidebarOpen ? 'app-shell-menu-btn-open' : ''}`}
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <span className="app-shell-menu-line" />
              <span className="app-shell-menu-line" />
              <span className="app-shell-menu-line" />
            </button>
            <button
              type="button"
              className="app-shell-brand"
              onClick={() => navigate('/')}
            >
              SISGES
            </button>
            {showHomeButton && (
              <button
                type="button"
                className="app-shell-home-btn"
                onClick={() => navigate('/')}
              >
                Página inicial
              </button>
            )}
          </div>
          <div className="app-shell-header-right">
            <span className="text-secondary app-shell-greeting">
              Olá, {user?.name || user?.email}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="btn-logout-icon"
              title="Sair"
              aria-label="Sair"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </header>
        <aside className="app-shell-rail app-shell-rail-left" aria-hidden />
        <div className="app-shell-center">
          <main className="app-shell-main">
            <Outlet />
          </main>
        </div>
        <aside className="app-shell-rail app-shell-rail-right" aria-hidden />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="app-shell-backdrop"
          onClick={closeSidebar}
          aria-label="Fechar menu"
        />
      )}
      <aside
        className={`app-shell-drawer ${sidebarOpen ? 'app-shell-drawer-open' : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <nav className="app-shell-nav" onClick={closeSidebar}>
          {items.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `app-shell-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}
