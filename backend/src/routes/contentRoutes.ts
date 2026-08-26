
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getContents,
  getContentById,
  createContentController,
  updateContentController,
  deleteContentController,
} from '../controllers/contentController';

const router = Router();

// All authenticated users can read content in sections they have access to
router.get('/', authenticateUser, authorizePolicy('content:read'), getContents);
router.get('/:contentId', authenticateUser, authorizePolicy('content:read'), getContentById);

// Users with WRITE access to course can create content
router.post('/', authenticateUser, authorizePolicy('content:create'), createContentController);

// Users with WRITE access to course can update content
router.patch('/:contentId', authenticateUser, authorizePolicy('content:update'), updateContentController);

// Users with MAINTAIN access to course can delete content (logic delete)
router.delete('/:contentId', authenticateUser, authorizePolicy('content:delete'), deleteContentController);

export default router;

