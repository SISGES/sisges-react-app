import { brDateToIso as dateBrToIso, getTodayBr } from "../../utils/brDate";
import { useToast } from "../../contexts/ToastContext";
import { TimePicker } from "../../components/ui/TimePicker";
import { DatePicker } from "../../components/ui/DatePicker";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  createAula,
  getTeacherMe,
  getClassById,
  searchAulas,
} from "../../services/userService";
import { ApiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { DisciplineSimple } from "../../types/auth";
import {
  PageHeader,
  Button,
  StateBlock,
  FormField,
  Select,
  Alert,
} from "../../components/ui";

function minsToTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}
function timeToMins(t: string): number {
  const parts = t.split(":");
  return parseInt(parts[0] || "0", 10) * 60 + parseInt(parts[1] || "0", 10);
}
function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToMins(s1) < timeToMins(e2) && timeToMins(s2) < timeToMins(e1);
}

interface TeacherDisciplineOption {
  discipline: DisciplineSimple;
  schoolClassIds: number[];
}

export function CreateAula() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const teacherId = isTeacher ? (user?.id ?? null) : null;

  const [disciplineOptions, setDisciplineOptions] = useState<
    TeacherDisciplineOption[]
  >([]);
  const [schoolClassOptions, setSchoolClassOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [disciplineId, setDisciplineId] = useState<number | "">("");
  const [schoolClassId, setSchoolClassId] = useState<number | "">("");
  const [startHour, setStartHour] = useState<number>(8);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(9);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startTime = minsToTime(startHour * 60 + startMinute);
  const endTime = minsToTime(endHour * 60 + endMinute);
  const isTimeValid = timeToMins(endTime) > timeToMins(startTime);
  const isDateValid = !!dateBrToIso(date);

  useEffect(() => {
    setTimeError(
      isTimeValid || !startTime || !endTime
        ? null
        : "O horário de fim deve ser maior que o de início.",
    );
  }, [
    startHour,
    startMinute,
    endHour,
    endMinute,
    isTimeValid,
    startTime,
    endTime,
  ]);

  const fetchOptions = useCallback(async () => {
    if (!teacherId) return;
    setIsLoadingOptions(true);
    setOptionsError(null);
    try {
      const teacher = await getTeacherMe();
      const classIds = teacher.classes?.map((c) => c.id) ?? [];
      const classDetails = await Promise.all(
        classIds.map((id) => getClassById(id).catch(() => null)),
      );
      const disciplineMap = new Map<number, number[]>();
      for (let i = 0; i < classDetails.length; i++) {
        const c = classDetails[i];
        if (!c?.disciplines) continue;
        const classId = classIds[i];
        for (const d of c.disciplines) {
          if (!disciplineMap.has(d.id)) disciplineMap.set(d.id, []);
          disciplineMap.get(d.id)!.push(classId);
        }
      }
      const options: TeacherDisciplineOption[] = [];
      const seen = new Set<number>();
      for (const c of classDetails) {
        if (!c?.disciplines) continue;
        for (const d of c.disciplines) {
          if (seen.has(d.id)) continue;
          seen.add(d.id);
          options.push({
            discipline: d,
            schoolClassIds: disciplineMap.get(d.id) ?? [],
          });
        }
      }
      setDisciplineOptions(options);
      if (options.length === 1 && options[0].schoolClassIds.length > 0) {
        setDisciplineId(options[0].discipline.id);
        const classNames = await Promise.all(
          options[0].schoolClassIds.map((id) =>
            getClassById(id).then((cc) => ({ id: cc.id, name: cc.name })),
          ),
        );
        setSchoolClassOptions(classNames);
        if (classNames.length === 1) setSchoolClassId(classNames[0].id);
      }
    } catch (err) {
      setOptionsError(
        err instanceof ApiError ? err.message : "Erro ao carregar opções.",
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (isTeacher) fetchOptions();
  }, [isTeacher, fetchOptions]);

  useEffect(() => {
    if (disciplineId === "") {
      setSchoolClassOptions([]);
      setSchoolClassId("");
      return;
    }
    const opt = disciplineOptions.find((o) => o.discipline.id === disciplineId);
    if (!opt) return;
    (async () => {
      const classes: { id: number; name: string }[] = [];
      for (const id of opt.schoolClassIds) {
        try {
          const c = await getClassById(id);
          classes.push({ id: c.id, name: c.name });
        } catch {
          void 0;
        }
      }
      setSchoolClassOptions(classes);
      setSchoolClassId(classes.length === 1 ? classes[0].id : "");
    })();
  }, [disciplineId, disciplineOptions]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      isSubmitting ||
      !disciplineId ||
      !schoolClassId ||
      !date ||
      !isTimeValid ||
      !isDateValid
    )
      return;
    const dateIso = dateBrToIso(date);
    if (!dateIso) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const existingAulas = await searchAulas({
        date: dateIso,
        schoolClassId: Number(schoolClassId),
      });
      if (
        (existingAulas ?? []).some((a) =>
          timesOverlap(startTime, endTime, a.startTime ?? "", a.endTime ?? ""),
        )
      ) {
        setSubmitError(
          "Já existe uma aula cadastrada nesta turma no mesmo dia com horário sobreposto.",
        );
        setIsSubmitting(false);
        return;
      }
      await createAula({
        date: dateIso,
        disciplineId: Number(disciplineId),
        classId: Number(schoolClassId),
        startTime,
        endTime,
      });
      showToast("Aula criada com sucesso.", "success");
      navigate("/aulas");
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erro ao criar aula.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Nova Aula" back={<BackButton to="/aulas" />} />

      <div className="flex-1 p-4 sm:p-6">
        {user?.role !== "TEACHER" ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Apenas professores podem criar aulas.
          </p>
        ) : (
          <StateBlock
            loading={isLoadingOptions}
            loadingText="Carregando opções..."
            error={
              optionsError ||
              (disciplineOptions.length === 0
                ? "Você não possui disciplinas ou turmas vinculadas."
                : null)
            }
            onRetry={fetchOptions}
          >
            <div className="mx-auto w-full max-w-5xl">
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Escolha a disciplina, a turma e quando a aula vai acontecer.
              </p>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)]">
                <form
                  onSubmit={handleSubmit}
                  className="flex min-w-0 flex-col gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
                >
                  {submitError && <Alert type="error">{submitError}</Alert>}

                  <FormField label="Disciplina" required>
                    <Select
                      aria-label="Disciplina"
                      value={disciplineId}
                      onChange={(e) =>
                        setDisciplineId(
                          e.target.value ? parseInt(e.target.value, 10) : "",
                        )
                      }
                      required
                      disabled={isSubmitting || disciplineOptions.length === 1}
                    >
                      <option value="">Selecione a disciplina</option>
                      {disciplineOptions.map((o) => (
                        <option key={o.discipline.id} value={o.discipline.id}>
                          {o.discipline.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Turma" required>
                    <Select
                      aria-label="Turma"
                      value={schoolClassId}
                      onChange={(e) =>
                        setSchoolClassId(
                          e.target.value ? parseInt(e.target.value, 10) : "",
                        )
                      }
                      required
                      disabled={
                        isSubmitting ||
                        schoolClassOptions.length === 0 ||
                        schoolClassOptions.length === 1
                      }
                    >
                      <option value="">Selecione a turma</option>
                      {schoolClassOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <div className="border-t border-[var(--color-border)] pt-5">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                      Data e horário
                    </h3>
                    <FormField label="Data" required>
                      <div className="flex items-center gap-3">
                        <DatePicker
                          aria-label="Data da aula"
                          value={date}
                          onValueChange={setDate}
                          required
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isSubmitting}
                          onClick={() => setDate(getTodayBr())}
                        >
                          Hoje
                        </Button>
                      </div>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Início · 24h" required>
                      <TimePicker
                        label="Início da aula"
                        value={startTime}
                        onValueChange={(time) => {
                          const [hour, minute] = time.split(":").map(Number);
                          setStartHour(hour);
                          setStartMinute(minute);
                        }}
                        required
                        disabled={isSubmitting}
                      />
                    </FormField>
                    <FormField label="Fim · 24h" required>
                      <TimePicker
                        label="Fim da aula"
                        value={endTime}
                        onValueChange={(time) => {
                          const [hour, minute] = time.split(":").map(Number);
                          setEndHour(hour);
                          setEndMinute(minute);
                        }}
                        required
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>
                  {timeError && <Alert type="error">{timeError}</Alert>}

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => navigate("/aulas")}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={
                        !disciplineId ||
                        !schoolClassId ||
                        !isTimeValid ||
                        !isDateValid
                      }
                    >
                      Criar Aula
                    </Button>
                  </div>
                </form>
                <aside
                  aria-label="Resumo da aula"
                  className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
                >
                  <h2 className="mb-5 text-base font-semibold text-[var(--color-text-primary)]">
                    Resumo da aula
                  </h2>
                  <dl className="flex flex-col gap-5 text-left">
                    {[
                      [
                        "Disciplina",
                        disciplineOptions.find(
                          (o) => o.discipline.id === disciplineId,
                        )?.discipline.name ?? "Selecione a disciplina",
                      ],
                      [
                        "Turma",
                        schoolClassOptions.find((c) => c.id === schoolClassId)
                          ?.name ?? "Selecione a turma",
                      ],
                      [
                        "Data",
                        isDateValid ? date : "Selecione uma data válida",
                      ],
                      ["Horário", `${startTime} – ${endTime}`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-[var(--color-text-secondary)]">
                          {label}
                        </dt>
                        <dd className="mt-1 break-words text-sm font-medium text-[var(--color-text-primary)]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p
                    aria-live="polite"
                    className={`mt-5 border-t border-[var(--color-border)] pt-4 text-sm ${isTimeValid ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
                  >
                    {isTimeValid
                      ? `${timeToMins(endTime) - timeToMins(startTime)} minutos de aula`
                      : "O fim deve ser depois do início."}
                  </p>
                </aside>
              </div>
            </div>
          </StateBlock>
        )}
      </div>
    </div>
  );
}
