export const SESSION_COOKIE = 'video_repo_token'

/**
 * Returns the value of the session cookie.
 * Works both on the server (using next/headers) and on the client
 * (reading from document.cookie).
 */
export async function getSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Server-side: use next/headers.
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get(SESSION_COOKIE)?.value ?? null
  }

  // Client-side: read from document.cookie.
  const match = document.cookie.match(
    new RegExp('(^| )' + SESSION_COOKIE + '=([^;]+)')
  )
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Sets the session cookie (server only).
 * On the client this is a no-op.
 */
export async function setSessionCookie(token: string): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: use next/headers to set the cookie
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    })
  }
}

/**
 * Clears the session cookie (server only).
 * On the client this is a no-op.
 */
export async function clearSessionCookie(): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: use next/headers to clear the cookie
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    })
  }
}