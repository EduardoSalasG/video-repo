
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import { CourseUserAccessController } from '../controllers/CourseUserAccessController';

const router = Router();

// Grant user access to course
router.post('/:courseId/access', 
  authenticateUser, 
  authorizePolicy('course:maintain'), 
  CourseUserAccessController.grantAccess
);

// Revoke user access to course
router.delete('/:courseId/access/:userId', 
  authenticateUser, 
  authorizePolicy('course:maintain'), 
  CourseUserAccessController.revokeAccess
);

// Get users with access to course
router.get('/:courseId/access', 
  authenticateUser, 
  authorizePolicy('course:read'), 
  CourseUserAccessController.getCourseUsers
);

export default router;

