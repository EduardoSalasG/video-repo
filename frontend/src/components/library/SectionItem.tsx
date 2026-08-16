import Link from 'next/link'

export default function SectionItem({ title, href, completed }: { title: string; href: string; completed: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3 transition hover:bg-surface-raised/70">
      <span>{title}</span>
      {completed && <span className="text-sm text-green-600">✓ Completed</span>}
    </Link>
  )
}