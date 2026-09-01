import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'New section' }

export default function NewSectionPage() {
  // This page is deprecated - redirect to new structure
  redirect('/admin/courses')
}
