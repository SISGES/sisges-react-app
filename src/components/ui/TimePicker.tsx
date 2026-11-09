import { FiClock } from "react-icons/fi";

interface TimePickerProps {
  /** A 24-hour HH:mm value, or an empty string. */
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

const pad = (value: number) => String(value).padStart(2, "0");
const hours = Array.from({ length: 24 }, (_, index) => pad(index));
const minutes = Array.from({ length: 60 }, (_, index) => pad(index));
const selectClass =
  "min-w-0 flex-1 min-h-11 rounded-md bg-[var(--color-input-bg)] px-2 text-center text-sm tabular-nums text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed";

/** Locale-independent time selection; selecting either segment supplies 00 for the other. */
export function TimePicker({
  value,
  onValueChange,
  label,
  required,
  disabled,
}: TimePickerProps) {
  const [hour = "", minute = ""] = value.split(":");
  const selectedHour = hours.includes(hour) ? hour : "";
  const selectedMinute = minutes.includes(minute) ? minute : "";

  return (
    <div
      role="group"
      aria-label={`${label}, formato de 24 horas`}
      className={`flex w-full min-w-0 items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-2 focus-within:border-[var(--color-primary)] focus-within:ring-3 focus-within:ring-[var(--color-primary)]/12 ${disabled ? "opacity-50" : ""}`}
    >
      <FiClock
        size={16}
        aria-hidden="true"
        className="shrink-0 text-[var(--color-text-muted)]"
      />
      <select
        aria-label={`${label}: hora (00 a 23)`}
        value={selectedHour}
        required={required}
        disabled={disabled}
        onChange={(event) =>
          onValueChange(`${event.target.value}:${selectedMinute || "00"}`)
        }
        className={selectClass}
      >
        <option value="" disabled>
          HH
        </option>
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="text-[var(--color-text-muted)]">
        :
      </span>
      <select
        aria-label={`${label}: minuto (00 a 59)`}
        value={selectedMinute}
        required={required}
        disabled={disabled}
        onChange={(event) =>
          onValueChange(`${selectedHour || "00"}:${event.target.value}`)
        }
        className={selectClass}
      >
        <option value="" disabled>
          MM
        </option>
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
}
