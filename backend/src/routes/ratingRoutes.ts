import { Router } from 'express';
import { getByToilet, create, update, toggleHelpful } from '../controllers/ratingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// @route GET /api/ratings/toilet/:toiletId  @access Public
router.get('/toilet/:toiletId', getByToilet);

// @route POST /api/ratings  @access Protected
router.post('/', authMiddleware, create);

// @route PUT /api/ratings/:id  @access Protected
router.put('/:id', authMiddleware, update);

// @route POST /api/ratings/:id/helpful  @access Protected
router.post('/:id/helpful', authMiddleware, toggleHelpful);

export default router;
