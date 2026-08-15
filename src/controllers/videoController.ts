import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createVideoMetadataSchema,
  updateVideoMetadataSchema,
  videoMetadataQuerySchema,
  videoMetadataIdSchema,
} from '../validators/videoValidators';
import {
  findAllVideoMetadata,
  findVideoMetadataById,
  findVideoMetadataBySectionId,
  createVideoMetadata,
  updateVideoMetadata,
  deleteVideoMetadata,
} from '../models/videoMetadata';

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
 * Get a paginated list of video metadata
 */
export async function getVideoMetadata(req: Request, res: Response): Promise<void> {
  try {
    const query = videoMetadataQuerySchema.parse(req.query);
    const result = await findAllVideoMetadata(query);
    res.json(result);
  } catch (error) {
    console.error('Validation error in getVideoMetadata:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Get a single video metadata by id
 */
export async function getVideoMetadataById(req: Request, res: Response): Promise<void> {
  try {
    const params = videoMetadataIdSchema.parse(req.params);
    const videoMetadata = await findVideoMetadataById(params.id);
    
    if (!videoMetadata) {
      res.status(404).json({ error: 'Video metadata not found' });
      return;
    }
    
    res.json(videoMetadata);
  } catch (error) {
    console.error('Validation error in getVideoMetadataById:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Get video metadata by section id
 */
export async function getVideoMetadataBySectionId(req: Request, res: Response): Promise<void> {
  try {
    const params = videoMetadataIdSchema.parse(req.params);
    const videoMetadata = await findVideoMetadataBySectionId(params.id);
    
    if (!videoMetadata) {
      res.status(404).json({ error: 'Video metadata not found for this section' });
      return;
    }
    
    res.json(videoMetadata);
  } catch (error) {
    console.error('Validation error in getVideoMetadataBySectionId:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Create a new video metadata
 */
export async function createVideoMetadataController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedBody = createVideoMetadataSchema.parse(req.body);
    const videoMetadata = await createVideoMetadata(parsedBody);
    res.status(201).json(videoMetadata);
  } catch (error) {
    console.error('Validation error in createVideoMetadataController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Update an existing video metadata
 */
export async function updateVideoMetadataController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = videoMetadataIdSchema.parse(req.params);
    const parsedBody = updateVideoMetadataSchema.parse(req.body);
    
    const videoMetadata = await updateVideoMetadata(params.id, parsedBody);
    res.json(videoMetadata);
  } catch (error) {
    console.error('Validation error in updateVideoMetadataController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Video metadata not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Delete a video metadata by id
 */
export async function deleteVideoMetadataController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = videoMetadataIdSchema.parse(req.params);
    await deleteVideoMetadata(params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Validation error in deleteVideoMetadataController:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Video metadata not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}