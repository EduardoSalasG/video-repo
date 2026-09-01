import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Admin - Module' }

export default function AdminModulePage() {
  // This page is deprecated - redirect to new structure
  redirect('/admin/courses')
}
