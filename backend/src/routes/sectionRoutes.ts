import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { requireInstructor } from '../middleware/role'
import {
  getSections,
  getSectionById, getSectionByIdOnlyController,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from '../controllers/sectionController'

const router = Router()

// All authenticated users can read sections
router.get('/courses/:courseId/modules/:moduleId/sections', authenticateUser, getSections)
router.get('/courses/:courseId/modules/:moduleId/sections/:sectionId', authenticateUser, getSectionById)

// Only instructors and admins can write sections
router.post('/courses/:courseId/modules/:moduleId/sections', authenticateUser, requireInstructor, createSectionController)
router.patch('/courses/:courseId/modules/:moduleId/sections/:sectionId', authenticateUser, requireInstructor, updateSectionController)
router.delete('/courses/:courseId/modules/:moduleId/sections/:sectionId', authenticateUser, requireInstructor, deleteSectionController)
router.get("/section/:sectionId", authenticateUser, getSectionByIdOnlyController)

export default router