import { api } from "./api";

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
  activities: BoletimActivityCell[];
  totalReleasedScore: number;
  allActivitiesReleased: boolean;
  eligibleForRecovery: boolean;
}

export interface StudentBoletim {
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

export async function getMyBoletim(): Promise<StudentBoletim> {
  return api.get<StudentBoletim>("/boletim/me");
}
