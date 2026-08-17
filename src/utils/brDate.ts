export type AcademicCycleStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export const ACADEMIC_CYCLE_STATUS_LABELS: Record<AcademicCycleStatus, string> =
  {
    NOT_STARTED: "Não iniciado",
    IN_PROGRESS: "Em andamento",
    FINISHED: "Encerrado",
  };

export function formatBrDateInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function brDateToIso(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  const day = parseInt(d!, 10);
  const month = parseInt(m!, 10);
  if (day < 1 || day > 31 || month < 1 || month > 12) return "";
  return `${y}-${m}-${d}`;
}

export function isoDateToBr(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

export function formatIsoDatePtBr(value: string | null | undefined): string {
  const br = isoDateToBr(value);
  return br || "—";
}

export function getTodayBr(): string {
  const now = new Date();
  return [
    String(now.getDate()).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    now.getFullYear(),
  ].join("/");
}
