import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { authorizePolicy } from '../middleware/authorizePolicy'
import {
  getUserModules,
  getUserModuleById,
} from '../controllers/userModuleController'

const router = Router()

// Get all modules accessible to the current user (no policy needed - handled in controller)
router.get('/', authenticateUser, getUserModules)

// Get a specific module by ID (if user has access)
router.get(
  '/:moduleId',
  authenticateUser,
  authorizePolicy('module:read'),
  getUserModuleById
)

export default router
