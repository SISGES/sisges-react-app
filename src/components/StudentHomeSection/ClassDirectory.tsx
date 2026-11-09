import { useId, useState } from "react";
import { FiUsers, FiUserCheck } from "react-icons/fi";
import type { MyClassResponse } from "../../services/studentPortalService";
import { Pagination } from "../ui/Pagination";
import { UserAvatar } from "../UserAvatar/UserAvatar";

export function ClassDirectory({
  schoolClass,
}: {
  schoolClass: MyClassResponse | null;
}) {
  const id = useId();
  const [active, setActive] = useState<"classmates" | "teachers">("classmates");
  const [pages, setPages] = useState({ classmates: 1, teachers: 1 });
  if (!schoolClass?.className) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
        <FiUsers
          size={24}
          className="mb-3 text-[var(--color-text-secondary)]"
          aria-hidden
        />
        <h2 className="font-semibold text-[var(--color-text-primary)]">
          Nenhuma turma vinculada
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Os colegas e professores aparecerão aqui quando sua conta for
          vinculada a uma turma.
        </p>
      </div>
    );
  }
  const tabs = [
    {
      key: "classmates" as const,
      label: "Colegas",
      people: schoolClass.classmates,
      Icon: FiUsers,
    },
    {
      key: "teachers" as const,
      label: "Professores",
      people: schoolClass.teachers,
      Icon: FiUserCheck,
    },
  ];
  const normalized = (value: string) =>
    value.toLowerCase().replace(/[º°ª\s]/g, "");
  const showYear =
    schoolClass.academicYear &&
    normalized(schoolClass.academicYear) !== normalized(schoolClass.className);
  return (
    <section
      className="mx-auto w-full max-w-6xl text-left"
      aria-labelledby={`${id}-title`}
    >
      <header className="mb-6">
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
        >
          {schoolClass.className}
        </h2>
        {showYear && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {schoolClass.academicYear}
          </p>
        )}
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Encontre as pessoas e os contatos da sua turma.
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          role="tablist"
          aria-label="Pessoas da turma"
          className="flex gap-5 border-b border-[var(--color-border)] px-4 sm:gap-7 sm:px-5"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              id={`${id}-${tab.key}-tab`}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              aria-controls={`${id}-${tab.key}-panel`}
              tabIndex={active === tab.key ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  tabs[
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : (index + 1) % tabs.length
                  ];
                setActive(next.key);
                document.getElementById(`${id}-${next.key}-tab`)?.focus();
              }}
              className={`relative flex min-h-14 items-center justify-start gap-2 py-4 text-left text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-primary)] ${active === tab.key ? "text-[var(--color-primary)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
            >
              <tab.Icon size={17} aria-hidden />
              <span>{tab.label}</span>
              <span className="rounded-full bg-[var(--color-surface-subtle)] px-2 py-0.5 text-xs tabular-nums text-[var(--color-text-secondary)]">
                {tab.people.length}
              </span>
            </button>
          ))}
        </div>
        {tabs.map((tab) => {
          const page = Math.min(
            pages[tab.key],
            Math.max(1, Math.ceil(tab.people.length / 10)),
          );
          const visible = tab.people.slice((page - 1) * 10, page * 10);
          return (
            <div
              key={tab.key}
              id={`${id}-${tab.key}-panel`}
              role="tabpanel"
              aria-labelledby={`${id}-${tab.key}-tab`}
              hidden={active !== tab.key}
              tabIndex={0}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              {tab.people.length === 0 ? (
                <div className="flex min-h-48 flex-col items-start justify-center gap-3 p-5 sm:p-6">
                  <span className="rounded-lg bg-[var(--color-surface-subtle)] p-2.5 text-[var(--color-text-secondary)]">
                    <tab.Icon size={21} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {tab.key === "teachers"
                        ? "Nenhum professor vinculado"
                        : "Nenhum colega encontrado"}
                    </h3>
                    <p className="mt-1 max-w-lg text-sm text-[var(--color-text-secondary)]">
                      {tab.key === "teachers"
                        ? "Os professores aparecerão aqui quando forem vinculados à turma."
                        : "Os outros alunos aparecerão aqui quando forem vinculados à turma."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] sm:grid"
                    aria-hidden
                  >
                    <span>Nome</span>
                    <span>E-mail</span>
                  </div>
                  <ul className="divide-y divide-[var(--color-border)]">
                    {visible.map((person) => (
                      <li
                        key={person.id}
                        className="grid min-w-0 grid-cols-1 items-center gap-1.5 px-4 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-4 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar name={person.name} className="h-9 w-9" />
                          <span className="min-w-0 break-words text-sm font-medium text-[var(--color-text-primary)]">
                            {person.name}
                          </span>
                        </div>
                        {person.email ? (
                          <a
                            href={`mailto:${person.email}`}
                            className="min-w-0 break-all pl-12 text-left text-sm text-[var(--color-primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] sm:pl-0"
                            aria-label={`Enviar e-mail para ${person.name}: ${person.email}`}
                          >
                            {person.email}
                          </a>
                        ) : (
                          <span className="pl-12 text-sm text-[var(--color-text-secondary)] sm:pl-0">
                            E-mail não informado
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    currentPage={page}
                    pageSize={10}
                    totalItems={tab.people.length}
                    onPageChange={(next) =>
                      setPages((previous) => ({ ...previous, [tab.key]: next }))
                    }
                    className="px-5 pb-4"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
