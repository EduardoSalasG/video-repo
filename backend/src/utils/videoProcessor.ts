import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import * as fs from 'fs/promises';

// Promisify ffmpeg.ffprobe
const ffprobeAsync: (file: string) => Promise<ffmpeg.FfprobeData> = promisify(ffmpeg.ffprobe);

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
      duration: typeof metadata.format.duration === 'number' ? metadata.format.duration : parseFloat(String(metadata.format.duration || '0')),
      size: typeof metadata.format.size === 'number' ? metadata.format.size : parseInt(String(metadata.format.size || '0'), 10),
      format: metadata.format.format_name,
      bitrate: typeof metadata.format.bit_rate === 'number' ? metadata.format.bit_rate : parseInt(String(metadata.format.bit_rate || '0'), 10)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to extract video metadata: ${message}`, { cause: error });
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
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to get file size: ${message}`, { cause: error });
  }
}
