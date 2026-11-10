import { api } from "./api";
export const LESSON_TIMES = [
  ["07:00", "07:50"],
  ["07:50", "08:40"],
  ["08:40", "09:30"],
  ["09:45", "10:35"],
  ["10:35", "11:25"],
] as const;
export const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
export interface ScheduleSlot {
  weekday: number;
  slot: number;
  disciplineId: number;
}
export interface Schedule {
  revision: number;
  slots: ScheduleSlot[];
}
export interface LessonAttachment {
  name: string;
  path: string;
}
export interface DailyLesson {
  slot: number;
  disciplineId: number;
  disciplineName: string;
  startTime: string;
  endTime: string;
  meetingId: number | null;
  content: string;
  attachments: LessonAttachment[];
}
export const getSchedule = (id: number) =>
  api.get<Schedule>(`/classes/${id}/schedule`);
export const saveSchedule = (id: number, data: Schedule) =>
  api.put<Schedule>(`/classes/${id}/schedule`, data);
export const getLessonDay = (id: number, date: string) =>
  api.get<DailyLesson[]>(
    `/classes/${id}/lesson-day?date=${encodeURIComponent(date)}`,
  );
export const saveLessonRecord = (
  id: number,
  data: {
    date: string;
    slot: number;
    disciplineId: number;
    content: string;
    attachments: LessonAttachment[];
  },
) => api.put<{ id: number }>(`/classes/${id}/lesson-day`, data);
