import { Request, Response } from 'express';
import { User } from '../models/User';
import { Toilet } from '../models/Toilet';
import { MaintenanceTicket } from '../models/MaintenanceTicket';

/**
 * @route GET /api/admin/users
 * @desc List all users, paginated and searchable
 * @access Admin
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', search = '' } = req.query as Record<string, string>;
    const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const data = await User.find(filter).select('-passwordHash').skip((+page - 1) * 10).limit(10).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: { data, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: String(err) });
  }
};

/**
 * @route PUT /api/admin/users/:id/role
 * @desc Change user role
 * @access Admin
 */
export const changeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: 'user' | 'admin' };
    const user = await User.findByIdAndUpdate(req.params['id'], { role }, { new: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update role', error: String(err) });
  }
};

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete user
 * @access Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params['id']);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: String(err) });
  }
};

/**
 * @route GET /api/admin/stats
 * @desc System-wide stats: total toilets, users, avg score, open tickets
 * @access Admin
 */
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalToilets, totalUsers, scoreAgg, openTickets, resolvedThisMonth, newToiletsThisMonth] = await Promise.all([
      Toilet.countDocuments(),
      User.countDocuments(),
      Toilet.aggregate([{ $group: { _id: null, avg: { $avg: '$hygieneScore' } } }]),
      MaintenanceTicket.countDocuments({ status: 'open' }),
      MaintenanceTicket.countDocuments({ status: 'resolved', updatedAt: { $gte: startOfMonth } }),
      Toilet.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    res.json({
      success: true,
      data: {
        totalToilets,
        totalUsers,
        avgHygieneScore: Math.round((scoreAgg[0]?.avg ?? 0) * 10) / 10,
        openTickets,
        resolvedThisMonth,
        newToiletsThisMonth,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: String(err) });
  }
};

/**
 * @route GET /api/admin/tickets
 * @desc All maintenance tickets, filterable by status and severity
 * @access Admin
 */
export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, severity, limit = '50' } = req.query as Record<string, string>;
    const filter: Record<string, string> = {};
    if (status) filter['status'] = status;
    if (severity) filter['severity'] = severity;
    const data = await MaintenanceTicket.find(filter).populate('toiletId', 'name address').populate('reportedBy', 'name').sort({ createdAt: -1 }).limit(+limit);
    res.json({ success: true, data: { data } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets', error: String(err) });
  }
};

/**
 * @route PUT /api/admin/tickets/:id
 * @desc Update ticket status
 * @access Admin
 */
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates: Record<string, unknown> = { ...req.body };
    if (req.body.status === 'resolved') updates['resolvedAt'] = new Date();
    const ticket = await MaintenanceTicket.findByIdAndUpdate(req.params['id'], updates, { new: true });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(err) });
  }
};
