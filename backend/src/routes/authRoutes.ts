import { Router } from 'express';
import { register, login, magicLink } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/magic-link', magicLink);

export default router;