import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressList from '@/components/progress/ProgressList'

describe('ProgressList', () => {
  it('shows empty state', () => {
    render(<ProgressList items={[]} />)
    expect(screen.getByText(/no progress/i)).toBeInTheDocument()
  })

  it('shows a completed item', () => {
    render(<ProgressList items={[{ sectionId: 's1', completedAt: '2026-01-01', lastPositionSeconds: null, href: '/x' }]} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
