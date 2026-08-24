import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { searchVideos } from '@/lib/api'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const sp = await searchParams
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k])

  const data = await searchVideos(token, {
    search: one('search'),
    primaryStyle: one('primaryStyle'),
    difficulty: one('difficulty'),
    videoType: one('videoType'),
    page: Number(one('page') ?? '1'),
    limit: 12,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <SearchForm />
      <SearchResults results={data.videoMetadata} />
    </div>
  )
}
