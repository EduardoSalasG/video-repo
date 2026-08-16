import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';

// Configure storage for video uploads
const storage: StorageEngine = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename preserving original extension
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter to accept only video files
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, AVI, WMV videos are allowed.'));
  }
};

// Configure multer
export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB limit
  }
});

// Utility function to get file path
export function getVideoFilePath(filename: string): string {
  return path.join(process.cwd(), 'uploads', 'videos', filename);
}

// Utility function to get file URL (for serving static files)
export function getVideoFileUrl(filename: string): string {
  return `/uploads/videos/${filename}`;
}
