import { useCallback, useRef, useState, type ReactNode } from "react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { DialogContext } from "./DialogContext";

type DialogState = { title: string; message: string; confirm: boolean } | null;

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
