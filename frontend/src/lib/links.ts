import { fetchModules, fetchModule } from './api'

export interface SectionRef {
  moduleId: string
  sectionId: string
  title: string
}

/**
 * Resolve section ids to their module + title so links can point at
 * `/library/[moduleId]/[sectionId]`. The backend search/progress endpoints
 * only return `sectionId`, so we scan modules (and their sections) to build
 * the map. Falls back to a plain `/library/<sectionId>` link when a section
 * cannot be resolved.
 */
export async function resolveSectionRefs(token: string, sectionIds: string[]): Promise<Map<string, SectionRef>> {
  const refs = new Map<string, SectionRef>()
  if (sectionIds.length === 0) return refs

  const wanted = new Set(sectionIds)
  const data = await fetchModules(token, { page: 1, limit: 100 })

  for (const mod of data.modules) {
    if (wanted.size === 0) break
    let detail
    try {
      detail = await fetchModule(token, mod.id)
    } catch {
      continue
    }
    for (const section of detail.sections ?? []) {
      if (wanted.has(section.id)) {
        refs.set(section.id, { moduleId: mod.id, sectionId: section.id, title: section.title })
        wanted.delete(section.id)
      }
    }
  }

  return refs
}