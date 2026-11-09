import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { useToast, type Toast } from "../../contexts/ToastContext";

const icons: Record<Toast["type"], ReactNode> = {
  success: <FiCheck size={18} />,
  error: <FiAlertCircle size={18} />,
  warning: <FiAlertTriangle size={18} />,
  info: <FiInfo size={18} />,
};
const tones: Record<Toast["type"], string> = {
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  error: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  info: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
};

function ToastMessage({
  toast,
  remove,
}: {
  toast: Toast;
  remove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(toast.type === "warning" ? 8000 : 5000);
  useEffect(() => {
    if (toast.type === "error" || hovered || focused) return;
    const started = Date.now();
    const timer = window.setTimeout(() => remove(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [toast.id, toast.type, hovered, focused, remove]);
  return (
    <div
      data-testid="toast"
      role={toast.type === "error" ? "alert" : "status"}
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 pl-4 text-sm text-[var(--color-text-primary)] shadow-lg"
    >
      <span
        aria-hidden
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tones[toast.type]}`}
      >
        {icons[toast.type]}
      </span>
      <span className="min-w-0 flex-1 break-words">{toast.message}</span>
      <button
        type="button"
        onClick={() => remove(toast.id)}
        aria-label="Fechar notificação"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
      >
        <FiX size={18} aria-hidden />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <section
      aria-label="Notificações"
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 left-4 z-[11000] flex max-h-[60dvh] flex-col gap-2 overflow-y-auto sm:left-auto sm:w-96 sm:max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} remove={removeToast} />
      ))}
    </section>
  );
}
