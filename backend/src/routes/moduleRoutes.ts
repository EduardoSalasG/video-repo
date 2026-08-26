
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getModules,
  getModuleById,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from '../controllers/moduleController';

const router = Router({ mergeParams: true });

// All authenticated users can read modules in courses they have access to
router.get('/', authenticateUser, authorizePolicy('module:read'), getModules);
router.get('/:moduleId', authenticateUser, authorizePolicy('module:read'), getModuleById);

// Users with WRITE access to course can create modules
router.post('/', authenticateUser, authorizePolicy('module:create'), createModuleController);

// Users with WRITE access to course can update modules
router.patch('/:moduleId', authenticateUser, authorizePolicy('module:update'), updateModuleController);

// Users with MAINTAIN access to course can delete modules (logic delete)
router.delete('/:moduleId', authenticateUser, authorizePolicy('module:delete'), deleteModuleController);

export default router;

