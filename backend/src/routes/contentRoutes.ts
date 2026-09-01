import { Router } from 'express'
import { getContent, updateContent } from '../controllers/contentController'
import { authenticateUser } from '../middleware/auth'
import { authorizePolicy } from '../middleware/authorizePolicy'

const router = Router({ mergeParams: true })

router.get('/', authenticateUser, authorizePolicy('section:read'), getContent)
router.patch(
  '/',
  authenticateUser,
  authorizePolicy('section:update'),
  updateContent
)

export default router
