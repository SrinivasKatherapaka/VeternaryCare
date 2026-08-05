import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled API error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors
    });
  }

  const statusCode = err.statusCode || res.statusCode || 500;
  res.status(statusCode >= 400 ? statusCode : 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}
