import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompleteButton from '@/components/library/CompleteButton'

describe('CompleteButton', () => {
  it('renders complete state', () => {
    render(<CompleteButton sectionId="s1" completed={true} onComplete={() => {}} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
