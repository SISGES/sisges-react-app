import { AnnouncementFeed } from '../../components/AnnouncementFeed/AnnouncementFeed'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import { useAuth } from '../../contexts/AuthContext'
import './Home.css'

export function Home() {
  const { user } = useAuth()

  return (
    <div className="home-container">
      <main className="home-main">
        <div className="home-feed-primary">
          <AnnouncementFeed />
        </div>
        {user?.role?.toUpperCase() === 'STUDENT' && (
          <div className="home-student-secondary">
            <StudentHomeSection variant="materials" />
          </div>
        )}
      </main>
    </div>
  )
}
