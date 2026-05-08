import { Router } from 'express';
import { getUsers, changeRole, deleteUser, getStats, getTickets, updateTicket } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// @route GET /api/admin/stats  @access Admin
router.get('/stats', getStats);

// @route GET /api/admin/users  @access Admin
router.get('/users', getUsers);

// @route PUT /api/admin/users/:id/role  @access Admin
router.put('/users/:id/role', changeRole);

// @route DELETE /api/admin/users/:id  @access Admin
router.delete('/users/:id', deleteUser);

// @route GET /api/admin/tickets  @access Admin
router.get('/tickets', getTickets);

// @route PUT /api/admin/tickets/:id  @access Admin
router.put('/tickets/:id', updateTicket);

export default router;
