import { Router } from 'express'
import { authenticateUser } from '../middleware/auth'
import { searchVideos } from '../controllers/searchController'

const router = Router()

// Search video metadata with keyword and filter query params
router.get('/search', authenticateUser, searchVideos)

export default router