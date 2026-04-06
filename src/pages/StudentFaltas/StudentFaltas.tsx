import { BackButton } from '../../components/BackButton/BackButton'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import '../StudentPortalPage.css'

export function StudentFaltas() {
  return (
    <div className="student-portal-container">
      <header className="student-portal-header">
        <div className="student-portal-header-content">
          <BackButton to="/" />
          <h1>Faltas por disciplina</h1>
        </div>
      </header>
      <div className="student-portal-content">
        <StudentHomeSection variant="absences" />
      </div>
    </div>
  )
}
