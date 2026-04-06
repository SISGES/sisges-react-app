import { api } from './api'

export interface MyClassPeer {
  id: number
  name: string
  email: string
}

export interface MyClassTeacher {
  id: number
  name: string
  email: string
}

export interface MyClassResponse {
  className: string | null
  academicYear: string | null
  classmates: MyClassPeer[]
  teachers: MyClassTeacher[]
}

export interface DisciplineAbsenceRow {
  disciplineName: string
  absenceCount: number
}

export async function getMyClass(): Promise<MyClassResponse> {
  return api.get<MyClassResponse>('/students/me/turma')
}

export async function getMyAbsencesByDiscipline(): Promise<DisciplineAbsenceRow[]> {
  return api.get<DisciplineAbsenceRow[]>('/students/me/faltas-por-disciplina')
}
