import { Fragment, useEffect, useState, useRef } from "react";
import { FiPlus, FiCheck, FiClock } from "react-icons/fi";
import {
  PageHeader,
  Button,
  FormField,
  Select,
  Alert,
} from "../../components/ui";
import { searchClasses, getClassById } from "../../services/userService";
import {
  getSchedule,
  saveSchedule,
  LESSON_TIMES,
  WEEKDAYS,
  type Schedule,
} from "../../services/scheduleService";
import { useToast } from "../../contexts/ToastContext";

export function Timetable() {
  const { showToast } = useToast();
  const editor = useRef<HTMLElement>(null);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [classId, setClassId] = useState("");
  const [disciplines, setDisciplines] = useState<
    { id: number; name: string }[]
  >([]);
  const [schedule, setSchedule] = useState<Schedule>({
    revision: 0,
    slots: [],
  });
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [day, setDay] = useState(1);
  const [selected, setSelected] = useState<{
    weekday: number;
    slot: number;
  } | null>(null);
  useEffect(() => {
    let active = true;
    searchClasses()
      .then((data) => {
        if (active) {
          setClasses(data);
          setClassId(data[0]?.id.toString() ?? "");
          if (!data.length) setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível carregar as turmas.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    if (!classId) return;
    let active = true;
    setLoading(true);
    setError("");
    setSelected(null);
    Promise.all([getSchedule(Number(classId)), getClassById(Number(classId))])
      .then(([data, detail]) => {
        if (active) {
          setSchedule(data);
          setDisciplines(detail.disciplines ?? []);
          setDirty(false);
        }
      })
      .catch(() => {
        if (active)
          setError("Não foi possível carregar a grade. Tente novamente.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [classId, retry]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  useEffect(() => {
    if (selected && window.matchMedia("(max-width: 1279px)").matches) {
      editor.current?.scrollIntoView({ block: "center", behavior: "instant" });
      editor.current?.focus({ preventScroll: true });
    }
  }, [selected]);
  async function save() {
    setSaving(true);
    try {
      setSchedule(await saveSchedule(Number(classId), schedule));
      setDirty(false);
      showToast("Grade salva com sucesso.", "success");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Erro ao salvar grade.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }
  function assign(value: string) {
    if (!selected) return;
    setSchedule((prev) => ({
      ...prev,
      slots: [
        ...prev.slots.filter(
          (s) => s.weekday !== selected.weekday || s.slot !== selected.slot,
        ),
        ...(value ? [{ ...selected, disciplineId: Number(value) }] : []),
      ],
    }));
    setDirty(true);
  }
  return (
    <div className="flex flex-1 flex-col min-w-0">
      <PageHeader title="Grade horária" />
      <div className="p-4 pb-24 sm:p-6 sm:pb-24 space-y-5">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Organize a semana de cada turma. Clique em um horário para definir a
          disciplina.
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-full sm:w-72">
            <FormField label="Turma">
              <Select
                aria-label="Turma"
                value={classId}
                disabled={saving}
                onChange={(e) => {
                  if (
                    dirty &&
                    !window.confirm("Descartar alterações não salvas?")
                  )
                    return;
                  setDirty(false);
                  setClassId(e.target.value);
                }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-sm text-[var(--color-text-secondary)]"
              aria-live="polite"
            >
              {dirty
                ? "Alterações não salvas"
                : `${schedule.slots.length} de 25 horários preenchidos`}
            </span>
            <Button
              onClick={save}
              loading={saving}
              disabled={loading || !!error || !classId || !dirty}
            >
              Salvar grade
            </Button>
          </div>
        </div>
        {error ? (
          <Alert type="error">
            {error}{" "}
            <button
              onClick={() => setRetry((x) => x + 1)}
              className="underline"
            >
              Tentar novamente
            </button>
          </Alert>
        ) : loading ? (
          <p role="status">Carregando grade...</p>
        ) : !classId ? (
          <p>Nenhuma turma cadastrada.</p>
        ) : (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section
              className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
              aria-label="Grade semanal"
            >
              <div className="p-4 md:hidden">
                <FormField label="Dia da semana">
                  <Select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                  >
                    {WEEKDAYS.map((d, i) => (
                      <option key={d} value={i + 1}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <div className="hidden md:grid grid-cols-[90px_repeat(5,minmax(0,1fr))] border-b border-[var(--color-border)] text-sm font-semibold">
                <div className="p-3">Horário</div>
                {WEEKDAYS.map((d) => (
                  <div className="p-3" key={d}>
                    {d}
                  </div>
                ))}
              </div>
              {LESSON_TIMES.map(([start, end], slot) => (
                <Fragment key={start}>
                  {slot === 3 && (
                    <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-secondary)] bg-[var(--color-background)]">
                      <FiClock aria-hidden />
                      09:30 – 09:45 · Intervalo
                    </div>
                  )}
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] md:grid-cols-[90px_repeat(5,minmax(0,1fr))] border-b border-[var(--color-border)]">
                    <div className="p-3 text-xs text-[var(--color-text-secondary)] flex flex-col gap-1">
                      <span>{start}</span>
                      <span>{end}</span>
                    </div>
                    {WEEKDAYS.map((d, i) => {
                      const entry = schedule.slots.find(
                        (s) => s.weekday === i + 1 && s.slot === slot,
                      );
                      const active =
                        selected?.weekday === i + 1 && selected.slot === slot;
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={saving}
                          aria-label={`${d}, ${start} – ${end}: ${disciplines.find((x) => x.id === entry?.disciplineId)?.name ?? "Adicionar disciplina"}`}
                          aria-pressed={active}
                          onClick={() => setSelected({ weekday: i + 1, slot })}
                          className={`${day === i + 1 ? "flex" : "hidden"} md:flex m-1 min-h-20 min-w-0 flex-col items-start justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${active ? "border-[var(--color-primary)] bg-[var(--color-background)]" : "border-transparent hover:bg-[var(--color-background)]"} ${entry ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
                        >
                          <span className="break-words w-full">
                            {entry
                              ? (disciplines.find(
                                  (x) => x.id === entry.disciplineId,
                                )?.name ?? "Disciplina desvinculada")
                              : "Adicionar"}
                          </span>
                          {entry ? (
                            <FiCheck
                              aria-hidden
                              className="text-[var(--color-primary)]"
                            />
                          ) : (
                            <FiPlus aria-hidden />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Fragment>
              ))}
              <p className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                11:25 – 11:50 · Sem aula no modelo de 50 minutos
              </p>
            </section>
            <aside
              ref={editor}
              tabIndex={-1}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4"
              aria-label="Editar horário"
            >
              <h2 className="font-semibold">
                {selected
                  ? `${WEEKDAYS[selected.weekday - 1]} · ${LESSON_TIMES[selected.slot][0]}`
                  : "Selecione um horário"}
              </h2>
              {selected ? (
                <>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {LESSON_TIMES[selected.slot].join(" – ")} · 50 minutos
                  </p>
                  <FormField label="Disciplina">
                    <Select
                      aria-label="Disciplina do horário"
                      disabled={saving}
                      value={
                        schedule.slots.find(
                          (s) =>
                            s.weekday === selected.weekday &&
                            s.slot === selected.slot,
                        )?.disciplineId ?? ""
                      }
                      onChange={(e) => assign(e.target.value)}
                    >
                      <option value="">Sem disciplina</option>
                      {disciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  {!disciplines.length && (
                    <p className="text-sm">
                      Vincule disciplinas à turma para preencher a grade.
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    A alteração será aplicada ao clicar em Salvar grade.
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Escolha uma célula da semana para adicionar, trocar ou remover
                  uma disciplina.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
