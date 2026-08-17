import { useCallback, useEffect, useMemo, useState } from "react";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  DataCard,
  PageHeader,
  StateBlock,
  tableStyles,
} from "../../components/ui";
import {
  getMyBoletim,
  type StudentBoletim,
} from "../../services/boletimService";

function fmtScore(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "";
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function StudentBoletim() {
  const [boletim, setBoletim] = useState<StudentBoletim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoletim = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBoletim(await getMyBoletim());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar boletim.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBoletim();
  }, [fetchBoletim]);

  const maxColumns = useMemo(
    () =>
      Math.max(
        3,
        ...(boletim?.trimesters.map((t) => t.activities.length) ?? [0]),
      ),
    [boletim?.trimesters],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Boletim" back={<BackButton to="/" />} />

      <div className="flex-1 p-6">
        <DataCard title="Notas por trimestre">
          <StateBlock
            loading={isLoading}
            loadingText="Carregando boletim..."
            error={error}
            onRetry={fetchBoletim}
            empty={!!boletim && boletim.trimesters.length === 0}
            emptyText="Ainda não há dados de boletim."
          >
            {boletim && (
              <div className="p-4 flex flex-col gap-4">
                <div className="text-sm text-[var(--color-text-muted)]">
                  <p>
                    Média mínima fixa:{" "}
                    <strong>{boletim.fixedApprovalPercentage}%</strong>
                  </p>
                  <p>
                    Total do ano:{" "}
                    <strong>{fmtScore(boletim.totalReleasedScore)}</strong> /{" "}
                    <strong>{fmtScore(boletim.yearMaxPoints)}</strong>
                  </p>
                  {boletim.eligibleForYearRecovery && (
                    <p className="text-[var(--color-warning)] font-medium">
                      Você está elegível para recuperação anual.
                    </p>
                  )}
                </div>

                <div className={tableStyles.wrapper}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th className={tableStyles.th}>Período</th>
                        {Array.from({ length: maxColumns }).map((_, idx) => (
                          <th key={idx} className={tableStyles.th}>
                            Nota {idx + 1}
                          </th>
                        ))}
                        <th className={tableStyles.th}>Soma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boletim.trimesters.map((row) => (
                        <tr key={row.trimester} className={tableStyles.trHover}>
                          <td className={tableStyles.td}>
                            {row.trimester}º Trimestre
                            {!row.allActivitiesReleased && (
                              <span className="ml-2 text-xs text-[var(--color-warning)]">
                                (pendente liberação)
                              </span>
                            )}
                          </td>
                          {Array.from({ length: maxColumns }).map((_, idx) => (
                            <td key={idx} className={tableStyles.td}>
                              {idx < row.activities.length
                                ? fmtScore(row.activities[idx].score)
                                : ""}
                            </td>
                          ))}
                          <td className={tableStyles.td}>
                            {fmtScore(row.totalReleasedScore)} /{" "}
                            {fmtScore(row.trimesterMaxPoints)}
                          </td>
                        </tr>
                      ))}

                      <tr className={tableStyles.trHover}>
                        <td className={tableStyles.td}>
                          Recuperação (trimestres)
                        </td>
                        {Array.from({ length: maxColumns }).map((_, idx) => (
                          <td key={idx} className={tableStyles.td}>
                            {idx <
                            boletim.recoveryRow.trimesterRecoveryScores.length
                              ? fmtScore(
                                  boletim.recoveryRow.trimesterRecoveryScores[
                                    idx
                                  ],
                                )
                              : ""}
                          </td>
                        ))}
                        <td className={tableStyles.td}>
                          Anual:{" "}
                          {fmtScore(boletim.recoveryRow.yearRecoveryScore)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </StateBlock>
        </DataCard>
      </div>
    </div>
  );
}
