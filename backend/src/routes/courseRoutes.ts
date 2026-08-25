import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();

router.get('/courses', CourseController.getAllCourses);
router.get('/courses/:id', CourseController.getCourseById);
router.post('/courses', CourseController.createCourse);
router.patch('/courses/:id', CourseController.updateCourse);
router.delete('/courses/:id', CourseController.deleteCourse);

export default router;