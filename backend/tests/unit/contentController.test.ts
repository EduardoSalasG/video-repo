import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getContent,
  updateContent,
} from '../../src/controllers/contentController'
import { findSectionById, updateSection } from '../../src/models/section'
import { ModuleService } from '../../src/services/ModuleService'

vi.mock('../../src/models/section', () => ({
  findSectionById: vi.fn(),
  updateSection: vi.fn(),
}))

vi.mock('../../src/services/ModuleService', () => ({
  ModuleService: { findModuleById: vi.fn() },
}))

describe('contentController', () => {
  const section = {
    id: 'section-1',
    moduleId: 'module-1',
    markdownContent: '# Original',
  }
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      body: {},
      params: {
        courseId: 'course-1',
        moduleId: 'module-1',
        sectionId: 'section-1',
      },
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    vi.clearAllMocks()
    vi.mocked(ModuleService.findModuleById).mockResolvedValue({
      courseId: 'course-1',
    } as never)
  })

  it('gets the markdown content from the requested section in its module', async () => {
    vi.mocked(findSectionById).mockResolvedValue(section as never)

    await getContent(req, res)

    expect(findSectionById).toHaveBeenCalledWith('section-1', 'module-1')
    expect(res.json).toHaveBeenCalledWith({ markdownContent: '# Original' })
  })

  it('updates markdown content only after validating the nested module hierarchy', async () => {
    vi.mocked(updateSection).mockResolvedValue({
      ...section,
      markdownContent: '# Updated',
    } as never)
    req.body = { markdownContent: '# Updated' }

    await updateContent(req, res)

    expect(ModuleService.findModuleById).toHaveBeenCalledWith('module-1')
    expect(updateSection).toHaveBeenCalledWith(
      'section-1',
      { markdownContent: '# Updated' },
      'module-1'
    )
    expect(res.json).toHaveBeenCalledWith({ markdownContent: '# Updated' })
  })

  it('rejects a section request missing its nested module id', async () => {
    req.params = { courseId: 'course-1', sectionId: 'section-1' }

    await getContent(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})
