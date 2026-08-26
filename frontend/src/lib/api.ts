import { siteConfig } from '@/config/site'
import { http } from './http'
import type { Module, Pagination, ProgressRecord, Section, User, VideoMetadata } from '@/types'

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(path, siteConfig.apiUrl)
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  return url.toString()
}

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export async function apiFetch<T>(path: string, opts: { token: string; method?: string; query?: Record<string, string | number | undefined>; body?: unknown } = { token: '' }): Promise<T> {
  const headers: Record<string, string> = { ...auth(opts.token) }
  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  return http<T>(buildUrl(path, opts.query), { method: opts.method ?? 'GET', headers, body })
}

export interface ListResult<T> { items: T[]; pagination: Pagination }

// Auth
export function login(email: string, password: string) {
  return apiFetch<{ accessToken: string; user: User }>('/auth/login', {
    token: '', method: 'POST', body: { email, password },
  })
}
export function register(payload: { email: string; username: string; firstName: string; lastName: string; password: string; role?: string }) {
  return apiFetch<{ accessToken: string; user: User }>('/auth/register', {
    token: '', method: 'POST', body: payload,
  })
}
export function fetchMe(token: string) {
  return apiFetch<{ user: User }>('/auth/me', { token })
}

// Courses
export function fetchCourses(token: string, query?: { page?: number; limit?: number }) {
  return apiFetch<{ courses: { id: string; name: string; description: string | null }[]; pagination: Pagination }>('/courses', { token, query })
}
export function fetchCourse(token: string, id: string) {
  return apiFetch<{ id: string; name: string; description: string | null }>(`/courses/${id}`, { token })
}
export function createCourse(token: string, body: { name: string; description?: string }) {
  return apiFetch<{ id: string; name: string; description: string | null }>('/courses', { token, method: 'POST', body })
}
export function updateCourse(token: string, id: string, body: { name?: string; description?: string | null }) {
  return apiFetch<{ id: string; name: string; description: string | null }>(`/courses/${id}`, { token, method: 'PATCH', body })
}
export function deleteCourse(token: string, id: string) {
  return apiFetch<void>(`/courses/${id}`, { token, method: 'DELETE' })
}

// Modules (nested under courses)
export function fetchModules(token: string, courseId: string, query?: { page?: number; limit?: number; search?: string }) {
  return apiFetch<{ modules: Module[]; pagination: Pagination }>(`/courses/${courseId}/modules`, { token, query })
}
export function fetchModule(token: string, courseId: string, moduleId: string) {
  return apiFetch<Module>(`/courses/${courseId}/modules/${moduleId}`, { token })
}
export function createModule(token: string, courseId: string, body: { title: string; description?: string; orderIndex?: number }) {
  return apiFetch<Module>(`/courses/${courseId}/modules`, { token, method: 'POST', body })
}
export function updateModule(token: string, courseId: string, moduleId: string, body: { title?: string; description?: string | null; orderIndex?: number }) {
  return apiFetch<Module>(`/courses/${courseId}/modules/${moduleId}`, { token, method: 'PATCH', body })
}
export function deleteModule(token: string, courseId: string, moduleId: string) {
  return apiFetch<void>(`/courses/${courseId}/modules/${moduleId}`, { token, method: 'DELETE' })
}

// Sections (nested under courses and modules)
export function fetchSections(token: string, courseId: string, moduleId: string, query?: { page?: number; limit?: number; search?: string }) {
  return apiFetch<{ sections: Section[]; pagination: Pagination }>(`/courses/${courseId}/modules/${moduleId}/sections`, { token, query })
}
export function fetchSection(token: string, courseId: string, moduleId: string, sectionId: string) {
  return apiFetch<Section>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}`, { token })
}
export function createSection(token: string, courseId: string, moduleId: string, body: { title: string; description?: string; orderIndex?: number; videoUrl?: string; markdownContent?: string }) {
  return apiFetch<Section>(`/courses/${courseId}/modules/${moduleId}/sections`, { token, method: 'POST', body })
}
export function updateSection(token: string, courseId: string, moduleId: string, sectionId: string, body: { title?: string; description?: string | null; orderIndex?: number; videoUrl?: string | null; markdownContent?: string | null }) {
  return apiFetch<Section>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}`, { token, method: 'PATCH', body })
}
export function deleteSection(token: string, courseId: string, moduleId: string, sectionId: string) {
  return apiFetch<void>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}`, { token, method: 'DELETE' })
}

// Content
export function fetchContent(token: string, courseId: string, moduleId: string, sectionId: string) {
  return apiFetch<{ markdownContent: string }>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/content`, { token })
}
export function updateContent(token: string, courseId: string, moduleId: string, sectionId: string, markdownContent: string | null) {
  return apiFetch<{ markdownContent: string }>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/content`, { token, method: 'PATCH', body: { markdownContent } })
}

// Video metadata
export function fetchVideoMetadata(token: string, courseId: string, moduleId: string, sectionId: string) {
  return apiFetch<VideoMetadata>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token })
}
export function createVideoMetadata(token: string, courseId: string, moduleId: string, sectionId: string, body: Omit<VideoMetadata, 'id' | 'createdAt' | 'updatedAt' | 'fileSize' | 'durationSeconds' | 'filename'> & { fileSize?: number | null; durationSeconds?: number | null; filename?: string | null }) {
  return apiFetch<VideoMetadata>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'POST', body: { ...body, sectionId } })
}
export function updateVideoMetadata(token: string, courseId: string, moduleId: string, sectionId: string, body: Partial<Omit<VideoMetadata, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>>) {
  return apiFetch<VideoMetadata>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'PATCH', body })
}
export function deleteVideoMetadata(token: string, courseId: string, moduleId: string, sectionId: string) {
  return apiFetch<void>(`/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'DELETE' })
}
export function uploadVideo(token: string, courseId: string, moduleId: string, sectionId: string, file: File) {
  const form = new FormData()
  form.append('video', file)
  return http<{ message: string; videoMetadata: VideoMetadata }>(`${siteConfig.apiUrl}/courses/${courseId}/modules/${moduleId}/sections/${sectionId}/upload-video`, {
    method: 'POST',
    headers: auth(token),
    body: form,
  })
}

// Search (supports courseId filter)
export function searchVideos(token: string, query: { search?: string; primaryStyle?: string; difficulty?: string; videoType?: string; courseId?: string; page?: number; limit?: number }) {
  return apiFetch<{ videoMetadata: VideoMetadata[]; pagination: Pagination }>('/search', { token, query })
}

// Progress (sectionId still works directly)
export function fetchProgress(token: string, sectionId: string) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress`, { token })
}
export function updateProgress(token: string, sectionId: string, body: { completedAt?: string | null; lastPositionSeconds?: number | null }) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress`, { token, method: 'PATCH', body })
}
export function completeProgress(token: string, sectionId: string) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress/complete`, { token, method: 'PATCH', body: {} })
}
export function fetchAllProgress(token: string, query?: { page?: number; limit?: number }) {
  return apiFetch<{ progress: ProgressRecord[]; pagination: Pagination }>('/progress', { token, query })
}