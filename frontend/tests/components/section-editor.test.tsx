import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContentEditor from '@/components/admin/ContentEditor'

describe('ContentEditor', () => {
  it('renders a textarea with markdown', () => {
    render(<ContentEditor value="# Hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
