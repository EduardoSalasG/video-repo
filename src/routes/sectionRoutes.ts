import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { requireInstructor } from '../middleware/role'
import {
  getSections,
  getSectionById,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from '../controllers/sectionController'

const router = Router()
router.use((req, res, next) => {
  console.log('sectionRoutes req.params:', req.params);
  next();
});

// All authenticated users can read sections
router.get('/modules/:moduleId/sections', authenticateUser, getSections)
router.get('/modules/:moduleId/sections/:sectionId', authenticateUser, getSectionById)

// Only instructors and admins can write sections
router.post('/modules/:moduleId/sections', authenticateUser, requireInstructor, createSectionController)
router.patch('/modules/:moduleId/sections/:sectionId', authenticateUser, requireInstructor, updateSectionController)
router.delete('/modules/:moduleId/sections/:sectionId', authenticateUser, requireInstructor, deleteSectionController)

export default router