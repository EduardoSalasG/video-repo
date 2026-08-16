import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { requireInstructor } from '../middleware/role'
import {
  getModules,
  getModuleById,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from '../controllers/moduleController'

const router = Router()

// All authenticated users can read modules
router.get('/', authenticateUser, getModules)
router.get('/:id', authenticateUser, getModuleById)

// Only instructors and admins can write modules
router.post('/', authenticateUser, requireInstructor, createModuleController)
router.patch('/:id', authenticateUser, requireInstructor, updateModuleController)
router.delete('/:id', authenticateUser, requireInstructor, deleteModuleController)

export default router