import { api } from "./api";

export interface AcademicCycle {
  id?: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
  yearStartDate: string | null;
  yearEndDate: string | null;
  currentTrimester: number;
  gradingLocked: boolean;
  yearStartedAt: string | null;
  yearFinishedAt: string | null;
}

export interface PendingRelease {
  trimester: number | null;
  teachers: string[];
}

export async function getAcademicCycle(): Promise<AcademicCycle> {
  return api.get<AcademicCycle>("/academic-cycle");
}

export async function startAcademicYear(
  yearEndDate: string,
  expectedCycleId?: number,
): Promise<AcademicCycle> {
  return api.post<AcademicCycle>("/academic-cycle/start-year", {
    yearEndDate,
    expectedCycleId,
  });
}

interface CycleVersion {
  expectedCycleId?: number;
  expectedTrimester?: number;
}

export async function endTrimester(
  password: string,
  version?: CycleVersion,
): Promise<AcademicCycle> {
  return api.post<AcademicCycle>("/academic-cycle/end-trimester", {
    password,
    ...version,
  });
}

export async function endYear(
  password: string,
  version?: CycleVersion,
): Promise<AcademicCycle> {
  return api.post<AcademicCycle>("/academic-cycle/end-year", {
    password,
    ...version,
  });
}

export async function getPendingReleases(
  trimester?: number,
): Promise<PendingRelease> {
  const suffix = trimester ? `?trimester=${trimester}` : "";
  return api.get<PendingRelease>(`/academic-cycle/pending-releases${suffix}`);
}
