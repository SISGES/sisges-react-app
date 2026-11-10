import { DatePicker } from "../../components/ui/DatePicker";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiInfo, FiPlus, FiSliders, FiRotateCcw, FiX } from "react-icons/fi";
import { BackButton } from "../../components/BackButton/BackButton";
import {
  searchAulas,
  searchClasses,
  getDisciplines,
  searchTeachers,
} from "../../services/userService";
import { ApiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type {
  AulaSearchResponse,
  AulaSearchFilters,
  ClassSearchResponse,
  DisciplineResponse,
  TeacherSearchResponse,
} from "../../types/auth";
import {
  PageHeader,
  Button,
  DataCard,
  StateBlock,
  tableStyles,
  Pagination,
  Select,
} from "../../components/ui";
import { formatBrDateInput, brDateToIso } from "../../utils/brDate";

const PAGE_SIZE = 10;

export function Aulas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aulas, setAulas] = useState<AulaSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AulaSearchFilters>({});
  const [dateFilter, setDateFilter] = useState("");
  const [schoolClasses, setSchoolClasses] = useState<ClassSearchResponse[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const visibleAulas = aulas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";

  const fetchAulas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setAulas(await searchAulas(filters));
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erro ao carregar aulas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchOptions = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [c, d, t] = await Promise.all([
        searchClasses(),
        getDisciplines(),
        searchTeachers(),
      ]);
      setSchoolClasses(c);
      setDisciplines(d);
      setTeachers(t);
    } catch {
      void 0;
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAulas();
  }, [fetchAulas]);
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Aulas"
        back={<BackButton to="/" />}
        action={
          isTeacher ? (
            <Button
              size="sm"
              icon={<FiPlus size={14} />}
              onClick={() => navigate("/aulas/new")}
            >
              Registrar aula
            </Button>
          ) : undefined
        }
      />

      {isAdmin && (
        <section
          aria-label="Filtros de aulas"
          className="mx-4 mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:mx-6 sm:p-5"
        >
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <FiSliders aria-hidden className="text-[var(--color-primary)]" />
            Filtrar aulas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <label
                htmlFor="aulas-date"
                className="mb-2 block text-sm text-[var(--color-text-secondary)]"
              >
                Data
              </label>
              <DatePicker
                id="aulas-date"
                aria-label="Filtrar aulas por data"
                value={dateFilter}
                onValueChange={(value) => {
                  const next = formatBrDateInput(value);
                  setDateFilter(next);
                  setFilters((p) => ({
                    ...p,
                    date: brDateToIso(next) || undefined,
                  }));
                }}
              />
            </div>
            {[
              {
                key: "disciplineId" as const,
                label: "Disciplina",
                placeholder: "Todas as disciplinas",
                options: disciplines,
              },
              {
                key: "schoolClassId" as const,
                label: "Turma",
                placeholder: "Todas as turmas",
                options: schoolClasses,
              },
              {
                key: "teacherId" as const,
                label: "Professor",
                placeholder: "Todos os professores",
                options: teachers,
              },
            ].map((field) => (
              <div key={field.key} className="min-w-0">
                <label
                  htmlFor={`aulas-${field.key}`}
                  className="mb-2 block text-sm text-[var(--color-text-secondary)]"
                >
                  {field.label}
                </label>
                <Select
                  id={`aulas-${field.key}`}
                  value={filters[field.key] ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      [field.key]: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                >
                  <option value="">{field.placeholder}</option>
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <div
              className="flex min-w-0 flex-wrap items-center gap-2"
              aria-label="Filtros ativos"
            >
              {!dateFilter &&
                !filters.disciplineId &&
                !filters.schoolClassId &&
                !filters.teacherId && (
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Nenhum filtro aplicado
                  </span>
                )}
              {[
                { key: "date" as const, label: "Data", value: dateFilter },
                {
                  key: "disciplineId" as const,
                  label: "Disciplina",
                  value: filters.disciplineId
                    ? (disciplines.find((d) => d.id === filters.disciplineId)
                        ?.name ?? String(filters.disciplineId))
                    : "",
                },
                {
                  key: "schoolClassId" as const,
                  label: "Turma",
                  value: filters.schoolClassId
                    ? (schoolClasses.find((c) => c.id === filters.schoolClassId)
                        ?.name ?? String(filters.schoolClassId))
                    : "",
                },
                {
                  key: "teacherId" as const,
                  label: "Professor",
                  value: filters.teacherId
                    ? (teachers.find((t) => t.id === filters.teacherId)?.name ??
                      String(filters.teacherId))
                    : "",
                },
              ]
                .filter((chip) => chip.value)
                .map((chip) => (
                  <button
                    type="button"
                    key={chip.key}
                    aria-label={`Remover filtro ${chip.label}: ${chip.value}`}
                    onClick={() => {
                      if (chip.key === "date") setDateFilter("");
                      setFilters((p) => ({ ...p, [chip.key]: undefined }));
                    }}
                    className="flex min-h-9 max-w-full items-center gap-2 rounded-md bg-[var(--color-primary)]/10 px-3 py-1.5 text-left text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                  >
                    <span className="break-words">
                      {chip.label}: {chip.value}
                    </span>
                    <FiX className="shrink-0" aria-hidden />
                  </button>
                ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<FiRotateCcw />}
              onClick={() => {
                setDateFilter("");
                setFilters({});
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </section>
      )}

      <div className="flex-1 p-6">
        <DataCard
          title="Lista de Aulas"
          count={!isLoading && !error ? aulas.length : undefined}
          countLabel={aulas.length === 1 ? "aula" : "aulas"}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando aulas..."
            error={error}
            onRetry={fetchAulas}
            empty={aulas.length === 0}
            emptyText="Nenhuma aula encontrada."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {[
                      "Data",
                      "Horário",
                      "Disciplina",
                      "Turma",
                      "Professor",
                      "Ações",
                    ].map((h) => (
                      <th key={h} className={tableStyles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleAulas.map((a) => (
                    <tr key={a.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{formatDate(a.date)}</td>
                      <td className={tableStyles.td}>
                        {a.startTime.slice(0, 5)} – {a.endTime.slice(0, 5)}
                      </td>
                      <td className={tableStyles.td}>{a.disciplineName}</td>
                      <td className={tableStyles.td}>{a.schoolClassName}</td>
                      <td className={tableStyles.td}>{a.teacherName}</td>
                      <td className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => navigate(`/aulas/${a.id}`)}
                          title="Detalhes"
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors ml-auto"
                        >
                          <FiInfo size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={aulas.length}
              onPageChange={setCurrentPage}
            />
          </StateBlock>
        </DataCard>
      </div>
    </div>
  );
}
