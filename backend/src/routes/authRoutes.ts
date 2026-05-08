import { Router } from 'express';
import { register, login, logout, getMe, updateMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// @route POST /api/auth/register  @access Public
router.post('/register', register);

// @route POST /api/auth/login  @access Public
router.post('/login', login);

// @route POST /api/auth/logout  @access Public
router.post('/logout', logout);

// @route GET /api/auth/me  @access Protected
router.get('/me', authMiddleware, getMe);

// @route PUT /api/auth/me  @access Protected
router.put('/me', authMiddleware, updateMe);

export default router;
