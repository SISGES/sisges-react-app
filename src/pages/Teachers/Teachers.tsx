import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiInfo, FiPlus } from "react-icons/fi";
import { BackButton } from "../../components/BackButton/BackButton";
import { searchTeachers } from "../../services/userService";
import { ApiError } from "../../services/api";
import type { TeacherSearchResponse } from "../../types/auth";
import {
  PageHeader,
  Button,
  DataCard,
  StateBlock,
  tableStyles,
} from "../../components/ui";

export function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTeachers(await searchTeachers());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erro ao carregar professores.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Professores"
        back={<BackButton to="/" />}
        action={
          <Button
            size="sm"
            icon={<FiPlus size={14} />}
            onClick={() => navigate("/admin/register?role=TEACHER")}
          >
            Novo professor
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataCard
          title="Professores Cadastrados"
          count={!isLoading && !error ? teachers.length : undefined}
          countLabel={teachers.length === 1 ? "professor" : "professores"}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando professores..."
            error={error}
            onRetry={fetchTeachers}
            empty={teachers.length === 0}
            emptyText="Nenhum professor cadastrado."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {["Nome", "E-mail", "Ações"].map((h) => (
                      <th key={h} className={tableStyles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{t.name}</td>
                      <td className={tableStyles.td}>{t.email}</td>
                      <td className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/users/${t.id}`)}
                          title="Ver detalhes"
                          aria-label={`Ver detalhes de ${t.name}`}
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
          </StateBlock>
        </DataCard>
      </div>
    </div>
  );
}
