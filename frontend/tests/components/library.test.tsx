import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModuleCard from '@/components/library/ModuleCard'
import SectionItem from '@/components/library/SectionItem'

describe('ModuleCard', () => {
  it('renders title and section count', () => {
    render(<ModuleCard title="Mambo On2" sectionCount={4} href="/library/m1" />)
    expect(screen.getByText('Mambo On2')).toBeInTheDocument()
    expect(screen.getByText(/4 sections/)).toBeInTheDocument()
  })
})

describe('SectionItem', () => {
  it('renders a section title', () => {
    render(<SectionItem title="Basic Step" href="/library/m1/s1" completed={false} />)
    expect(screen.getByText('Basic Step')).toBeInTheDocument()
  })
})