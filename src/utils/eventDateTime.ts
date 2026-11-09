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
