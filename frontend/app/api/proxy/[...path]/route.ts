import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/config/site'
import { getSessionToken } from '@/lib/session'

const base = siteConfig.apiUrl

async function proxy(req: NextRequest, path: string, method: string) {
  const token = await getSessionToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = req.headers.get('content-type') ?? ''
  const isMultipart = contentType.includes('multipart/form-data')

  const res = await fetch(`${base}/${path}${req.nextUrl.search}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(contentType ? { 'Content-Type': contentType } : {}) },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (isMultipart ? req.body : await req.text()),
    ...(isMultipart ? { duplex: 'half' } : {}),
  })
  const text = await res.text()
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}

export function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'GET'))
}
export function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'POST'))
}
export function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'PATCH'))
}
export function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'DELETE'))
}