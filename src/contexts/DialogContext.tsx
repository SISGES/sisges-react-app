import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

type DialogState = { title: string; message: string; confirm: boolean } | null;
type DialogApi = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback(
    (message: string, title: string, confirm: boolean) => {
      setDialog({ message, title, confirm });
      return new Promise<boolean>((resolve) => {
        resolver.current = resolve;
      });
    },
    [],
  );
  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setDialog(null);
  };

  return (
    <DialogContext.Provider
      value={{
        alert: async (message, title = "Atenção") => {
          await open(message, title, false);
        },
        confirm: (message, title = "Confirmar ação") =>
          open(message, title, true),
      }}
    >
      {children}
      <Modal
        open={!!dialog}
        onClose={() => close(false)}
        title={dialog?.title ?? ""}
        maxWidth="max-w-md"
        footer={
          <>
            {dialog?.confirm && (
              <Button variant="secondary" onClick={() => close(false)}>
                Cancelar
              </Button>
            )}
            <Button
              variant={dialog?.confirm ? "danger" : "primary"}
              onClick={() => close(true)}
            >
              {dialog?.confirm ? "Confirmar" : "OK"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-primary)]">
          {dialog?.message}
        </p>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error("useDialog must be used inside DialogProvider");
  return value;
}
