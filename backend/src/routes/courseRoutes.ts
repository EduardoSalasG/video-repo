
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import { CourseController } from '../controllers/CourseController';

const router = Router();

// All authenticated users can read courses they have access to
router.get('/', authenticateUser, authorizePolicy('course:read'), CourseController.getAllCourses);
router.get('/:id', authenticateUser, authorizePolicy('course:read'), CourseController.getCourseById);

// Only admins can create courses
router.post('/', authenticateUser, authorizePolicy('course:create'), CourseController.createCourse);

// Only admins can update courses
router.patch('/:id', authenticateUser, authorizePolicy('course:update'), CourseController.updateCourse);

// Only admins can delete courses (logic delete)
router.delete('/:id', authenticateUser, authorizePolicy('course:delete'), CourseController.deleteCourse);

export default router;

