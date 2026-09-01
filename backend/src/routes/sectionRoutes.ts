import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { authorizePolicy } from '../middleware/authorizePolicy'
import {
  getSections,
  getSectionById,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from '../controllers/sectionController'

const router = Router({ mergeParams: true })

// All authenticated users can read sections in courses they have access to
router.get('/', authenticateUser, authorizePolicy('module:read'), getSections)
router.get(
  '/:sectionId',
  authenticateUser,
  authorizePolicy('module:read'),
  getSectionById
)

// Users with WRITE access to course can create sections
router.post(
  '/',
  authenticateUser,
  authorizePolicy('module:update'),
  createSectionController
)

// Users with WRITE access to course can update sections
router.patch(
  '/:sectionId',
  authenticateUser,
  authorizePolicy('module:update'),
  updateSectionController
)

// Users with MAINTAIN access to course can delete sections (logic delete)
router.delete(
  '/:sectionId',
  authenticateUser,
  authorizePolicy('module:delete'),
  deleteSectionController
)

export default router
