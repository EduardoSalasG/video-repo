'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function VideoUpload({ moduleId, sectionId }: { moduleId: string; sectionId: string }) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    const form = new FormData(e.currentTarget)
    const file = form.get('video') as File
    if (!file || file.size === 0) {
      setStatus('Choose a video file.')
      setLoading(false)
      return
    }
    const body = new FormData()
    body.append('video', file)
    const res = await fetch(`/api/proxy/modules/${moduleId}/sections/${sectionId}/upload-video`, { method: 'POST', body })
    setLoading(false)
    setStatus(res.ok ? 'Upload complete.' : `Upload failed (${res.status}).`)
  }

  return (
    <form onSubmit={onUpload} className="space-y-4">
      <input type="file" name="video" accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv" />
      <Button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Upload video'}</Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}
