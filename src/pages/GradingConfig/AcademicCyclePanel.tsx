import { useEffect, useState, type FormEvent } from "react";
import { Button, DatePicker, Input, Modal } from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";
import {
  endTrimester,
  endYear,
  getAcademicCycle,
  getPendingReleases,
  startAcademicYear,
  type AcademicCycle,
} from "../../services/academicCycleService";
import {
  ACADEMIC_CYCLE_STATUS_LABELS,
  brDateToIso,
  formatIsoDatePtBr,
} from "../../utils/brDate";

type Action = "start" | "trimester" | "year";
const titles: Record<Action, string> = {
  start: "Iniciar ano letivo",
  trimester: "Encerrar trimestre",
  year: "Encerrar ano letivo",
};
const labelStyle =
  "block mb-2 text-sm font-medium text-[var(--color-text-primary)]";

interface PanelProps {
  cycle: AcademicCycle | null;
  onChange: (cycle: AcademicCycle | null) => void;
  configSaving: boolean;
  configReady: boolean;
}

export function AcademicCyclePanel({
  cycle,
  onChange,
  configSaving,
  configReady,
}: PanelProps) {
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    getAcademicCycle()
      .then((result) => {
        if (active) onChange(result);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível consultar o ciclo letivo.",
          );
      });
    return () => {
      active = false;
    };
  }, [onChange, refresh]);

  function reload() {
    setError("");
    onChange(null);
    setRefresh((value) => value + 1);
  }

  return (
    <section
      aria-labelledby="academic-cycle-title"
      className="mx-auto mb-6 flex w-full max-w-6xl flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <h2
        id="academic-cycle-title"
        className="text-xl font-semibold text-[var(--color-text-primary)]"
      >
        Ciclo letivo
      </h2>
      {error && <p role="alert">{error}</p>}
      {cycle ? (
        <>
          <div
            className="text-sm text-[var(--color-text-secondary)]"
            aria-live="polite"
          >
            <p className="font-semibold text-[var(--color-text-primary)]">
              {ACADEMIC_CYCLE_STATUS_LABELS[cycle.status]}
              {cycle.status === "IN_PROGRESS" &&
                ` · ${cycle.currentTrimester}º trimestre`}
            </p>
            {cycle.yearStartDate && (
              <p className="mt-1">
                Período previsto de {formatIsoDatePtBr(cycle.yearStartDate)} a{" "}
                {formatIsoDatePtBr(cycle.yearEndDate)}.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {cycle.status === "IN_PROGRESS" ? (
              <>
                {cycle.currentTrimester < 3 && (
                  <Button
                    disabled={configSaving}
                    onClick={() => setAction("trimester")}
                  >
                    {titles.trimester}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  disabled={configSaving}
                  onClick={() => setAction("year")}
                >
                  {titles.year}
                </Button>
              </>
            ) : (
              <Button
                disabled={configSaving || !configReady}
                onClick={() => setAction("start")}
              >
                {titles.start}
              </Button>
            )}
            <Button variant="ghost" disabled={configSaving} onClick={reload}>
              Atualizar ciclo
            </Button>
          </div>
          {cycle.status !== "IN_PROGRESS" && !configReady && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Carregue e salve as regras de avaliação antes de iniciar o ano.
            </p>
          )}
          {action && (
            <CycleAction
              cycle={cycle}
              action={action}
              onDismiss={() => setAction(null)}
              onSaved={(updated) => {
                onChange(updated);
                setAction(null);
                showToast("Ciclo letivo atualizado.", "success");
              }}
            />
          )}
        </>
      ) : error ? (
        <div>
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <p role="status">Consultando o ciclo letivo…</p>
      )}
    </section>
  );
}

interface ActionProps {
  cycle: AcademicCycle;
  action: Action;
  onDismiss: () => void;
  onSaved: (cycle: AcademicCycle) => void;
}

function CycleAction({ cycle, action, onDismiss, onSaved }: ActionProps) {
  const [endDate, setEndDate] = useState("");
  const [password, setPassword] = useState("");
  const [teachers, setTeachers] = useState<string[] | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const starting = action === "start";
  const isoEnd = brDateToIso(endDate);
  const todayInSchool = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  const validDate = isoEnd > brDateToIso(todayInSchool);

  useEffect(() => {
    if (action === "start") return;
    let active = true;
    getPendingReleases(
      action === "trimester" ? cycle.currentTrimester : undefined,
    )
      .then((result) => {
        if (active) setTeachers(result.teachers);
      })
      .catch((err) => {
        if (active)
          setLookupError(
            err instanceof Error
              ? err.message
              : "Não foi possível consultar as pendências.",
          );
      });
    return () => {
      active = false;
    };
  }, [action, cycle.currentTrimester, refresh]);

  const ready = starting
    ? validDate
    : teachers?.length === 0 && !!password.trim();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || !ready) return;
    setSaving(true);
    setError("");
    try {
      const version = {
        expectedCycleId: cycle.id,
        expectedTrimester: cycle.currentTrimester,
      };
      const updated = starting
        ? await startAcademicYear(isoEnd, cycle.id)
        : action === "trimester"
          ? await endTrimester(password, version)
          : await endYear(password, version);
      onSaved(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o ciclo letivo.",
      );
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => {
        if (!saving) onDismiss();
      }}
      title={titles[action]}
      maxWidth="max-w-md"
    >
      <form
        onSubmit={submit}
        className="flex flex-col gap-4 text-sm text-[var(--color-text-primary)]"
      >
        {starting ? (
          <>
            <p>
              O 1º trimestre começa hoje. Confira as regras de avaliação antes
              de iniciar o ano, pois elas ficarão bloqueadas.
            </p>
            <div>
              <label htmlFor="cycle-end-date" className={labelStyle}>
                Data de término prevista
              </label>
              <DatePicker
                aria-label="Data de término prevista"
                id="cycle-end-date"
                value={endDate}
                onValueChange={setEndDate}
                disabled={saving}
                required
              />
              {endDate.length === 10 && !validDate && (
                <p role="alert" className="mt-1">
                  Informe uma data válida posterior a hoje.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <p>
              {action === "year"
                ? "O encerramento calcula os resultados finais e transfere os alunos aprovados para as turmas de destino."
                : `O encerramento do ${cycle.currentTrimester}º trimestre inicia o ${cycle.currentTrimester + 1}º trimestre.`}
            </p>
            <div aria-live="polite">
              {lookupError ? (
                <p role="alert">
                  Falha ao verificar as liberações de notas. {lookupError}
                </p>
              ) : teachers === null ? (
                <p>Consultando liberações de notas…</p>
              ) : teachers.length ? (
                <>
                  <p className="font-semibold">
                    Professores com notas pendentes de liberação
                  </p>
                  <ul className="ml-5 list-disc">
                    {teachers.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Nenhuma liberação de notas pendente.</p>
              )}
              {lookupError || teachers?.length ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => {
                    setTeachers(null);
                    setLookupError("");
                    setRefresh((n) => n + 1);
                  }}
                >
                  Atualizar pendências
                </Button>
              ) : null}
            </div>
            <div>
              <label htmlFor="cycle-password" className={labelStyle}>
                Senha do administrador
              </label>
              <Input
                id="cycle-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={saving || teachers?.length !== 0}
                required
              />
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="text-[var(--color-error)]">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onDismiss}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={starting ? "primary" : "danger"}
            disabled={!ready}
            loading={saving}
          >
            {titles[action]}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
