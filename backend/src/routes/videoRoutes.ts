import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { authorizePolicy } from '../middleware/authorizePolicy'
import { uploadVideo } from '../utils/storage'
import {
  getVideoMetadataBySectionId,
  createVideoMetadataController,
  updateVideoMetadataController,
  deleteVideoMetadataController,
  uploadVideoController,
} from '../controllers/videoController'

const router = Router({ mergeParams: true })

// Video metadata is a singleton nested below its parent section. Policies must
// therefore authorize the section, including before the metadata exists.
router.get(
  '/video-metadata',
  authenticateUser,
  authorizePolicy('section:read'),
  getVideoMetadataBySectionId
)
router.post(
  '/video-metadata',
  authenticateUser,
  authorizePolicy('section:update'),
  createVideoMetadataController
)
router.patch(
  '/video-metadata',
  authenticateUser,
  authorizePolicy('section:update'),
  updateVideoMetadataController
)
router.delete(
  '/video-metadata',
  authenticateUser,
  authorizePolicy('section:delete'),
  deleteVideoMetadataController
)
router.post(
  '/upload-video',
  authenticateUser,
  authorizePolicy('section:update'),
  uploadVideo.single('video'),
  uploadVideoController
)

export default router
