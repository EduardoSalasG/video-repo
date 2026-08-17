import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModuleAdminList from '@/components/admin/ModuleAdminList'

describe('ModuleAdminList', () => {
  it('renders modules with edit links', () => {
    render(<ModuleAdminList modules={[{ id: 'm1', title: 'Mambo On2', sectionCount: 2, href: '/admin/modules/m1' }]} />)
    expect(screen.getByText('Mambo On2')).toBeInTheDocument()
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
  })
})
