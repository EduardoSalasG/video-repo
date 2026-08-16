import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <p className="text-sm font-medium tracking-wide text-accent uppercase">
          Structured video lessons
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Learn to dance, one guided video at a time.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          Mambo On2, Casino, and Sensual Bachata — broken into clear modules and
          sections with practice guidance at every step.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/library"
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Browse the library
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-surface-raised px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:ring-ink/30"
          >
            Start free
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-raised p-6">
            <h2 className="text-lg font-semibold">Structured modules</h2>
            <p className="mt-2 text-sm text-ink/70">
              Curricula organized from foundations to advanced patterns, so you
              always know what to practice next.
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised p-6">
            <h2 className="text-lg font-semibold">Guided sections</h2>
            <p className="mt-2 text-sm text-ink/70">
              Short video lessons with markdown notes and clear completion
              checkpoints to build a steady habit.
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised p-6">
            <h2 className="text-lg font-semibold">Progress you can see</h2>
            <p className="mt-2 text-sm text-ink/70">
              Track what you have covered across each style and pick up exactly
              where you left off.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}