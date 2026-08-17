import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  DataCard,
  PageHeader,
  StateBlock,
  tableStyles,
  Button,
  ConfirmModal,
} from "../../components/ui";
import {
  getActivityGradebook,
  releaseActivityGrades,
  saveActivityGrades,
  type ActivityGradebook,
} from "../../services/activityService";
import { ApiError } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

function normalizeScore(value: string): string {
  const sanitized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [i, d] = sanitized.split(".");
  if (d === undefined) return i;
  return `${i}.${d.slice(0, 2)}`;
}

export function ActivityGradebook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const activityId = id ? Number(id) : NaN;

  const [gradebook, setGradebook] = useState<ActivityGradebook | null>(null);
  const [scoreMap, setScoreMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);

  const fetchGradebook = useCallback(async () => {
    if (!activityId || Number.isNaN(activityId)) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActivityGradebook(activityId);
      setGradebook(data);
      setScoreMap(
        Object.fromEntries(
          data.students.map((s) => [
            s.studentId,
            s.score === null ? "" : String(s.score),
          ]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar notas.");
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    void fetchGradebook();
  }, [fetchGradebook]);

  const entries = useMemo(
    () =>
      (gradebook?.students ?? []).map((s) => {
        const raw = scoreMap[s.studentId]?.trim() ?? "";
        return {
          studentId: s.studentId,
          score: raw === "" ? null : Number(raw),
        };
      }),
    [gradebook?.students, scoreMap],
  );

  const handleSave = async () => {
    if (!gradebook || gradebook.released) return;
    setIsSaving(true);
    try {
      const updated = await saveActivityGrades(gradebook.activityId, entries);
      setGradebook(updated);
      showToast("Notas salvas com sucesso.", "success");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Erro ao salvar notas.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRelease = async () => {
    if (!gradebook) return;
    setIsReleasing(true);
    try {
      await releaseActivityGrades(gradebook.activityId);
      setShowReleaseConfirm(false);
      showToast("Notas liberadas com sucesso.", "success");
      await fetchGradebook();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Erro ao liberar notas.",
        "error",
      );
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Lançamento de Notas"
        back={<BackButton to="/aulas" />}
        action={
          gradebook ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/aulas/${gradebook.classMeetingId}`)}
              >
                Ver aula
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={gradebook.released}
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowReleaseConfirm(true)}
                disabled={gradebook.released}
              >
                Liberar notas
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex-1 p-6">
        <DataCard
          title={
            gradebook
              ? `${gradebook.title} (${gradebook.activityType})`
              : "Notas da atividade"
          }
          count={gradebook?.students.length}
          countLabel="alunos"
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando gradebook..."
            error={error}
            onRetry={fetchGradebook}
            empty={!!gradebook && gradebook.students.length === 0}
            emptyText="Nenhum aluno elegível para esta atividade."
          >
            {gradebook && (
              <div className="p-4 flex flex-col gap-4">
                <div className="text-sm text-[var(--color-text-muted)]">
                  <p>
                    Pontuação máxima: <strong>{gradebook.maxPoints}</strong>
                    {gradebook.trimesterNumber
                      ? ` | Trimestre ${gradebook.trimesterNumber}`
                      : ""}
                  </p>
                  <p>
                    Status:{" "}
                    <strong>
                      {gradebook.released
                        ? "Notas já liberadas"
                        : "Rascunho (não liberado)"}
                    </strong>
                  </p>
                </div>

                <div className={tableStyles.wrapper}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th className={tableStyles.th}>Aluno</th>
                        <th className={tableStyles.th}>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradebook.students.map((student) => (
                        <tr
                          key={student.studentId}
                          className={tableStyles.trHover}
                        >
                          <td className={tableStyles.td}>
                            {student.studentName}
                          </td>
                          <td className={tableStyles.td}>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={scoreMap[student.studentId] ?? ""}
                              onChange={(e) =>
                                setScoreMap((prev) => ({
                                  ...prev,
                                  [student.studentId]: normalizeScore(
                                    e.target.value,
                                  ),
                                }))
                              }
                              disabled={gradebook.released || isSaving}
                              className="w-32 px-2 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text-primary)]"
                              placeholder={`0 - ${gradebook.maxPoints}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </StateBlock>
        </DataCard>
      </div>

      <ConfirmModal
        open={showReleaseConfirm}
        onClose={() => !isReleasing && setShowReleaseConfirm(false)}
        onConfirm={handleRelease}
        title="Liberar notas"
        message="Após liberar, as notas ficam visíveis no boletim e a atividade não poderá mais ser editada."
        confirmLabel={isReleasing ? "Liberando..." : "Liberar"}
        loading={isReleasing}
      />
    </div>
  );
}
