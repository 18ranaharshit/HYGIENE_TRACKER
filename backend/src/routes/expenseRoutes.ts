import { Router } from 'express';
import { getAll, getSummary, create, update, remove } from '../controllers/expenseController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// @route GET /api/expenses/summary  @access Admin
router.get('/summary', authMiddleware, adminMiddleware, getSummary);

// @route GET /api/expenses  @access Admin
router.get('/', authMiddleware, adminMiddleware, getAll);

// @route POST /api/expenses  @access Admin
router.post('/', authMiddleware, adminMiddleware, create);

// @route PUT /api/expenses/:id  @access Admin
router.put('/:id', authMiddleware, adminMiddleware, update);

// @route DELETE /api/expenses/:id  @access Admin
router.delete('/:id', authMiddleware, adminMiddleware, remove);

export default router;
