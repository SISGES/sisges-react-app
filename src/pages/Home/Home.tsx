import { AnnouncementFeed } from '../../components/AnnouncementFeed/AnnouncementFeed'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import { useAuth } from '../../contexts/AuthContext'

export function Home() {
  const { user } = useAuth()
  const isStudent = user?.role?.toUpperCase() === 'STUDENT'

  if (isStudent) {
    return (
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <AnnouncementFeed />
        </div>
        <aside className="flex-shrink-0 lg:w-[320px] xl:w-[360px] overflow-y-auto">
          <div className="p-6">
            <StudentHomeSection variant="materials" />
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AnnouncementFeed />
    </div>
  )
}
