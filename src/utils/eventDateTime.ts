/** Convert the user's local wall-clock selection to the API's RFC 3339 timestamp. */
export function eventDateTimeToIso(date: string, time: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    throw new Error("Informe uma data e um horário válidos.");
  }
  const value = new Date(`${date}T${time}:00`);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (
    value.getFullYear() !== year ||
    value.getMonth() + 1 !== month ||
    value.getDate() !== day ||
    value.getHours() !== hour ||
    value.getMinutes() !== minute
  ) {
    throw new Error("Informe uma data e um horário válidos.");
  }
  return value.toISOString();
}

/** The school's year boundary is São Paulo time, regardless of server timezone. */
export function eventDateLimits(now = new Date()) {
  const year = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    }).format(now),
  );
  const end = new Date(`${year + 1}-01-01T00:00:00-03:00`);
  end.setMilliseconds(end.getMilliseconds() - 1);
  const localDay = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { min: localDay(now), max: localDay(end), end, year };
}

export function validateEventDateTime(value: string, now = new Date()): void {
  const date = new Date(value);
  if (
    !Number.isFinite(date.getTime()) ||
    date < now ||
    date > eventDateLimits(now).end
  ) {
    throw new Error(
      "O evento deve ocorrer entre agora e o fim do ano atual (horário de São Paulo).",
    );
  }
}
