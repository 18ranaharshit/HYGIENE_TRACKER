import { Router } from 'express';
import { getNearby, getAll, getOne, create, update, remove } from '../controllers/toiletController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// @route GET /api/toilets/nearby  @access Public
router.get('/nearby', getNearby);

// @route GET /api/toilets  @access Public
router.get('/', getAll);

// @route GET /api/toilets/:id  @access Public
router.get('/:id', getOne);

// @route POST /api/toilets  @access Protected
router.post('/', authMiddleware, create);

// @route PUT /api/toilets/:id  @access Protected (owner or admin)
router.put('/:id', authMiddleware, update);

// @route DELETE /api/toilets/:id  @access Admin
router.delete('/:id', authMiddleware, adminMiddleware, remove);

export default router;
