
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getProgress,
  getProgressById,
  createProgressController,
  updateProgressController,
  deleteProgressController,
} from '../controllers/progressController';

const router = Router();

// All authenticated users can read their own progress
router.get('/', authenticateUser, authorizePolicy('progress:read'), getProgress);
router.get('/:progressId', authenticateUser, authorizePolicy('progress:read'), getProgressById);

// Users with WRITE access to course can create progress (for themselves or others if instructor?)
router.post('/', authenticateUser, authorizePolicy('progress:create'), createProgressController);

// Users with WRITE access to course can update progress
router.patch('/:progressId', authenticateUser, authorizePolicy('progress:update'), updateProgressController);

// Users with MAINTAIN access to course can delete progress (logic delete)
router.delete('/:progressId', authenticateUser, authorizePolicy('progress:delete'), deleteProgressController);

export default router;

