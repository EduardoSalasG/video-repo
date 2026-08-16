import ModuleCard from './ModuleCard'
import type { Module } from '@/types'

export default function ModuleGrid({ modules }: { modules: Module[] }) {
  if (modules.length === 0) {
    return <p className="text-sm">No modules yet.</p>
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <ModuleCard key={m.id} title={m.title} sectionCount={m.sectionCount ?? 0} href={`/library/${m.id}`} />
      ))}
    </div>
  )
}