import { useId, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({
  label,
  required,
  error,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && (
          <span className="text-[var(--color-error)] ml-0.5">*</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

const inputBase =
  "w-full min-h-11 px-3.5 py-2.5 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/12 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const selectBase = "appearance-none !pr-11";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ className = "", icon, ...props }: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const isPassword = props.type === "password";
  const inputId = props.id ?? generatedId;

  if (!icon && !isPassword)
    return <input className={`${inputBase} ${className}`} {...props} />;

  return (
    <div className="relative">
      {icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--color-text-muted)]"
        >
          {icon}
        </span>
      )}
      <input
        {...props}
        id={inputId}
        type={isPassword && passwordVisible ? "text" : props.type}
        className={`${inputBase} ${icon ? "pl-10" : ""} ${className} ${isPassword ? "!pr-12" : ""}`}
      />
      {isPassword && (
        <button
          type="button"
          aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-controls={inputId}
          disabled={props.disabled}
          onClick={() => setPasswordVisible((visible) => !visible)}
          className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordVisible ? (
            <FiEyeOff size={18} aria-hidden="true" />
          ) : (
            <FiEye size={18} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

export function Select({
  className = "",
  children,
  style,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={`${inputBase} ${selectBase} ${className}`}
      {...props}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23718096' stroke-width='1.75' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 14px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "16px",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputBase} resize-y min-h-[80px] ${className}`}
      {...props}
    />
  );
}

interface AlertProps {
  type: "error" | "success" | "warning";
  children: ReactNode;
}

const alertStyles: Record<AlertProps["type"], string> = {
  error:
    "bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]",
  success:
    "bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)]",
};

export function Alert({ type, children }: AlertProps) {
  return (
    <div
      className={`px-4 py-3 rounded-md text-sm font-medium ${alertStyles[type]}`}
      role="alert"
    >
      {children}
    </div>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
  }[size];
  return (
    <span
      className={`inline-block ${sizeClass} border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full`}
      style={{ animation: "spin 0.8s linear infinite" }}
    />
  );
}
