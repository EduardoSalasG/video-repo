import { NextResponse } from 'next/server'
import { login } from '@/lib/api'
import { ApiError } from '@/lib/http'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  try {
    const { accessToken, user } = await login(String(body.email), String(body.password))
    const response = NextResponse.json({ user }, { status: 200 })
    response.cookies.set('video_repo_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    return response
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Login failed' }, { status })
  }
}