import { useEffect, useState } from "react";
import { FiCalendar, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useDialog } from "../../contexts/DialogContext";
import {
  createEvent,
  deleteEvent,
  getEvents,
} from "../../services/eventService";
import type { EventAudience, SchoolEvent } from "../../services/eventService";
import { searchClasses } from "../../services/userService";
import type { ClassSearchResponse } from "../../types/auth";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/FormField";
import { Pagination } from "../ui/Pagination";
import { brDateToIso, formatBrDateInput } from "../../utils/brDate";

function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function audienceLabel(event: SchoolEvent) {
  if (event.audience === "TEACHERS") return "Somente professores";
  if (event.audience === "CLASS") return event.className || "Turma específica";
  return "Toda a comunidade escolar";
}

export function EventsPanel({
  compact = false,
  showPast = false,
}: {
  compact?: boolean;
  showPast?: boolean;
}) {
  const { user } = useAuth();
  const dialog = useDialog();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const visibleEvents = events.slice((currentPage - 1) * 10, currentPage * 10);
  const [classes, setClasses] = useState<ClassSearchResponse[]>([]);
  const [selected, setSelected] = useState<SchoolEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    audience: "ALL" as EventAudience,
    classId: "",
  });
  const load = () => {
    void getEvents(showPast).then((items) => {
      setEvents(
        showPast
          ? items
          : items.filter((event) => new Date(event.eventAt).getTime() >= Date.now()),
      );
      setCurrentPage(1);
    });
  };
  useEffect(load, [showPast]);
  useEffect(() => {
    if (user?.role === "ADMIN") void searchClasses().then(setClasses);
  }, [user?.role]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = brDateToIso(form.date);
    if (!date || !form.time) return;
    await createEvent({
      title: form.title,
      description: form.description || undefined,
      eventAt: `${date}T${form.time}:00`,
      audience: form.audience,
      classId: form.audience === "CLASS" ? Number(form.classId) : undefined,
    });
    setCreating(false);
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      audience: "ALL",
      classId: "",
    });
    load();
  };
  const remove = async (id: number) => {
    if (!(await dialog.confirm("Excluir este evento?"))) return;
    await deleteEvent(id);
    setSelected(null);
    load();
  };
  return (
    <>
      <section
        className={
          compact
            ? "surface-panel overflow-hidden"
            : "surface-panel overflow-hidden"
        }
      >
        <div className="flex min-h-16 items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-[var(--color-primary)]" />
            <h2 className="font-bold text-[var(--color-text-primary)]">
              {showPast ? "Todos os eventos" : "Próximos eventos"}
            </h2>
          </div>
          {user?.role === "ADMIN" && (
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              aria-label="Criar evento"
              title="Criar evento"
              className="min-w-9 px-0"
            >
              +
            </Button>
          )}
        </div>
        <div className="px-5">
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Nenhum evento agendado.
            </p>
          ) : (
            visibleEvents.map((event) => {
              const date = new Date(event.eventAt);
              const isPast = date.getTime() < Date.now();
              return (
                <button
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className={[
                    "flex w-full cursor-pointer gap-4 border-x-0 border-t-0 border-b border-[var(--color-border)] bg-transparent py-5 text-left transition-all duration-150 hover:translate-x-1 hover:bg-[var(--color-surface-subtle)] focus-visible:translate-x-1 focus-visible:bg-[var(--color-surface-subtle)] last:border-b-0",
                    isPast ? "grayscale opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--color-surface-subtle)]">
                    <b>{date.getDate()}</b>
                    <span className="text-[0.65rem] font-bold text-[var(--color-primary)]">
                      {date
                        .toLocaleDateString("pt-BR", { month: "short" })
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {event.title}
                      {isPast && <span className="ml-2 text-xs font-medium">Encerrado</span>}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {formatEventDateTime(event.eventAt)}
                      {event.className ? ` · ${event.className}` : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
          <Pagination
            currentPage={currentPage}
            pageSize={10}
            totalItems={events.length}
            onPageChange={setCurrentPage}
            className="pb-5"
          />
        </div>
      </section>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes do evento"
        footer={
          user?.role === "ADMIN" && selected ? (
            <Button
              variant="danger"
              onClick={() => void remove(selected.id)}
              icon={<FiTrash2 />}
            >
              Excluir
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5 text-sm text-[var(--color-text-primary)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                Evento
              </p>
              <h3 className="mt-1 text-xl font-bold leading-tight">
                {selected.title}
              </h3>
            </div>
            <dl className="grid gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Data e horário
                </dt>
                <dd className="mt-1 font-medium">
                  {formatEventDateTime(selected.eventAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Público
                </dt>
                <dd className="mt-1 font-medium">{audienceLabel(selected)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Descrição
                </dt>
                <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-[var(--color-text-secondary)]">
                  {selected.description || "Sem descrição."}
                </dd>
              </div>
            </dl>
            {user?.role === "ADMIN" && (
              <dl className="grid gap-4 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Criado por
                  </dt>
                  <dd className="mt-1">{selected.createdByName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Criado em
                  </dt>
                  <dd className="mt-1">
                    {formatEventDateTime(selected.createdAt)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo evento"
        footer={
          <Button type="submit" form="event-form">
            Criar evento
          </Button>
        }
      >
        <form id="event-form" onSubmit={submit} className="flex flex-col gap-4">
          <Input
            placeholder="Título"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Data (dd/mm/aaaa)"
              required
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: formatBrDateInput(e.target.value) })
              }
            />
            <Input
              type="time"
              step="60"
              aria-label="Horário do evento"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <Select
            value={form.audience}
            onChange={(e) =>
              setForm({ ...form, audience: e.target.value as EventAudience })
            }
          >
            <option value="ALL">Todos</option>
            <option value="TEACHERS">Somente professores</option>
            <option value="CLASS">Uma turma</option>
          </Select>
          {form.audience === "CLASS" && (
            <Select
              required
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
            >
              <option value="">Selecione a turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </form>
      </Modal>
    </>
  );
}
