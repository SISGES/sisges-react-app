import api from "./api";

export interface EvaluativeActivity {
  id: number;
  classMeetingId: number;
  title: string;
  description: string | null;
  filePath: string | null;
  createdAt: string;
}

export interface CreateEvaluativeActivityRequest {
  classMeetingId: number;
  title: string;
  description?: string;
  filePath?: string;
}

export interface ActivityGradebookStudent {
  studentId: number;
  userId: number;
  studentName: string;
  score: number | null;
}

export interface ActivityGradebook {
  activityId: number;
  classMeetingId: number;
  title: string;
  activityType: string;
  trimesterNumber: number | null;
  maxPoints: number;
  released: boolean;
  students: ActivityGradebookStudent[];
}

export interface ActivityGradeEntry {
  studentId: number;
  score: number | null;
}

export async function getActivitiesByMeeting(
  classMeetingId: number,
): Promise<EvaluativeActivity[]> {
  return api.get<EvaluativeActivity[]>(`/activities/meeting/${classMeetingId}`);
}

export async function getMyActivities(): Promise<EvaluativeActivity[]> {
  return api.get<EvaluativeActivity[]>("/activities/my");
}

export async function createActivity(
  data: CreateEvaluativeActivityRequest,
): Promise<EvaluativeActivity> {
  return api.post<EvaluativeActivity>("/activities", data);
}

export async function deleteActivity(id: number): Promise<void> {
  return api.delete(`/activities/${id}`);
}

export async function getActivityGradebook(
  id: number,
): Promise<ActivityGradebook> {
  return api.get<ActivityGradebook>(`/activities/${id}/gradebook`);
}

export async function saveActivityGrades(
  id: number,
  entries: ActivityGradeEntry[],
): Promise<ActivityGradebook> {
  return api.put<ActivityGradebook>(`/activities/${id}/grades`, { entries });
}

export async function releaseActivityGrades(id: number): Promise<void> {
  await api.post(`/activities/${id}/release`);
}
