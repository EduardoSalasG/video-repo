import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('video_repo_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  })
  return response
}