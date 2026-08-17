import Link from 'next/link'

interface ProgressItem {
  sectionId: string
  completedAt: string | null
  lastPositionSeconds: number | null
  title?: string
  href: string
}

export default function ProgressList({ items }: { items: ProgressItem[] }) {
  if (items.length === 0) return <p className="text-sm">No progress yet.</p>
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.sectionId}>
          <Link href={p.href} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
            <span>{p.title ?? p.sectionId}</span>
            <span className="text-sm">{p.completedAt ? 'Completed ✓' : 'In progress'}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
