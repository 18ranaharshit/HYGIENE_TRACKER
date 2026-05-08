import { Request, Response } from 'express';
import { Rating } from '../models/Rating';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

/**
 * @route GET /api/ratings/toilet/:toiletId
 * @desc Get all ratings for a toilet, paginated
 * @access Public
 */
export const getByToilet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', sort = 'recent' } = req.query as Record<string, string>;
    const sortObj = sort === 'helpful' ? { 'helpful.length': -1 } : { createdAt: -1 };
    const data = await Rating.find({ toiletId: req.params['toiletId'] })
      .populate('userId', 'name avatar')
      .sort(sortObj as any)
      .skip((+page - 1) * 10)
      .limit(10);
    const total = await Rating.countDocuments({ toiletId: req.params['toiletId'] });
    res.json({ success: true, data: { data, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch ratings', error: String(err) });
  }
};

/**
 * @route POST /api/ratings
 * @desc Submit a new rating (one per user per toilet)
 * @access Protected
 */
export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Rating.findOne({ toiletId: req.body.toiletId, userId: req.user?._id });
    if (existing) { res.status(400).json({ success: false, message: 'You have already reviewed this toilet' }); return; }
    const rating = await Rating.create({ ...req.body, userId: req.user?._id });
    res.status(201).json({ success: true, data: rating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit rating', error: String(err) });
  }
};

/**
 * @route PUT /api/ratings/:id
 * @desc Edit own rating
 * @access Protected
 */
export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rating = await Rating.findOne({ _id: req.params['id'], userId: req.user?._id });
    if (!rating) { res.status(404).json({ success: false, message: 'Rating not found or not yours' }); return; }
    const updated = await Rating.findByIdAndUpdate(req.params['id'], req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(err) });
  }
};

/**
 * @route POST /api/ratings/:id/helpful
 * @desc Toggle helpful vote for a rating
 * @access Protected
 */
export const toggleHelpful = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const rating = await Rating.findById(req.params['id']);
    if (!rating) { res.status(404).json({ success: false, message: 'Rating not found' }); return; }
    const hasVoted = rating.helpful.some(id => id.equals(userId));
    if (hasVoted) {
      rating.helpful = rating.helpful.filter(id => !id.equals(userId));
    } else {
      rating.helpful.push(userId);
    }
    await rating.save();
    res.json({ success: true, data: rating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Toggle failed', error: String(err) });
  }
};
