import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Library' }

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
      <p>Modules will appear here.</p>
      <Link href="/admin" className="text-accent">Go to admin</Link>
    </div>
  )
}