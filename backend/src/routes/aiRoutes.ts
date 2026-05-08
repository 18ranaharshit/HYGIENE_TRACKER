import { Router } from 'express';
import { analyze, getReport } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// @route POST /api/ai/analyze  @access Protected
router.post('/analyze', authMiddleware, analyze);

// @route GET /api/ai/report/:id  @access Protected
router.get('/report/:id', authMiddleware, getReport);

export default router;
