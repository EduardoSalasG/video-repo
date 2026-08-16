import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createModuleSchema,
  updateModuleSchema,
  moduleQuerySchema,
  moduleIdSchema,
} from '../validators/moduleValidators';
import {
  findAllModules,
  findModuleById,
  createModule,
  updateModule,
  deleteModule,
} from '../models/module';

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
 * Get a paginated list of modules
 */
export async function getModules(req: Request, res: Response): Promise<void> {
  try {
    const query = moduleQuerySchema.parse(req.query);
    const result = await findAllModules(query);
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
    const params = moduleIdSchema.parse(req.params);
    const module = await findModuleById(params.id);

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
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
    const parsedBody = createModuleSchema.parse(req.body);
    const module = await createModule(parsedBody);
    res.status(201).json(module);
  } catch (error) {
    console.error('Validation error in createModuleController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
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
    const params = moduleIdSchema.parse(req.params);
    const parsedBody = updateModuleSchema.parse(req.body);

    const module = await updateModule(params.id, parsedBody);
    res.json(module);
  } catch (error) {
    console.error('Validation error in updateModuleController:', error);
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

/**
 * Delete a module by id
 */
export async function deleteModuleController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = moduleIdSchema.parse(req.params);
    await deleteModule(params.id);
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