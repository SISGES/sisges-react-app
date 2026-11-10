import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { TimetableDraftContext } from "./TimetableDraftContext";
import type { Schedule } from "../services/scheduleService";

// Memory-only drafts survive route changes, but never logout or a page reload.
function DraftSession({ children }: { children: ReactNode }) {
  const drafts = useRef(new Map<string, Schedule>());
  const [count, setCount] = useState(0);
  const [classId, setClassId] = useState("");
  const getDraft = useCallback((id: string) => drafts.current.get(id), []);
  const setDraft = useCallback((id: string, schedule: Schedule) => {
    drafts.current.set(id, schedule);
    setCount(drafts.current.size);
  }, []);
  const clearDraft = useCallback((id: string, expected?: Schedule) => {
    // A response from an earlier page must not clear a newer draft.
    if (expected && drafts.current.get(id) !== expected) return;
    drafts.current.delete(id);
    setCount(drafts.current.size);
  }, []);
  useEffect(() => {
    if (!count) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [count]);
  return (
    <TimetableDraftContext.Provider
      value={{ classId, setClassId, getDraft, setDraft, clearDraft }}
    >
      {children}
    </TimetableDraftContext.Provider>
  );
}
export function TimetableDraftProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <DraftSession key={user?.id ?? "logged-out"}>{children}</DraftSession>;
}
