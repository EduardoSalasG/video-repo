import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import {
  getProgress,
  updateProgress,
  markProgressComplete,
  getAllProgress,
} from '../controllers/progressController'

const router = Router()

// Get the current user's progress for a section
router.get('/sections/:sectionId/progress', authenticateUser, getProgress)

// Upsert the current user's progress for a section
router.patch('/sections/:sectionId/progress', authenticateUser, updateProgress)

// Mark the current user's section as complete
router.patch('/sections/:sectionId/progress/complete', authenticateUser, markProgressComplete)

// Get a paginated list of the current user's progress
router.get('/progress', authenticateUser, getAllProgress)

export default router