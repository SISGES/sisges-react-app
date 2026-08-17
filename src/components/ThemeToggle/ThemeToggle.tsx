import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${mode === "light" ? "escuro" : "claro"}`}
      title={`Modo atual: ${mode === "light" ? "Claro" : "Escuro"}`}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-current/15 bg-transparent text-current/75 transition-colors hover:bg-white/10 hover:text-current cursor-pointer"
    >
      {mode === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  );
}
