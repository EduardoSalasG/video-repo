import { redirect } from 'next/navigation'
import { fetchMe } from './api'
import { getSessionToken } from './session'
import type { Role, User } from '@/types'

export function hasRole(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role)
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null
  try {
    const { user } = await fetchMe(token)
    return user
  } catch {
    return null
  }
}

export async function requireUser(allowed: Role[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN']): Promise<{ user: User; token: string }> {
  const token = await getSessionToken()
  if (!token) redirect('/login')
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!hasRole(user.role, allowed)) redirect('/library')
  return { user, token }
}