import { useState, useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronRight,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { getNavItemsForRole } from "../../config/navConfig";
import { SisgesLogo } from "../SisgesLogo/SisgesLogo";
import { UserAvatar } from "../UserAvatar/UserAvatar";

function getRoleLabel(role?: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "Administradora";
    case "TEACHER":
      return "Professora";
    case "STUDENT":
      return "Estudante";
    default:
      return "Usuário";
  }
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = getNavItemsForRole(user?.role);

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "group relative flex min-h-12 w-full items-center justify-start gap-3.5 px-6 py-3 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-primary)]",
      isActive
        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-r before:bg-[var(--color-primary)]"
        : "text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)]",
    ].join(" ");

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]">
      {/* Brand */}
      <div className="shrink-0 px-6 pt-7 pb-8">
        <button
          type="button"
          onClick={() => {
            navigate("/");
            closeDrawer();
          }}
          className="group flex w-full min-w-0 cursor-pointer items-center border-none bg-transparent p-0 text-left font-bold tracking-tight text-[var(--color-sidebar-foreground)] transition-opacity hover:opacity-90"
        >
          <SisgesLogo
            variant="lockup"
            tone="auto"
            className="min-w-0"
            textClassName="text-2xl font-bold tracking-tight text-[var(--color-sidebar-foreground)]"
          />
        </button>
      </div>

      {/* Nav */}
      <nav
        aria-label="Páginas"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-1"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.end}
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
                className="shrink-0"
                aria-hidden
              />
              <span className="min-w-0 flex-1 text-left">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme and account stay available below the scrolling navigation. */}
      <div className="shrink-0 pb-4 pt-5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Alternar para modo ${mode === "light" ? "escuro" : "claro"}`}
          className="flex min-h-11 w-full items-center justify-start gap-3.5 px-6 py-3 text-left text-sm text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {mode === "light" ? (
            <FiMoon size={19} aria-hidden />
          ) : (
            <FiSun size={19} aria-hidden />
          )}
          <span>Alternar tema</span>
        </button>
        <div className="mx-5 mt-3 flex items-center gap-2 border-t border-[var(--color-sidebar-border)] pt-4">
          <button
            type="button"
            aria-label="Abrir minha conta"
            onClick={() => {
              navigate("/account");
              closeDrawer();
            }}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-start gap-2.5 rounded-md bg-transparent text-left hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <UserAvatar
              path={user?.profileImagePath}
              name={user?.name}
              className="h-9 w-9 shrink-0 rounded-lg"
            />
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-[var(--color-sidebar-foreground)]">
                {user?.name || user?.email}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[var(--color-sidebar-muted)]">
                {getRoleLabel(user?.role)}
              </span>
            </span>
            <FiChevronRight
              size={14}
              aria-hidden
              className="shrink-0 text-[var(--color-sidebar-muted)]"
            />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <FiLogOut size={17} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* ── Desktop sidebar ── */}
      <aside
        className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] flex-shrink-0 flex-col lg:flex"
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
          "fixed bottom-0 left-0 top-0 z-40 flex w-[min(272px,88vw)] flex-col shadow-xl transition-transform duration-200 lg:hidden",
          drawerOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        ].join(" ")}
        aria-label="Menu de navegação"
        aria-hidden={!drawerOpen}
      >
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-subtle)]"
          >
            {drawerOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mr-auto min-w-0 flex max-w-[min(12rem,55vw)] items-center text-left text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer p-0"
          >
            <SisgesLogo
              variant="lockup"
              className="min-w-0"
              textClassName="text-xl"
            />
          </button>
          <div className="text-[var(--color-text-primary)]">
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
          >
            <FiLogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex min-h-0 flex-1 flex-col bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
