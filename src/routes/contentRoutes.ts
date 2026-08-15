import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { requireInstructor } from '../middleware/role'
import {
  getContent,
  updateContent,
} from '../controllers/contentController'

const router = Router()
router.use((req, res, next) => {
  console.log('contentRoutes req.params:', req.params);
  next();
});

// Get markdown content for a section - accessible to all authenticated users
router.get('/modules/:moduleId/sections/:sectionId/content', authenticateUser, getContent)

// Update markdown content for a section - requires instructor or admin
router.patch('/modules/:moduleId/sections/:sectionId/content', authenticateUser, requireInstructor, updateContent)

export default router