import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import path from 'path';

// Promisify ffmpeg.ffprobe
const ffprobeAsync = promisify(ffmpeg.ffprobe);

/**
 * Extract video metadata including duration and file size
 * @param filePath - Path to the video file
 * @returns Promise resolving to video metadata object
 */
export async function extractVideoMetadata(
  filePath: string
): Promise<{
  duration: number; // in seconds
  size: number; // in bytes
  format?: string;
  bitrate?: number;
}> {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Get metadata using ffprobe
    const metadata = await ffprobeAsync(filePath);
    
    return {
      duration: parseFloat(metadata.format.duration || '0'),
      size: parseInt(metadata.format.size || '0', 10),
      format: metadata.format.format_name,
      bitrate: parseInt(metadata.format.bit_rate || '0', 10)
    };
  } catch (error) {
    throw new Error(`Failed to extract video metadata: ${error.message}`);
  }
}

/**
 * Get file size using fs.stat (alternative method)
 * @param filePath - Path to the file
 * @returns File size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
}
