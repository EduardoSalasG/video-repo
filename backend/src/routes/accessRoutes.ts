import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { authorizePolicy } from '../middleware/authorizePolicy'
import {
  grantAccess,
  revokeAccess,
  getCourseUsers,
} from '../controllers/CourseUserAccessController'

const router = Router()

// Grant user access to course
router.post(
  '/:courseId/access',
  authenticateUser,
  authorizePolicy('course:maintain'),
  grantAccess
)

// Revoke user access to course
router.delete(
  '/:courseId/access/:userId',
  authenticateUser,
  authorizePolicy('course:maintain'),
  revokeAccess
)

// Get users with access to course
router.get(
  '/:courseId/access',
  authenticateUser,
  authorizePolicy('course:read'),
  getCourseUsers
)

export default router
