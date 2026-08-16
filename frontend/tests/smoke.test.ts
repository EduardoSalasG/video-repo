import { describe, it, expect } from 'vitest'
import { siteConfig } from '@/config/site'

describe('site config', () => {
  it('has an api url', () => {
    expect(siteConfig.apiUrl).toContain('http')
  })
})