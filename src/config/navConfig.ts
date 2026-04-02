export interface NavItem {
  label: string
  to: string
  end?: boolean
}

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return []
  if (role === 'ADMIN') {
    return [
      { label: 'AVISOS', to: '/', end: true },
      { label: 'ALUNOS', to: '/admin/students' },
      { label: 'CLASSES', to: '/admin/classes' },
      { label: 'DISCIPLINAS', to: '/admin/disciplines' },
      { label: 'AULAS', to: '/aulas' },
    ]
  }
  if (role === 'TEACHER') {
    return [
      { label: 'AVISOS', to: '/', end: true },
      { label: 'AULAS', to: '/aulas' },
      { label: 'MATERIAIS', to: '/materiais' },
    ]
  }
  if (role === 'STUDENT') {
    return [{ label: 'AVISOS', to: '/', end: true }]
  }
  return []
}
