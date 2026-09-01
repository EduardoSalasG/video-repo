import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Admin - Section' }

export default function AdminSectionPage() {
  // This page is deprecated - redirect to new structure
  redirect('/admin/courses')
}
