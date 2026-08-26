import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createModuleSchema,
  updateModuleSchema,
  moduleQuerySchema,
  courseIdSchema,
  courseModuleIdsSchema,
} from '../validators/moduleValidators';
import { ModuleService } from '../services/ModuleService';

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

function zodErrorDetails(error: z.ZodError): unknown {
  return (error as z.ZodError & { issues?: unknown }).issues ??
    (error as z.ZodError & { errors?: unknown }).errors;
}

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2025'
  );
}

/**
 * Get a paginated list of modules for a course
 */
export async function getModules(req: Request, res: Response): Promise<void> {
  try {
    const courseIdParams = courseIdSchema.parse(req.params); // Validate courseId
    const query = moduleQuerySchema.parse(req.query);
    const result = await ModuleService.findAllModules({
      ...query,
      courseId: courseIdParams.courseId,
    });
    res.json(result);
  } catch (error) {
    console.error('Validation error in getModules:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Get a single module by id (includes its sections)
 */
export async function getModuleById(req: Request, res: Response): Promise<void> {
  try {
    const params = courseModuleIdsSchema.parse(req.params); // Validate both courseId and moduleId
    const module = await ModuleService.findModuleById(params.moduleId);
    
    // Additional validation: ensure module belongs to course
    if (module && module.courseId !== params.courseId) {
      return res.status(404).json({ error: 'Module not found in course' });
    }
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Validation error in getModuleById:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Create a new module
 */
export async function createModuleController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const courseIdParams = courseIdSchema.parse(req.params); // Validate courseId
    const parsedBody = createModuleSchema.parse(req.body);
    const module = await ModuleService.createModule({
      ...parsedBody,
      courseId: courseIdParams.courseId,
    });
    res.status(201).json(module);
  } catch (error) {
    console.error('Validation error in createModuleController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
} else if (error instanceof Error && error.message === 'Course not found') {
      res.status(404).json({ error: 'Course not found' });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Module not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Update an existing module
 */
export async function updateModuleController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = courseModuleIdsSchema.parse(req.params); // Validate both courseId and moduleId
    const parsedBody = updateModuleSchema.parse(req.body);
    
    const module = await ModuleService.updateModule(params.moduleId, {
      ...parsedBody,
      courseId: params.courseId, // This will validate course exists
    });
    res.status(200).json(module);
  } catch (error) {
    console.error('Validation error in updateModuleController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (error instanceof Error && error.message === 'Course not found') {
      res.status(404).json({ error: 'Course not found' });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Module not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Delete a module by id
 */
export async function deleteModuleController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = courseModuleIdsSchema.parse(req.params); // Validate both courseId and moduleId
    await ModuleService.deleteModule(params.moduleId);
    res.status(204).send();
  } catch (error) {
    console.error('Validation error in deleteModuleController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Module not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}