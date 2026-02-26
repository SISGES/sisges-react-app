import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { IoClose } from 'react-icons/io5'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getClassById,
  searchStudents,
  searchTeachers,
  getDisciplines,
  addStudentToClass,
  addTeacherToClass,
  addDisciplineToClass,
  removeStudentFromClass,
  removeTeacherFromClass,
  removeDisciplineFromClass,
  createDiscipline,
} from '../../services/userService'
import { ApiError } from '../../services/api'
import type {
  ClassDetailResponse,
  UserSimple,
  StudentSearchResponse,
  TeacherSearchResponse,
  DisciplineResponse,
  DisciplineSimple,
} from '../../types/auth'
import './EditClass.css'

export function EditClass() {
  const { id } = useParams<{ id: string }>()
  const classId = id ? parseInt(id, 10) : null

  const [schoolClass, setSchoolClass] = useState<ClassDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [allStudents, setAllStudents] = useState<StudentSearchResponse[]>([])
  const [allTeachers, setAllTeachers] = useState<TeacherSearchResponse[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<
    | { type: 'student' | 'teacher'; person: UserSimple }
    | { type: 'discipline'; discipline: DisciplineSimple }
    | null
  >(null)
  const [allDisciplines, setAllDisciplines] = useState<DisciplineResponse[]>([])
  const [showCreateDisciplineModal, setShowCreateDisciplineModal] = useState(false)
  const [newDisciplineName, setNewDisciplineName] = useState('')
  const [newDisciplineDescription, setNewDisciplineDescription] = useState('')

  const fetchClass = useCallback(async () => {
    if (!classId || isNaN(classId)) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getClassById(classId)
      setSchoolClass(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar turma.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  const fetchStudentsTeachersDisciplines = useCallback(async () => {
    try {
      const [students, teachers, disciplines] = await Promise.all([
        searchStudents(),
        searchTeachers(),
        getDisciplines(),
      ])
      setAllStudents(students)
      setAllTeachers(teachers)
      setAllDisciplines(disciplines)
    } catch {
      // Ignore - we'll still show the class data
    }
  }, [])

  useEffect(() => {
    fetchClass()
    fetchStudentsTeachersDisciplines()
  }, [fetchClass, fetchStudentsTeachersDisciplines])

  const openRemoveStudentModal = (student: UserSimple) => {
    setConfirmModal({ type: 'student', person: student })
  }

  const openRemoveTeacherModal = (teacher: UserSimple) => {
    setConfirmModal({ type: 'teacher', person: teacher })
  }

  const openRemoveDisciplineModal = (discipline: DisciplineSimple) => {
    setConfirmModal({ type: 'discipline', discipline })
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const handleConfirmUnlink = async () => {
    if (!classId || !confirmModal) return
    if (confirmModal.type === 'discipline') {
      const { discipline } = confirmModal
      setActionLoading(`remove-discipline-${discipline.id}`)
      closeConfirmModal()
      try {
        const updated = await removeDisciplineFromClass(classId, discipline.id)
        setSchoolClass(updated)
      } catch (err) {
        if (err instanceof ApiError) alert(err.message)
        else if (err instanceof Error) alert(err.message)
      } finally {
        setActionLoading(null)
      }
      return
    }
    const { type, person } = confirmModal
    setActionLoading(type === 'student' ? `remove-student-${person.id}` : `remove-teacher-${person.id}`)
    closeConfirmModal()
    try {
      const updated =
        type === 'student'
          ? await removeStudentFromClass(classId, person.id)
          : await removeTeacherFromClass(classId, person.id)
      setSchoolClass(updated)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
      else if (err instanceof Error) alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveStudent = (student: UserSimple) => {
    openRemoveStudentModal(student)
  }

  const handleRemoveTeacher = (teacher: UserSimple) => {
    openRemoveTeacherModal(teacher)
  }

  const handleRemoveDiscipline = (discipline: DisciplineSimple) => {
    openRemoveDisciplineModal(discipline)
  }

  const handleAddDiscipline = async () => {
    if (!classId || !selectedDisciplineId) return
    const disciplineId = parseInt(selectedDisciplineId, 10)
    if (isNaN(disciplineId)) return
    setActionLoading('add-discipline')
    try {
      const updated = await addDisciplineToClass(classId, disciplineId)
      setSchoolClass(updated)
      setSelectedDisciplineId('')
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
      else if (err instanceof Error) alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateDiscipline = async () => {
    if (!newDisciplineName.trim()) return
    setActionLoading('create-discipline')
    try {
      const created = await createDiscipline({
        name: newDisciplineName.trim(),
        description: newDisciplineDescription.trim() || undefined,
      })
      setAllDisciplines((prev) => [...prev, created])
      setNewDisciplineName('')
      setNewDisciplineDescription('')
      setShowCreateDisciplineModal(false)
      const updated = await addDisciplineToClass(classId!, created.id)
      setSchoolClass(updated)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
      else if (err instanceof Error) alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddStudent = async () => {
    if (!classId || !selectedStudentId) return
    const studentId = parseInt(selectedStudentId, 10)
    if (isNaN(studentId)) return
    setActionLoading('add-student')
    try {
      const updated = await addStudentToClass(classId, studentId)
      setSchoolClass(updated)
      setSelectedStudentId('')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      } else if (err instanceof Error) {
        alert(err.message)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddTeacher = async () => {
    if (!classId || !selectedTeacherId) return
    const teacherId = parseInt(selectedTeacherId, 10)
    if (isNaN(teacherId)) return
    setActionLoading('add-teacher')
    try {
      const updated = await addTeacherToClass(classId, teacherId)
      setSchoolClass(updated)
      setSelectedTeacherId('')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      } else if (err instanceof Error) {
        alert(err.message)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const disciplinesInClass = schoolClass?.disciplines ?? []
  const disciplineIdsInClass = new Set(disciplinesInClass.map((d) => d.id))
  const studentIdsInClass = new Set(schoolClass?.students.map((s) => s.id) ?? [])
  const teacherIdsInClass = new Set(schoolClass?.teachers.map((t) => t.id) ?? [])
  const availableStudents = allStudents.filter((s) => !studentIdsInClass.has(s.id))
  const availableTeachers = allTeachers.filter((t) => !teacherIdsInClass.has(t.id))
  const availableDisciplines = allDisciplines.filter((d) => !disciplineIdsInClass.has(d.id))

  if (!classId || isNaN(classId)) {
    return (
      <div className="edit-class-container">
        <div className="edit-class-error">ID da turma inválido.</div>
      </div>
    )
  }

  return (
    <div className="edit-class-container">
      <header className="edit-class-header">
        <div className="edit-class-header-content">
          <BackButton to="/admin/classes" />
          <h1>Editar Turma</h1>
        </div>
      </header>

      <div className="edit-class-content">
        {isLoading ? (
          <div className="edit-class-loading">
            <div className="loading-spinner-sm"></div>
            <span>Carregando...</span>
          </div>
        ) : error ? (
          <div className="edit-class-error">
            <p>{error}</p>
            <button onClick={fetchClass} className="btn-retry">
              Tentar novamente
            </button>
          </div>
        ) : schoolClass ? (
          <>
            <div className="edit-class-info">
              <h2>{schoolClass.name}</h2>
              <p className="text-secondary">Série: {schoolClass.academicYear}</p>
            </div>

            <div className="edit-class-sections">
              {/* Students section */}
              <div className="edit-class-card">
                <div className="edit-class-card-header">
                  <h3>Alunos ({schoolClass.students.length})</h3>
                </div>
                <div className="edit-class-card-body">
                  {schoolClass.students.length === 0 ? (
                    <p className="edit-class-empty">Nenhum aluno vinculado.</p>
                  ) : (
                    <ul className="edit-class-list">
                      {schoolClass.students.map((s) => (
                        <li key={s.id} className="edit-class-list-item">
                          <span>
                            {s.name} <span className="text-muted">({s.email})</span>
                          </span>
                          <button
                            onClick={() => handleRemoveStudent(s)}
                            className="btn-unlink"
                            disabled={!!actionLoading}
                            title="Desvincular da turma"
                          >
                            {actionLoading === `remove-student-${s.id}` ? '...' : 'Desvincular'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="edit-class-add">
                    <label className="form-label">Vincular novo aluno</label>
                    <div className="edit-class-add-row">
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="form-select"
                        disabled={!!actionLoading}
                      >
                        <option value="">Selecione um aluno</option>
                        {availableStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.email})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddStudent}
                        className="btn-link"
                        disabled={!selectedStudentId || !!actionLoading}
                      >
                        {actionLoading === 'add-student' ? '...' : 'Vincular'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teachers section */}
              <div className="edit-class-card">
                <div className="edit-class-card-header">
                  <h3>Professores ({schoolClass.teachers.length})</h3>
                </div>
                <div className="edit-class-card-body">
                  {schoolClass.teachers.length === 0 ? (
                    <p className="edit-class-empty">Nenhum professor vinculado.</p>
                  ) : (
                    <ul className="edit-class-list">
                      {schoolClass.teachers.map((t) => (
                        <li key={t.id} className="edit-class-list-item">
                          <span>
                            {t.name} <span className="text-muted">({t.email})</span>
                          </span>
                          <button
                            onClick={() => handleRemoveTeacher(t)}
                            className="btn-unlink"
                            disabled={!!actionLoading}
                            title="Desvincular da turma"
                          >
                            {actionLoading === `remove-teacher-${t.id}` ? '...' : 'Desvincular'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="edit-class-add">
                    <label className="form-label">Vincular novo professor</label>
                    <div className="edit-class-add-row">
                      <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="form-select"
                        disabled={!!actionLoading}
                      >
                        <option value="">Selecione um professor</option>
                        {availableTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.email})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddTeacher}
                        className="btn-link"
                        disabled={!selectedTeacherId || !!actionLoading}
                      >
                        {actionLoading === 'add-teacher' ? '...' : 'Vincular'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disciplines section */}
              <div className="edit-class-card edit-class-card-full">
                <div className="edit-class-card-header">
                  <h3>Disciplinas ({disciplinesInClass.length})</h3>
                  <button
                    onClick={() => setShowCreateDisciplineModal(true)}
                    className="btn-link btn-create-discipline"
                    disabled={!!actionLoading}
                  >
                    + Nova Disciplina
                  </button>
                </div>
                <div className="edit-class-card-body">
                  {disciplinesInClass.length === 0 ? (
                    <p className="edit-class-empty">Nenhuma disciplina vinculada.</p>
                  ) : (
                    <ul className="edit-class-list">
                      {disciplinesInClass.map((d) => (
                        <li key={d.id} className="edit-class-list-item">
                          <span>{d.name}</span>
                          <button
                            onClick={() => handleRemoveDiscipline(d)}
                            className="btn-unlink"
                            disabled={!!actionLoading}
                            title="Remover da turma"
                          >
                            {actionLoading === `remove-discipline-${d.id}` ? '...' : 'Remover'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="edit-class-add">
                    <label className="form-label">Vincular disciplina existente</label>
                    <div className="edit-class-add-row">
                      <select
                        value={selectedDisciplineId}
                        onChange={(e) => setSelectedDisciplineId(e.target.value)}
                        className="form-select"
                        disabled={!!actionLoading}
                      >
                        <option value="">Selecione uma disciplina</option>
                        {availableDisciplines.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddDiscipline}
                        className="btn-link"
                        disabled={!selectedDisciplineId || !!actionLoading}
                      >
                        {actionLoading === 'add-discipline' ? '...' : 'Vincular'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {confirmModal && (
        <div className="confirm-modal-overlay" onClick={closeConfirmModal}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmar desvinculação</h3>
              <button onClick={closeConfirmModal} className="confirm-modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>
                {confirmModal.type === 'discipline' ? (
                  <>
                    Remover a disciplina <strong>{confirmModal.discipline.name}</strong> da turma?
                  </>
                ) : (
                  <>
                    Desvincular {confirmModal.type === 'student' ? 'o aluno' : 'o professor'}{' '}
                    <strong>{confirmModal.person.name}</strong> da turma?
                  </>
                )}
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button onClick={closeConfirmModal} className="btn-secondary" disabled={!!actionLoading}>
                Cancelar
              </button>
              <button onClick={handleConfirmUnlink} className="btn-danger" disabled={!!actionLoading}>
                {actionLoading ? '...' : confirmModal?.type === 'discipline' ? 'Remover' : 'Desvincular'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateDisciplineModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowCreateDisciplineModal(false)}>
          <div className="confirm-modal-content create-discipline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Nova Disciplina</h3>
              <button onClick={() => setShowCreateDisciplineModal(false)} className="confirm-modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <div className="confirm-modal-body">
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
                  type="text"
                  value={newDisciplineName}
                  onChange={(e) => setNewDisciplineName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Matemática"
                  maxLength={150}
                  disabled={!!actionLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  value={newDisciplineDescription}
                  onChange={(e) => setNewDisciplineDescription(e.target.value)}
                  className="form-input form-textarea"
                  placeholder="Descrição opcional"
                  maxLength={5000}
                  rows={3}
                  disabled={!!actionLoading}
                />
              </div>
            </div>
            <div className="confirm-modal-actions">
              <button
                onClick={() => setShowCreateDisciplineModal(false)}
                className="btn-secondary"
                disabled={!!actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDiscipline}
                className="btn-link"
                disabled={!newDisciplineName.trim() || !!actionLoading}
              >
                {actionLoading === 'create-discipline' ? 'Criando...' : 'Criar e vincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
