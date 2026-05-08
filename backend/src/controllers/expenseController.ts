import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @route GET /api/expenses
 * @desc Get all expenses, filterable by toilet, date, and category
 * @access Admin
 */
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', toiletId, category, startDate, endDate } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (toiletId) filter['toiletId'] = toiletId;
    if (category) filter['category'] = category;
    if (startDate || endDate) {
      filter['date'] = {} as Record<string, Date>;
      if (startDate) (filter['date'] as Record<string, Date>)['$gte'] = new Date(startDate);
      if (endDate) (filter['date'] as Record<string, Date>)['$lte'] = new Date(endDate);
    }
    const data = await Expense.find(filter).populate('toiletId', 'name').populate('addedBy', 'name').sort({ date: -1 }).skip((+page - 1) * 10).limit(10);
    const total = await Expense.countDocuments(filter);
    res.json({ success: true, data: { data, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses', error: String(err) });
  }
};

/**
 * @route GET /api/expenses/summary
 * @desc Monthly summary with category breakdown for chart data
 * @access Admin
 */
export const getSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalThisMonth, pendingRepairs, byMonth] = await Promise.all([
      Expense.aggregate([{ $match: { date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { category: 'repair' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([
        { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' }, category: '$category' }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Count distinct toilets for avg calculation
    const toiletCount = await Expense.distinct('toiletId').then(t => t.length || 1);

    // Shape byMonth into chart-friendly format
    const monthMap: Record<string, any> = {};
    for (const entry of byMonth) {
      const key = `${(entry._id as { year: number; month: number; category: string }).year}-${String((entry._id as { year: number; month: number; category: string }).month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, cleaning: 0, repair: 0, supplies: 0, inspection: 0 };
      monthMap[key][(entry._id as any).category] = (entry as { total: number }).total;
    }

    res.json({
      success: true,
      data: {
        totalThisMonth: totalThisMonth[0]?.total ?? 0,
        pendingRepairs: pendingRepairs[0]?.total ?? 0,
        avgPerToilet: Math.round((totalThisMonth[0]?.total ?? 0) / toiletCount),
        byMonth: Object.values(monthMap).slice(-6),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary', error: String(err) });
  }
};

/**
 * @route POST /api/expenses
 * @desc Add expense record
 * @access Admin
 */
export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.create({ ...req.body, addedBy: req.user?._id });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create expense', error: String(err) });
  }
};

/**
 * @route PUT /api/expenses/:id
 * @desc Update expense
 * @access Admin
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params['id'], req.body, { new: true });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(err) });
  }
};

/**
 * @route DELETE /api/expenses/:id
 * @desc Delete expense
 * @access Admin
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await Expense.findByIdAndDelete(req.params['id']);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed', error: String(err) });
  }
};
