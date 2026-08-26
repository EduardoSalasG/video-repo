
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getSections,
  getSectionById, getSectionByIdOnlyController,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from '../controllers/sectionController';

const router = Router({ mergeParams: true });

// All authenticated users can read sections in courses they have access to
router.get('/', authenticateUser, authorizePolicy('section:read'), getSections);
router.get('/:sectionId', authenticateUser, authorizePolicy('section:read'), getSectionById);

// Users with WRITE access to course can create sections
router.post('/', authenticateUser, authorizePolicy('section:create'), createSectionController);

// Users with WRITE access to course can update sections
router.patch('/:sectionId', authenticateUser, authorizePolicy('section:update'), updateSectionController);

// Users with MAINTAIN access to course can delete sections (logic delete)
router.delete('/:sectionId', authenticateUser, authorizePolicy('section:delete'), deleteSectionController);
router.get('/section/:sectionId', authenticateUser, authorizePolicy('section:read'), getSectionByIdOnlyController);

export default router;

