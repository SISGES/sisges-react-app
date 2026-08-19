import { AnnouncementFeed } from "../../components/AnnouncementFeed/AnnouncementFeed";
import { StudentHomeSection } from "../../components/StudentHomeSection/StudentHomeSection";
import { useAuth } from "../../contexts/AuthContext";
import { EventsPanel } from "../../components/EventsPanel/EventsPanel";

export function Home() {
  const { user } = useAuth();
  const isStudent = user?.role?.toUpperCase() === "STUDENT";

  if (isStudent) {
    return (
      <div className="page-canvas grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <AnnouncementFeed />
        </div>
        <aside className="flex h-fit flex-col gap-6">
          <div className="surface-panel p-5">
            <StudentHomeSection variant="materials" />
          </div>
          <EventsPanel compact />
        </aside>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AnnouncementFeed dashboard />
    </div>
  );
}
