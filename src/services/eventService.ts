import api from "./api";

export type EventAudience = "ALL" | "TEACHERS" | "CLASS";
export interface SchoolEvent {
  id: number;
  title: string;
  description?: string;
  eventAt: string;
  audience: EventAudience;
  classId?: number;
  className?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
}
export interface CreateSchoolEvent {
  title: string;
  description?: string;
  eventAt: string;
  audience: EventAudience;
  classId?: number;
}
export const getEvents = () => api.get<SchoolEvent[]>("/events");
export const createEvent = (data: CreateSchoolEvent) =>
  api.post<SchoolEvent>("/events", data);
export const deleteEvent = (id: number) => api.delete<void>(`/events/${id}`);
