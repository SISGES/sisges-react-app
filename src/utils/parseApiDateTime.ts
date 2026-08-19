/**
 * API datetimes are stored/sent as UTC but often omit the "Z" suffix.
 * JavaScript treats bare ISO strings as local time, which skews countdowns.
 */
export function parseApiDateTime(value: string): Date {
  if (!value) return new Date(NaN);
  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  return new Date(`${value}Z`);
}
