import { AnnouncementFeed } from '../../components/AnnouncementFeed/AnnouncementFeed'
import { StudentHomeSection } from '../../components/StudentHomeSection/StudentHomeSection'
import { useAuth } from '../../contexts/AuthContext'
import './Home.css'

export function Home() {
  const { user } = useAuth()

  return (
    <div className="home-container">
      <div className="home-timeline">
        <aside className="home-rail home-rail-left" />
        <main className="home-main">
          <div className="home-feed-primary">
            <AnnouncementFeed />
          </div>
          {user?.role === 'STUDENT' && (
            <div className="home-student-secondary">
              <StudentHomeSection />
            </div>
          )}
        </main>
        <aside className="home-rail home-rail-right" />
      </div>
    </div>
  )
}
