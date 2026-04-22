import { BackButton } from '../../components/BackButton/BackButton'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import { PageHeader } from '../../components/ui'

export function StudentFaltas() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Faltas por Disciplina" back={<BackButton to="/" />} />
      <div className="flex-1 p-6">
        <StudentHomeSection variant="absences" />
      </div>
    </div>
  )
}
