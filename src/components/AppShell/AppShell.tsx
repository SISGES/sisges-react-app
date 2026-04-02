import { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { getNavItemsForRole } from '../../config/navConfig'
import './AppShell.css'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = getNavItemsForRole(user?.role)

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <button
          type="button"
          className="app-shell-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <FiMenu size={22} />
        </button>
        <button
          type="button"
          className="app-shell-brand"
          onClick={() => navigate('/')}
        >
          SISGES
        </button>
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
        <div className="app-shell-drawer-top">
          <span className="app-shell-drawer-title">Menu</span>
          <button
            type="button"
            className="app-shell-drawer-close"
            onClick={closeSidebar}
            aria-label="Fechar"
          >
            <FiX size={22} />
          </button>
        </div>
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

      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  )
}
