import { createContext, useContext } from "react";

type DialogApi = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
};

export const DialogContext = createContext<DialogApi | null>(null);

export function useDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error("useDialog deve ser usado dentro de DialogProvider");
  return value;
}
