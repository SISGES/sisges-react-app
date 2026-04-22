import { useState, useEffect } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { getNavItemsForRole } from '../../config/navConfig'
import { SisgesLogo } from '../SisgesLogo/SisgesLogo'

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? '?'
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const items = getNavItemsForRole(user?.role)

  const closeDrawer = () => setDrawerOpen(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]',
    ].join(' ')

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => { navigate('/'); closeDrawer() }}
          className="flex w-full min-w-0 items-center text-left font-bold tracking-tight text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer p-0 hover:opacity-90 transition-opacity"
        >
          <SisgesLogo variant="lockup" className="min-w-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={closeDrawer}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + actions */}
      <div className="px-3 py-4 border-t border-[var(--color-border)] flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {getInitials(user?.name, user?.email)}
          </div>
          <span className="text-sm text-[var(--color-text-secondary)] truncate">
            {user?.name || user?.email}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-error)] hover:border-[var(--color-error)] hover:text-white transition-colors cursor-pointer"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 h-screen"
        aria-label="Navegação principal"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: backdrop + drawer ── */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="lg:hidden fixed inset-0 z-30 bg-black/50 border-none p-0 cursor-default"
          onClick={closeDrawer}
        />
      )}
      <aside
        className={[
          'lg:hidden fixed top-0 left-0 bottom-0 z-40 w-[min(260px,88vw)] bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xl flex flex-col transition-transform duration-200',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Menu de navegação"
        aria-hidden={!drawerOpen}
      >
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors cursor-pointer"
          >
            {drawerOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-auto min-w-0 flex max-w-[min(12rem,55vw)] items-center text-left text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer p-0"
          >
            <SisgesLogo variant="lockup" className="min-w-0" textClassName="text-sm font-bold tracking-tight text-[var(--color-text-primary)] sm:text-base" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-error)] hover:border-[var(--color-error)] hover:text-white transition-colors cursor-pointer"
          >
            <FiLogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
