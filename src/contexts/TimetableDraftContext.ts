import { createContext, useContext } from "react";
import type { Schedule } from "../services/scheduleService";

export interface TimetableDrafts {
  classId: string;
  setClassId: (id: string) => void;
  getDraft: (id: string) => Schedule | undefined;
  setDraft: (id: string, schedule: Schedule) => void;
  clearDraft: (id: string, expected?: Schedule) => void;
}
export const TimetableDraftContext = createContext<TimetableDrafts | null>(
  null,
);
export function useTimetableDrafts() {
  const context = useContext(TimetableDraftContext);
  if (!context) throw new Error("TimetableDraftProvider is required");
  return context;
}
