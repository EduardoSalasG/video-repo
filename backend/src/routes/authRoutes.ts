import { Router } from 'express';
import { register, login, magicLink, getCurrentUser } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);
router.post('/magic-link', magicLink);

export default router;