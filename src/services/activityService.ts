import api from './api'

export interface EvaluativeActivity {
  id: number
  classMeetingId: number
  title: string
  description: string | null
  filePath: string | null
  createdAt: string
}

export interface CreateEvaluativeActivityRequest {
  classMeetingId: number
  title: string
  description?: string
  filePath?: string
}

export async function getActivitiesByMeeting(classMeetingId: number): Promise<EvaluativeActivity[]> {
  return api.get<EvaluativeActivity[]>(`/activities/meeting/${classMeetingId}`)
}

export async function getMyActivities(): Promise<EvaluativeActivity[]> {
  return api.get<EvaluativeActivity[]>('/activities/my')
}

export async function createActivity(data: CreateEvaluativeActivityRequest): Promise<EvaluativeActivity> {
  return api.post<EvaluativeActivity>('/activities', data)
}

export async function deleteActivity(id: number): Promise<void> {
  return api.delete(`/activities/${id}`)
}
