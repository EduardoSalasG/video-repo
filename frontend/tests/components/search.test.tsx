import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchResults from '@/components/search/SearchResults'

describe('SearchResults', () => {
  it('renders result titles', () => {
    const mockResult = {
      id: 'v1',
      sectionId: 's1',
      steps: ['step1', 'step2'],
      difficulty: 'BEGINNER' as const,
      primaryStyle: 'MAMBO_ON2' as const,
      influences: ['influence1'],
      durationCounts: 10,
      videoType: 'STEP_BREAKDOWN' as const,
      tags: ['tag1'],
      fileSize: null,
      durationSeconds: null,
      filename: null,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    }
    render(<SearchResults results={[mockResult]} />)
    expect(screen.getAllByText(/MAMBO_ON2|BEGINNER/).length).toBeGreaterThan(0)
  })
})
