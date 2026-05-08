import { Request, Response, NextFunction } from 'express';

/**
 * errorHandler — Global Express error handler.
 * Returns consistent { success, message, error } shape.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
