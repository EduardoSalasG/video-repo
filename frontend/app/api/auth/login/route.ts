import { NextResponse } from 'next/server'
import { login } from '@/lib/api'
import { setSessionCookie } from '@/lib/session'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  try {
    const { accessToken, user } = await login(String(body.email), String(body.password))
    await setSessionCookie(accessToken)
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    const status = err instanceof Error && /401/.test(err.message) ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Login failed' }, { status })
  }
}