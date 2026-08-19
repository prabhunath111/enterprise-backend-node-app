import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../utils/response';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle Mongoose errors
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map(e => e.message);
    ApiResponse.error(res, new ApiError(400, messages.join(', ')));
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    ApiResponse.error(res, new ApiError(400, `Invalid ${error.path}: ${error.value}`));
    return;
  }

  // Handle duplicate key error
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    ApiResponse.error(res, new ApiError(409, `${field} already exists`));
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    ApiResponse.error(res, new ApiError(401, 'Invalid token'));
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ApiResponse.error(res, new ApiError(401, 'Token expired'));
    return;
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    ApiResponse.error(res, error);
    return;
  }

  // Handle other errors
  ApiResponse.error(res, error, 500);
};