import { EventsPanel } from "../../components/EventsPanel/EventsPanel";
import { BackButton } from "../../components/BackButton/BackButton";
import { PageHeader } from "../../components/ui";

export function Events() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Eventos" back={<BackButton to="/" />} />
      <div className="page-canvas flex-1">
        <EventsPanel showPast />
      </div>
    </div>
  );
}
