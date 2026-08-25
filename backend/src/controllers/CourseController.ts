import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';

export class CourseController {
  static async getAllCourses(_req: Request, res: Response) {
    const courses = await CourseService.findAllCourses();
    res.json({ courses });
  }

  static async getCourseById(req: Request, res: Response) {
    const { id } = req.params;
    const course = await CourseService.findCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  }

  static async createCourse(req: Request, res: Response) {
    const { name, description } = req.body;
    const course = await CourseService.createCourse({ name, description });
    res.status(201).json(course);
  }

  static async updateCourse(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body;
    const course = await CourseService.updateCourse(id, { name, description });
    res.json(course);
  }

  static async deleteCourse(req: Request, res: Response) {
    const { id } = req.params;
    await CourseService.deleteCourse(id);
    res.status(204).send();
  }
}