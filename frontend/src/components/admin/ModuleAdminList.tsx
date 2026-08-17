import Link from 'next/link'

export default function ModuleAdminList({ modules }: { modules: { id: string; title: string; sectionCount?: number; href: string }[] }) {
  if (modules.length === 0) return <p className="text-sm">No modules yet.</p>
  return (
    <ul className="space-y-2">
      {modules.map((m) => (
        <li key={m.id} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
          <span>{m.title}</span>
          <div className="flex items-center gap-3 text-sm">
            <Link href={m.href}>Edit</Link>
            <Link href={`/admin/modules/${m.id}/sections/new`}>Add section</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
