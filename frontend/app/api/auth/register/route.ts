import { NextResponse } from 'next/server'
import { register } from '@/lib/api'
import { ApiError } from '@/lib/http'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.username || !body?.password || !body?.firstName || !body?.lastName) {
    return NextResponse.json({ error: 'Email, username, password, first name and last name are required' }, { status: 400 })
  }
  try {
    const { accessToken, user } = await register({
      email: String(body.email),
      username: String(body.username),
      password: String(body.password),
      firstName: String(body.firstName),
      lastName: String(body.lastName),
    })
    const response = NextResponse.json({ user }, { status: 201 })
    response.cookies.set('video_repo_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    return response
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Registration failed' }, { status })
  }
}