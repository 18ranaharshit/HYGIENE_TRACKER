import { Request, Response } from 'express';
import { Toilet } from '../models/Toilet';
import { Rating } from '../models/Rating';
import { AuthRequest } from '../middleware/authMiddleware';

const DEFAULT_RADIUS = 2000;
const PAGE_SIZE = 10;

/**
 * @route GET /api/toilets/nearby
 * @desc Find toilets near user using MongoDB $near geospatial query
 * @access Public
 */
export const getNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = DEFAULT_RADIUS } = req.query as Record<string, string>;
    if (!lat || !lng) { res.status(400).json({ success: false, message: 'lat and lng required' }); return; }
    const toilets = await Toilet.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [+lng, +lat] }, $maxDistance: +radius } },
    }).limit(20);
    res.json({ success: true, data: toilets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch nearby toilets', error: String(err) });
  }
};

/**
 * @route GET /api/toilets
 * @desc List all toilets, paginated, filterable by type
 * @access Public
 */
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', type } = req.query as Record<string, string>;
    const filter = type ? { type } : {};
    const total = await Toilet.countDocuments(filter);
    const data = await Toilet.find(filter).skip((+page - 1) * PAGE_SIZE).limit(PAGE_SIZE).sort({ createdAt: -1 });
    res.json({ success: true, data: { data, total, page: +page, pages: Math.ceil(total / PAGE_SIZE) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch toilets', error: String(err) });
  }
};

/**
 * @route GET /api/toilets/:id
 * @desc Get single toilet with aggregated ratings
 * @access Public
 */
export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const toilet = await Toilet.findById(req.params['id']);
    if (!toilet) { res.status(404).json({ success: false, message: 'Toilet not found' }); return; }
    const agg = await Rating.aggregate([
      { $match: { toiletId: toilet._id } },
      { $group: { _id: null, avg: { $avg: { $avg: ['$cleanliness', '$accessibility', '$facilities'] } }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { ...toilet.toObject(), avgRating: agg[0]?.avg ?? 0, ratingCount: agg[0]?.count ?? 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch toilet', error: String(err) });
  }
};

/**
 * @route POST /api/toilets
 * @desc Add new toilet
 * @access Protected
 */
export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const toilet = await Toilet.create({ ...req.body, addedBy: req.user?._id });
    res.status(201).json({ success: true, data: toilet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create toilet', error: String(err) });
  }
};

/**
 * @route PUT /api/toilets/:id
 * @desc Update toilet (admin or creator only)
 * @access Protected
 */
export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const toilet = await Toilet.findById(req.params['id']);
    if (!toilet) { res.status(404).json({ success: false, message: 'Toilet not found' }); return; }
    const isOwner = String(toilet.addedBy) === req.user?._id;
    if (!isOwner && req.user?.role !== 'admin') { res.status(403).json({ success: false, message: 'Unauthorized' }); return; }
    const updated = await Toilet.findByIdAndUpdate(req.params['id'], req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(err) });
  }
};

/**
 * @route DELETE /api/toilets/:id
 * @desc Delete toilet (admin only)
 * @access Admin
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await Toilet.findByIdAndDelete(req.params['id']);
    res.json({ success: true, message: 'Toilet deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed', error: String(err) });
  }
};
