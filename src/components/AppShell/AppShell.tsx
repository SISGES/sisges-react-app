import { useState, useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
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
      "group flex min-h-12 items-center gap-3 rounded-lg px-3.5 py-2.5 text-base font-medium transition-all duration-150",
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-md"
        : "text-[var(--color-sidebar-muted)] hover:bg-white/8 hover:text-white",
    ].join(" ");

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[var(--color-sidebar)] text-white">
      {/* Brand */}
      <div className="border-b border-[var(--color-sidebar-border)] px-5 py-6">
        <button
          type="button"
          onClick={() => {
            navigate("/");
            closeDrawer();
          }}
          className="flex w-full min-w-0 cursor-pointer items-center border-none bg-transparent p-0 text-left font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <SisgesLogo
            variant="lockup"
            className="min-w-0"
            textClassName="text-2xl font-bold tracking-tight text-white"
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5">
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
                size={22}
                strokeWidth={1.8}
                className="shrink-0"
                aria-hidden
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User + actions */}
      <div className="flex flex-col gap-4 border-t border-[var(--color-sidebar-border)] px-4 py-5">
        <button
          type="button"
          onClick={() => {
            navigate("/account");
            closeDrawer();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent p-0 text-left hover:opacity-90"
        >
          <UserAvatar path={user?.profileImagePath} name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || user?.email}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-sidebar-muted)]">
              {getRoleLabel(user?.role)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2 border-t border-[var(--color-sidebar-border)] pt-4 text-white">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-transparent text-white/75 transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
          >
            <FiLogOut size={18} />
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
          drawerOpen ? "translate-x-0" : "-translate-x-full",
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
              textClassName="text-sm font-bold tracking-tight text-[var(--color-text-primary)] sm:text-base"
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
