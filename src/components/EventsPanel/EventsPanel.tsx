import { useEffect, useState } from "react";
import { FiCalendar, FiPlus, FiTrash2 } from "react-icons/fi";
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

export function EventsPanel({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const dialog = useDialog();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [classes, setClasses] = useState<ClassSearchResponse[]>([]);
  const [selected, setSelected] = useState<SchoolEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventAt: "",
    audience: "ALL" as EventAudience,
    classId: "",
  });
  const load = () => void getEvents().then(setEvents);
  useEffect(load, []);
  useEffect(() => {
    if (user?.role === "ADMIN") void searchClasses().then(setClasses);
  }, [user?.role]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvent({
      ...form,
      classId: form.audience === "CLASS" ? Number(form.classId) : undefined,
    });
    setCreating(false);
    setForm({
      title: "",
      description: "",
      eventAt: "",
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
              Próximos eventos
            </h2>
          </div>
          {user?.role === "ADMIN" && (
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              icon={<FiPlus />}
            >
              Criar
            </Button>
          )}
        </div>
        <div className="px-5">
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Nenhum evento agendado.
            </p>
          ) : (
            events.map((event) => {
              const date = new Date(event.eventAt);
              return (
                <button
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="flex w-full cursor-pointer gap-4 border-x-0 border-t-0 border-b border-[var(--color-border)] bg-transparent py-5 text-left last:border-b-0"
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
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {date.toLocaleString("pt-BR")}
                      {event.className ? ` · ${event.className}` : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
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
          <div className="space-y-3 text-sm text-[var(--color-text-primary)]">
            <h3 className="font-bold">{selected.title}</h3>
            <p>{selected.description || "Sem descrição."}</p>
            <p>{new Date(selected.eventAt).toLocaleString("pt-BR")}</p>
            {selected.className && <p>Turma: {selected.className}</p>}
            {user?.role === "ADMIN" && (
              <>
                <p>Criado por: {selected.createdByName}</p>
                <p>
                  Criado em:{" "}
                  {new Date(selected.createdAt).toLocaleString("pt-BR")}
                </p>
              </>
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
          <Input
            type="datetime-local"
            required
            value={form.eventAt}
            onChange={(e) => setForm({ ...form, eventAt: e.target.value })}
          />
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
