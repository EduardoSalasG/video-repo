import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-ink/70">The page you are looking for doesn&apos;t exist.</p>
      <Link
        href="/library"
        className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90"
      >
        Back to library
      </Link>
    </div>
  )
}