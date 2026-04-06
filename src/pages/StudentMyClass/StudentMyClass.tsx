import { BackButton } from '../../components/BackButton/BackButton'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import '../StudentPortalPage.css'

export function StudentMyClass() {
  return (
    <div className="student-portal-container">
      <header className="student-portal-header">
        <div className="student-portal-header-content">
          <BackButton to="/" />
          <h1>Minha turma</h1>
        </div>
      </header>
      <div className="student-portal-content">
        <StudentHomeSection variant="class" />
      </div>
    </div>
  )
}
