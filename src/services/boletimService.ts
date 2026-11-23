import { api } from "./api";
import type { AcademicCycleStatus } from "../utils/brDate";

export interface BoletimActivityCell {
  activityId: number;
  title: string;
  activityType: string;
  maxPoints: number;
  score: number | null;
  released: boolean;
}

export interface BoletimTrimesterRow {
  trimester: number;
  trimesterMaxPoints: number;
  minPercentage?: number;
  activities: BoletimActivityCell[];
  totalReleasedScore: number;
  allActivitiesReleased: boolean;
  eligibleForRecovery: boolean;
}

export interface StudentBoletim {
  cycleId?: number;
  availableCycles?: Array<{
    id: number;
    yearStartDate: string | null;
    yearEndDate: string | null;
    status: AcademicCycleStatus;
  }>;
  yearResult?: {
    baseScore: number;
    finalScore: number;
    approved: boolean;
    promoted: boolean;
  } | null;
  fixedApprovalPercentage: number;
  yearMaxPoints: number;
  totalReleasedScore: number;
  eligibleForYearRecovery: boolean;
  trimesters: BoletimTrimesterRow[];
  recoveryRow: {
    trimesterRecoveryScores: Array<number | null>;
    yearRecoveryScore: number | null;
  };
}

export async function getMyBoletim(cycleId?: number): Promise<StudentBoletim> {
  return api.get<StudentBoletim>(
    cycleId === undefined ? "/boletim/me" : `/boletim/me?cycleId=${cycleId}`,
  );
}
