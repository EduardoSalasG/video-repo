import Link from 'next/link'

export default function ModuleCard({ title, sectionCount, href }: { title: string; sectionCount: number; href: string }) {
  return (
    <Link href={href} className="block rounded-2xl bg-surface-raised p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm">{sectionCount} sections</p>
    </Link>
  )
}