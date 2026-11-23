import { useEffect, useMemo, useState } from "react";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  DataCard,
  PageHeader,
  StateBlock,
  Select,
  tableStyles,
} from "../../components/ui";
import {
  getMyBoletim,
  type StudentBoletim,
} from "../../services/boletimService";

import {
  ACADEMIC_CYCLE_STATUS_LABELS,
  formatIsoDatePtBr,
} from "../../utils/brDate";

function fmtScore(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "";
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function StudentBoletim() {
  const [boletim, setBoletim] = useState<StudentBoletim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCycle, setSelectedCycle] = useState<number>();
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    getMyBoletim(selectedCycle)
      .then((result) => {
        if (active) setBoletim(result);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar boletim.",
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCycle, retry]);

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
          {!!boletim?.availableCycles?.length && (
            <div className="px-4 pt-4">
              <label
                htmlFor="report-cycle"
                className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Ano letivo
              </label>
              <Select
                id="report-cycle"
                className="max-w-md"
                value={selectedCycle ?? boletim.cycleId}
                onChange={(event) =>
                  setSelectedCycle(Number(event.target.value))
                }
              >
                {boletim.availableCycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.yearStartDate && cycle.yearEndDate
                      ? `${formatIsoDatePtBr(cycle.yearStartDate)} a ${formatIsoDatePtBr(cycle.yearEndDate)}`
                      : cycle.yearEndDate
                        ? `Término em ${formatIsoDatePtBr(cycle.yearEndDate)}`
                        : `Ciclo ${cycle.id}`}
                    {" · "}
                    {ACADEMIC_CYCLE_STATUS_LABELS[cycle.status]}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <StateBlock
            loading={isLoading}
            loadingText="Carregando boletim..."
            error={error}
            onRetry={() => setRetry((n) => n + 1)}
            empty={!!boletim && boletim.trimesters.length === 0}
            emptyText="Ainda não há dados de boletim."
          >
            {boletim && (
              <div className="p-4 flex flex-col gap-4">
                <div className="text-sm text-[var(--color-text-muted)]">
                  <p>
                    Percentual mínimo de aprovação no ano:{" "}
                    <strong>{boletim.fixedApprovalPercentage}%</strong>
                  </p>
                  <p>
                    Total do ano:{" "}
                    <strong>{fmtScore(boletim.totalReleasedScore)}</strong> /{" "}
                    <strong>{fmtScore(boletim.yearMaxPoints)}</strong>
                  </p>
                  {!boletim.yearResult && boletim.eligibleForYearRecovery && (
                    <p className="text-[var(--color-warning)] font-medium">
                      Você está elegível para recuperação anual.
                    </p>
                  )}
                </div>

                {boletim.yearResult && (
                  <section
                    aria-label="Resultado anual"
                    className="rounded-lg border border-[var(--color-border)] p-4 text-sm"
                  >
                    <h2 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                      Resultado anual
                    </h2>
                    <p>
                      {boletim.yearResult.approved ? "Aprovado" : "Reprovado"}
                      {boletim.yearResult.promoted && " · Promovido"}
                    </p>
                    <p>
                      Pontuação-base: {fmtScore(boletim.yearResult.baseScore)} ·
                      Pontuação final: {fmtScore(boletim.yearResult.finalScore)}
                    </p>
                  </section>
                )}
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
