import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

/** Extends Express Request to include decoded user */
export interface AuthRequest extends Request {
  user?: { _id: string; role: string };
}

/**
 * authMiddleware — Verifies Bearer JWT from Authorization header.
 * Attaches decoded user to req.user. Returns 401 if invalid.
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as { _id: string; role: string };
    const user = await User.findById(decoded._id).select('-passwordHash');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = { _id: String(user._id), role: user.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * adminMiddleware — Ensures req.user has admin role.
 * Must be used after authMiddleware.
 */
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
