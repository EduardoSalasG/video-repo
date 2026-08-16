export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type PrimaryStyle = 'MAMBO_ON2' | 'CASINO' | 'SENSUAL_BACHATA'
export type VideoType = 'STEP_BREAKDOWN' | 'COMBINATION' | 'FULL_PATTERN' | 'SHINES_SEQUENCE'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
  sectionCount?: number
  sections?: Section[]
}

export interface Section {
  id: string
  moduleId: string
  title: string
  description: string | null
  orderIndex: number
  videoUrl: string | null
  markdownContent: string | null
  createdAt: string
  updatedAt: string
}

export interface VideoMetadata {
  id: string
  sectionId: string
  steps: string[]
  difficulty: Difficulty
  primaryStyle: PrimaryStyle
  influences: string[]
  durationCounts: number
  videoType: VideoType
  tags: string[]
  fileSize: number | null
  durationSeconds: number | null
  filename: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgressRecord {
  id: string
  userId: string
  sectionId: string
  completedAt: string | null
  lastPositionSeconds: number | null
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}