import { BackButton } from '../../components/BackButton/BackButton'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import { PageHeader } from '../../components/ui'

export function StudentMyClass() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Minha Turma" back={<BackButton to="/" />} />
      <div className="flex-1 p-6">
        <StudentHomeSection variant="class" />
      </div>
    </div>
  )
}
