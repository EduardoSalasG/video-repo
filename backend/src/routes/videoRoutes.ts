
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getVideos,
  getVideoById,
  createVideoController,
  updateVideoController,
  deleteVideoController,
} from '../controllers/videoController';

const router = Router({ mergeParams: true });

// All authenticated users can read videos in sections they have access to
router.get('/', authenticateUser, authorizePolicy('videoMetadata:read'), getVideos);
router.get('/:videoId', authenticateUser, authorizePolicy('videoMetadata:read'), getVideoById);

// Users with WRITE access to course can create videos
router.post('/', authenticateUser, authorizePolicy('videoMetadata:create'), createVideoController);

// Users with WRITE access to course can update videos
router.patch('/:videoId', authenticateUser, authorizePolicy('videoMetadata:update'), updateVideoController);

// Users with MAINTAIN access to course can delete videos (logic delete)
router.delete('/:videoId', authenticateUser, authorizePolicy('videoMetadata:delete'), deleteVideoController);

export default router;

