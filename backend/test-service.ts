import { CourseService } from './src/services/CourseService';

(async () => {
  try {
    const courses = await CourseService.findAllCourses();
    console.log('Courses:', courses);
  } catch (e) {
    console.error('Error:', e);
  }
})();