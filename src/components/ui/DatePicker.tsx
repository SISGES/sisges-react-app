import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  brDateToIso,
  formatBrDateInput,
  getTodayBr,
  isoDateToBr,
} from "../../utils/brDate";
import { Input } from "./FormField";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onValueChange: (value: string) => void;
};
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const buttonClass =
  "min-h-10 rounded-md px-2 hover:bg-[var(--color-input-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]";

/** Controlled Brazilian-format date input. Calendar values never pass through UTC. */
export function DatePicker({
  value,
  onValueChange,
  disabled,
  readOnly,
  className,
  ...props
}: Props) {
  const id = useId();
  const input = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(new Date());
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iso = brDateToIso(value);
  const invalid = value.length === 10 && !iso;
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const choose = (date: Date) => {
    onValueChange(
      `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
    );
    close();
  };
  const show = () => {
    const selected = iso ? new Date(`${iso}T12:00:00`) : new Date();
    setView(selected);
    setOpen(true);
  };
  useEffect(() => {
    const field = input.current?.querySelector("input");
    field?.setCustomValidity(
      value && !iso ? "Informe uma data válida no formato dd/mm/aaaa." : "",
    );
  }, [value, iso]);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = input.current?.getBoundingClientRect();
      if (!rect) return;
      const height = popup.current?.offsetHeight ?? 370;
      setPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 320)),
        top: Math.max(
          8,
          rect.bottom + height + 8 <= window.innerHeight
            ? rect.bottom + 6
            : rect.top - height - 6,
        ),
      });
    };
    place();
    popup.current
      ?.querySelector<HTMLButtonElement>('[data-focused="true"]')
      ?.focus();
    const outside = (e: PointerEvent) => {
      if (
        !input.current?.contains(e.target as Node) &&
        !popup.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);
  const year = view.getFullYear(),
    month = view.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const move = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    if (next.getFullYear() >= 1000 && next.getFullYear() <= 9999) setView(next);
  };
  return (
    <div
      ref={input}
      className="relative min-w-0 flex-1"
      onBlur={(e) => {
        if (
          !e.currentTarget.contains(e.relatedTarget) &&
          !popup.current?.contains(e.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        placeholder={props.placeholder ?? "dd/mm/aaaa"}
        aria-label={props["aria-label"] ?? "Data (dd/mm/aaaa)"}
        aria-invalid={invalid || props["aria-invalid"]}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={10}
        className={`${className ?? ""} !pr-12`}
        onChange={(e) => onValueChange(formatBrDateInput(e.target.value))}
        onKeyDown={(e) => {
          props.onKeyDown?.(e);
          if (e.altKey && e.key === "ArrowDown" && !disabled && !readOnly) {
            e.preventDefault();
            show();
          }
        }}
      />
      <button
        ref={trigger}
        type="button"
        aria-label="Abrir calendário"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        disabled={disabled || readOnly}
        onClick={() => (open ? close() : show())}
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] disabled:opacity-50"
      >
        <FiCalendar size={18} />
      </button>
      {open &&
        !disabled &&
        !readOnly &&
        createPortal(
          <div
            ref={popup}
            id={id}
            role="dialog"
            aria-label="Escolher data"
            style={{
              ...position,
              width: "min(312px, calc(100vw - 16px))",
              maxHeight: "calc(100dvh - 16px)",
            }}
            className="fixed z-[10000] overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-primary)] shadow-xl"
            onBlur={(e) => {
              if (
                !e.currentTarget.contains(e.relatedTarget) &&
                !input.current?.contains(e.relatedTarget)
              )
                setOpen(false);
            }}
          >
            <div className="flex items-center gap-1 mb-3">
              <button
                type="button"
                className={buttonClass}
                aria-label="Mês anterior"
                onClick={() => move(-1)}
              >
                <FiChevronLeft />
              </button>
              <select
                aria-label="Mês"
                value={month}
                onChange={(e) =>
                  setView(new Date(year, Number(e.target.value), 1))
                }
                className="min-w-0 flex-1 bg-[var(--color-input-bg)] rounded-md p-2"
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                aria-label="Ano"
                type="number"
                min={1000}
                max={9999}
                value={year}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n >= 1000 && n <= 9999) setView(new Date(n, month, 1));
                }}
                className="w-20 rounded-md bg-[var(--color-input-bg)] p-2"
              />
              <button
                type="button"
                className={buttonClass}
                aria-label="Próximo mês"
                onClick={() => move(1)}
              >
                <FiChevronRight />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <span
                  key={d}
                  className="py-2 text-xs text-[var(--color-text-muted)]"
                >
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const date = new Date(year, month, i + 1);
                const br = `${String(i + 1).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
                return (
                  <button
                    key={i}
                    type="button"
                    data-focused={
                      (iso ? isoDateToBr(iso) : getTodayBr()) === br
                    }
                    aria-pressed={value === br}
                    aria-current={getTodayBr() === br ? "date" : undefined}
                    aria-label={date.toLocaleDateString("pt-BR", {
                      dateStyle: "full",
                    })}
                    className={`${buttonClass} ${value === br ? "bg-[var(--color-primary)] text-white" : ""}`}
                    onClick={() => choose(date)}
                    onKeyDown={(e) => {
                      const delta = {
                        ArrowLeft: -1,
                        ArrowRight: 1,
                        ArrowUp: -7,
                        ArrowDown: 7,
                      }[e.key];
                      if (delta !== undefined) {
                        e.preventDefault();
                        const next = new Date(year, month, i + 1 + delta);
                        setView(next);
                        requestAnimationFrame(() =>
                          popup.current
                            ?.querySelector<HTMLButtonElement>(
                              `[aria-label="${next.toLocaleDateString("pt-BR", { dateStyle: "full" })}"]`,
                            )
                            ?.focus(),
                        );
                      }
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between border-t border-[var(--color-border)] pt-2">
              <button
                type="button"
                className={buttonClass}
                onClick={() => choose(new Date())}
              >
                Hoje
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() => {
                  onValueChange("");
                  close();
                }}
              >
                Limpar
              </button>
              <button type="button" className={buttonClass} onClick={close}>
                Fechar
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
