import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiBookOpen, FiFile, FiUpload, FiX } from "react-icons/fi";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  PageHeader,
  Button,
  FormField,
  Select,
  Textarea,
  DatePicker,
  Alert,
} from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";
import { getTeacherMe } from "../../services/userService";
import {
  getLessonDay,
  saveLessonRecord,
  type DailyLesson,
  type LessonAttachment,
} from "../../services/scheduleService";
import { uploadFile, downloadPrivateFile } from "../../services/uploadService";
import { brDateToIso, getTodayBr } from "../../utils/brDate";

export function CreateAula() {
  const [params] = useSearchParams();
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [classId, setClassId] = useState(params.get("classId") ?? "");
  const [date, setDate] = useState(() => {
    const d = params.get("date");
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d)
      ? d.split("-").reverse().join("/")
      : getTodayBr();
  });
  const [lessons, setLessons] = useState<DailyLesson[]>([]);
  const [slot, setSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  const iso = brDateToIso(date);
  useEffect(() => {
    let active = true;
    setClassesError("");
    setClassesLoading(true);
    getTeacherMe()
      .then((t) => {
        if (active) {
          setClasses(t.classes ?? []);
          setClassId(
            (prev) =>
              prev || (t.classes?.length === 1 ? String(t.classes[0].id) : ""),
          );
          setClassesLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setClassesError("Não foi possível carregar suas turmas.");
          setClassesLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    setLessons([]);
    if (!classId || !iso) return;
    let active = true;
    setLoading(true);
    setError("");
    getLessonDay(Number(classId), iso)
      .then((data) => {
        if (active) {
          setLessons(data);
          setSlot((prev) =>
            data.some((l) => l.slot === prev)
              ? prev
              : (data.find((l) => l.slot === Number(params.get("slot")))
                  ?.slot ??
                data[0]?.slot ??
                null),
          );
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Não foi possível carregar o dia.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [classId, iso, revision, params]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function discard() {
    if (dirty && !window.confirm("Descartar o conteúdo ainda não salvo?"))
      return false;
    setDirty(false);
    return true;
  }
  const selected = lessons.find((l) => l.slot === slot);
  return (
    <div className="flex flex-1 min-w-0 flex-col">
      <PageHeader title="Registro de aulas" back={<BackButton to="/aulas" />} />
      <div className="mx-auto w-full max-w-6xl p-4 pb-24 sm:p-6 sm:pb-24 space-y-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Selecione o dia e a turma para registrar o conteúdo das suas aulas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <FormField label="Data da aula">
            <div className="flex gap-2">
              <DatePicker
                aria-label="Data da aula"
                value={date}
                disabled={busy}
                onValueChange={(v) => {
                  if (discard()) setDate(v);
                }}
              />
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  if (discard()) setDate(getTodayBr());
                }}
              >
                Hoje
              </Button>
            </div>
          </FormField>
          <FormField label="Turma">
            <Select
              aria-label="Turma"
              value={classId}
              disabled={busy}
              onChange={(e) => {
                if (discard()) setClassId(e.target.value);
              }}
            >
              <option value="">Selecione a turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        {classesLoading ? (
          <p role="status">Carregando turmas...</p>
        ) : classesError ? (
          <Alert type="error">
            {classesError}{" "}
            <button
              className="underline"
              onClick={() => setRetry((x) => x + 1)}
            >
              Tentar novamente
            </button>
          </Alert>
        ) : !classes.length ? (
          <Alert type="warning">Você não possui turmas vinculadas.</Alert>
        ) : !classId || !iso ? (
          <p className="text-[var(--color-text-secondary)]">
            Escolha uma turma e uma data válida.
          </p>
        ) : loading ? (
          <p role="status">Carregando aulas do dia...</p>
        ) : error ? (
          <Alert type="error">
            {error}{" "}
            <button
              className="underline"
              onClick={() => setRevision((x) => x + 1)}
            >
              Tentar novamente
            </button>
          </Alert>
        ) : !lessons.length ? (
          <section className="rounded-xl border border-dashed border-[var(--color-border)] p-8">
            <FiBookOpen
              className="mb-3 text-[var(--color-text-muted)]"
              size={24}
            />
            <h2 className="font-semibold">Nenhuma aula disponível neste dia</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Confira a data ou peça à administração para verificar a grade e
              suas disciplinas nesta turma.
            </p>
          </section>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <section aria-label="Aulas do dia" className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Suas aulas</h2>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {lessons.filter((l) => l.meetingId).length}/{lessons.length}{" "}
                  registradas
                </span>
              </div>
              {lessons.map((l) => (
                <button
                  key={l.slot}
                  disabled={busy}
                  aria-pressed={slot === l.slot}
                  onClick={() => {
                    if (l.slot !== slot && discard()) setSlot(l.slot);
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${slot === l.slot ? "border-[var(--color-primary)] bg-[var(--color-surface)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface)]"}`}
                >
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {l.startTime} – {l.endTime}
                  </span>
                  <span className="block my-2 font-semibold">
                    {l.disciplineName}
                  </span>
                  <span
                    className={`text-xs ${l.meetingId ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
                  >
                    {l.meetingId ? "Registrada" : "Pendente"}
                  </span>
                </button>
              ))}
            </section>
            {selected && (
              <LessonEditor
                key={`${classId}-${iso}-${slot}-${revision}`}
                lesson={selected}
                classId={Number(classId)}
                date={iso}
                onDirty={setDirty}
                onBusy={setBusy}
                onSaved={() => {
                  setDirty(false);
                  setRevision((x) => x + 1);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function LessonEditor({
  lesson,
  classId,
  date,
  onDirty,
  onBusy,
  onSaved,
}: {
  lesson: DailyLesson;
  classId: number;
  date: string;
  onDirty: (v: boolean) => void;
  onBusy: (v: boolean) => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [content, setContent] = useState(lesson.content);
  const [attachments, setAttachments] = useState<LessonAttachment[]>(
    lesson.attachments,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    if (incoming.length + files.length + attachments.length > 10) {
      showToast("Anexe no máximo 10 arquivos.", "warning");
      return;
    }
    if (
      incoming.some(
        (f) =>
          f.size === 0 ||
          f.size > 10 * 1024 * 1024 ||
          !/\.(pdf|txt|docx?|xlsx?|pptx?|png|jpe?g|gif|webp)$/i.test(f.name),
      )
    ) {
      showToast(
        "Use arquivos válidos de até 10 MB: PDF, Office, TXT ou imagens.",
        "warning",
      );
      return;
    }
    setFiles((prev) => [...prev, ...incoming]);
    onDirty(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    onBusy(true);
    let uploaded = [...attachments];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Enviando arquivo ${i + 1} de ${files.length}...`);
        const result = await uploadFile(files[i], "lesson-files");
        uploaded = [...uploaded, { name: files[i].name, path: result.path }];
        setAttachments(uploaded);
        setFiles((prev) => prev.slice(1));
      }
      setProgress("Salvando registro...");
      await saveLessonRecord(classId, {
        date,
        slot: lesson.slot,
        disciplineId: lesson.disciplineId,
        content,
        attachments: uploaded,
      });
      showToast("Registro salvo com sucesso.", "success");
      onSaved();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Não foi possível salvar o registro.",
        "error",
      );
    } finally {
      setSaving(false);
      onBusy(false);
      setProgress("");
    }
  }
  async function download(a: LessonAttachment) {
    try {
      await downloadPrivateFile(a.path);
    } catch {
      showToast("Não foi possível baixar o arquivo.", "error");
    }
  }
  return (
    <form
      onSubmit={submit}
      className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 space-y-5"
    >
      <header className="border-b border-[var(--color-border)] pb-4">
        <h2 className="text-lg font-semibold">{lesson.disciplineName}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {lesson.startTime} – {lesson.endTime} ·{" "}
          {date.split("-").reverse().join("/")}
        </p>
      </header>
      <FormField label="Conteúdo da aula">
        <Textarea
          aria-label="Conteúdo da aula"
          rows={7}
          maxLength={20000}
          value={content}
          disabled={saving}
          placeholder="Descreva os assuntos abordados e as atividades realizadas..."
          onChange={(e) => {
            setContent(e.target.value);
            onDirty(true);
          }}
        />
      </FormField>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Arquivos da aula</h3>
        <label
          className={`flex items-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] p-4 ${saving ? "opacity-50" : "cursor-pointer hover:bg-[var(--color-background)]"} focus-within:outline-2 focus-within:outline-[var(--color-primary)]`}
        >
          <FiUpload aria-hidden />
          <span className="text-sm">
            Adicionar arquivos
            <span className="block text-xs text-[var(--color-text-muted)] mt-1">
              Até 10 arquivos · 10 MB cada · PDF, Office, TXT e imagens
            </span>
          </span>
          <input
            aria-label="Adicionar arquivos"
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp"
            className="sr-only"
            disabled={saving}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {attachments.map((a, i) => (
          <div
            key={`${a.path}-${i}`}
            className="flex items-center gap-2 text-sm"
          >
            <FiFile aria-hidden />
            <button
              type="button"
              className="truncate text-[var(--color-primary)] underline text-left flex-1"
              onClick={() => download(a)}
            >
              {a.name}
            </button>
            <button
              type="button"
              aria-label={`Remover ${a.name}`}
              disabled={saving}
              className="p-3"
              onClick={() => {
                setAttachments((x) => x.filter((_, j) => j !== i));
                onDirty(true);
              }}
            >
              <FiX />
            </button>
          </div>
        ))}
        {files.map((f, i) => (
          <div
            key={`${f.name}-${i}`}
            className="flex items-center gap-2 text-sm"
          >
            <FiFile aria-hidden />
            <span className="truncate flex-1">{f.name}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              A enviar
            </span>
            <button
              type="button"
              aria-label={`Remover ${f.name}`}
              disabled={saving}
              className="p-3"
              onClick={() => {
                setFiles((x) => x.filter((_, j) => j !== i));
                onDirty(true);
              }}
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
        {lesson.meetingId ? (
          <Link
            className="text-sm text-[var(--color-primary)]"
            to={`/aulas/${lesson.meetingId}`}
          >
            Ver aula e chamada
          </Link>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">
            O horário é definido pela grade da turma.
          </span>
        )}
        <Button
          type="submit"
          loading={saving}
          disabled={!content.trim() && !attachments.length && !files.length}
        >
          Salvar registro
        </Button>
      </footer>
      {progress && (
        <p role="status" className="text-sm text-[var(--color-text-secondary)]">
          {progress}
        </p>
      )}
    </form>
  );
}
