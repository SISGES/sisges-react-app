import api from './api'

export interface Announcement {
  id: number
  title: string
  content: string | null
  type: 'TEXT' | 'IMAGE'
  imagePath: string | null
  targetRoles: string[]
  hiddenForRoles?: string[]
  activeFrom: string | null
  activeUntil: string | null
  createdAt: string
  likeCount: number
  likedByCurrentUser: boolean
  commentCount: number
}

export interface AnnouncementComment {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string }
}

export interface CreateAnnouncementRequest {
  title: string
  content?: string
  type: 'TEXT' | 'IMAGE'
  imagePath?: string
  hiddenForRoles?: string[]
  activeFrom?: string | null
  activeUntil?: string | null
}

export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  type?: 'TEXT' | 'IMAGE'
  imagePath?: string
  hiddenForRoles?: string[]
  activeFrom?: string | null
  activeUntil?: string | null
}

export async function getAnnouncementFeed(): Promise<Announcement[]> {
  return api.get<Announcement[]>('/announcements/feed')
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return api.get<Announcement[]>('/announcements')
}

export async function getAnnouncementById(id: number): Promise<Announcement> {
  return api.get<Announcement>(`/announcements/${id}`)
}

export async function createAnnouncement(
  data: CreateAnnouncementRequest
): Promise<Announcement> {
  return api.post<Announcement>('/announcements', data)
}

export async function updateAnnouncement(
  id: number,
  data: UpdateAnnouncementRequest
): Promise<Announcement> {
  return api.put<Announcement>(`/announcements/${id}`, data)
}

export async function deleteAnnouncement(id: number): Promise<void> {
  return api.delete(`/announcements/${id}`)
}

export async function toggleAnnouncementLike(id: number): Promise<{ liked: boolean }> {
  return api.post<{ liked: boolean }>(`/announcements/${id}/like`)
}

export async function getAnnouncementComments(id: number): Promise<AnnouncementComment[]> {
  return api.get<AnnouncementComment[]>(`/announcements/${id}/comments`)
}

export async function addAnnouncementComment(id: number, content: string): Promise<AnnouncementComment> {
  return api.post<AnnouncementComment>(`/announcements/${id}/comments`, { content })
}

export async function updateAnnouncementComment(announcementId: number, commentId: number, content: string): Promise<AnnouncementComment> {
  return api.put<AnnouncementComment>(`/announcements/${announcementId}/comments/${commentId}`, { content })
}

export async function deleteAnnouncementComment(announcementId: number, commentId: number): Promise<void> {
  return api.delete(`/announcements/${announcementId}/comments/${commentId}`)
}
