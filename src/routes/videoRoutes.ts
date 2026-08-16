import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { requireInstructor } from '../middleware/role'
import { uploadVideo } from '../utils/storage'
import {
  getVideoMetadataBySectionId,
  createVideoMetadataController,
  updateVideoMetadataController,
  deleteVideoMetadataController,
  uploadVideoController,
} from '../controllers/videoController'

const router = Router()

// Get video metadata for a section
router.get('/modules/:moduleId/sections/:sectionId/video-metadata', authenticateUser, getVideoMetadataBySectionId);

// Create video metadata for a section
router.post('/modules/:moduleId/sections/:sectionId/video-metadata', authenticateUser, requireInstructor, createVideoMetadataController);

// Update video metadata for a section
router.patch('/modules/:moduleId/sections/:sectionId/video-metadata', authenticateUser, requireInstructor, updateVideoMetadataController);

// Delete video metadata for a section
router.delete('/modules/:moduleId/sections/:sectionId/video-metadata', authenticateUser, requireInstructor, deleteVideoMetadataController);

// Upload video file for a section
router.post('/modules/:moduleId/sections/:sectionId/upload-video', authenticateUser, requireInstructor, uploadVideo.single('video'), uploadVideoController);

export default router
