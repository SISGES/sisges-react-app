import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiHome,
  FiLayers,
  FiUsers,
  FiUserCheck,
  FiAward,
} from "react-icons/fi";

export interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  icon: IconType;
}

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return [];
  const r = role.toUpperCase();
  if (r === "ADMIN") {
    return [
      { label: "Início", to: "/", end: true, icon: FiHome },
      { label: "Alunos", to: "/admin/students", icon: FiUsers },
      { label: "Professores", to: "/admin/teachers", icon: FiUserCheck },
      { label: "Turmas", to: "/admin/classes", icon: FiLayers },
      { label: "Disciplinas", to: "/admin/disciplines", icon: FiBookOpen },
      { label: "Notas", to: "/admin/notas", icon: FiClipboard },
      { label: "Aulas", to: "/aulas", icon: FiCalendar },
      { label: "Eventos", to: "/events", icon: FiCalendar },
    ];
  }
  if (r === "TEACHER") {
    return [
      { label: "Início", to: "/", end: true, icon: FiHome },
      { label: "Aulas", to: "/aulas", icon: FiCalendar },
      { label: "Materiais", to: "/materiais", icon: FiFileText },
    ];
  }
  if (r === "STUDENT") {
    return [
      { label: "Início", to: "/", end: true, icon: FiHome },
      { label: "Minha turma", to: "/minha-turma", icon: FiUsers },
      { label: "Faltas", to: "/faltas", icon: FiClipboard },
      { label: "Boletim", to: "/boletim", icon: FiAward },
    ];
  }
  return [];
}
