import { Request, Response } from 'express';
import { z } from 'zod';
import {
  progressSectionIdSchema,
  updateProgressSchema,
  markProgressCompleteSchema,
  progressQuerySchema,
} from '../validators/progressValidators';
import {
  upsertUserProgress,
  getUserProgressBySection,
  findAllUserProgress,
} from '../models/userProgress';

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

function isPrismaForeignKey(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2003'
  );
}

function getUserId(req: Request): string | undefined {
  const user = (req as { user?: { id?: string } }).user;
  return user?.id;
}

/**
 * Get progress for the current user on a single section
 */
export async function getProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const params = progressSectionIdSchema.parse(req.params);
    const progress = await getUserProgressBySection(userId, params.sectionId);

    if (!progress) {
      res.status(404).json({ error: 'Progress not found for this section' });
      return;
    }

    res.json(progress);
  } catch (error) {
    console.error('Validation error in getProgress:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Upsert progress for the current user on a section
 */
export async function updateProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const params = progressSectionIdSchema.parse(req.params);
    const parsedBody = updateProgressSchema.parse(req.body);
    const progress = await upsertUserProgress(userId, params.sectionId, parsedBody);
    res.json(progress);
  } catch (error) {
    console.error('Validation error in updateProgress:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (isPrismaForeignKey(error)) {
      res.status(404).json({ error: 'Section not found' });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Progress not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Mark the current user's section as complete
 */
export async function markProgressComplete(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const params = progressSectionIdSchema.parse(req.params);
    const parsedBody = markProgressCompleteSchema.parse(req.body);
    const progress = await upsertUserProgress(userId, params.sectionId, {
      completedAt: parsedBody.completedAt ?? new Date(),
    });
    res.json(progress);
  } catch (error) {
    console.error('Validation error in markProgressComplete:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (isPrismaForeignKey(error)) {
      res.status(404).json({ error: 'Section not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Get a paginated list of the current user's progress
 */
export async function getAllProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const query = progressQuerySchema.parse(req.query);
    const result = await findAllUserProgress(userId, query);
    res.json(result);
  } catch (error) {
    console.error('Validation error in getAllProgress:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}