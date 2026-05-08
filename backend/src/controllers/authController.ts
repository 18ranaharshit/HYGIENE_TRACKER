import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

const SALT_ROUNDS = 12;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';

/** Signs a JWT for the given user ID and role */
const signToken = (id: string, role: string): string =>
  jwt.sign({ _id: id, role }, process.env.JWT_SECRET ?? 'secret', { expiresIn: JWT_EXPIRES } as jwt.SignOptions);

/**
 * @route POST /api/auth/register
 * @desc Register new user, hash password with bcrypt, return JWT
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const existing = await User.findOne({ email });
    if (existing) { res.status(400).json({ success: false, message: 'Email already registered' }); return; }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(String(user._id), user.role);
    res.status(201).json({ success: true, data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: String(err) });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login, validate credentials, return JWT and user object
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return; }
    const token = signToken(String(user._id), user.role);
    res.json({ success: true, data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: String(err) });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Invalidate token (client-side; server returns success)
 * @access Public
 */
export const logout = (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Logged out' });
};

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 * @access Protected
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-passwordHash');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: String(err) });
  }
};

/**
 * @route PUT /api/auth/me
 * @desc Update current user profile
 * @access Protected
 */
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body as { name?: string; avatar?: string };
    const user = await User.findByIdAndUpdate(req.user?._id, { name, avatar }, { new: true, runValidators: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(err) });
  }
};
