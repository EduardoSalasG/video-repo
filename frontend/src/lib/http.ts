export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message)
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    let body: unknown
    try {
      body = await res.json()
      if (typeof body === 'object' && body && 'error' in body) {
        message = String((body as { error: unknown }).error)
      }
    } catch {
      /* no body */
    }
    throw new ApiError(res.status, message, body)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}