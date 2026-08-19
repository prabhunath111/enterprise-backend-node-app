import { Response } from 'express';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    error: Error | ApiError,
    statusCode: number = 500
  ): Response {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
        isOperational: error.isOperational,
      });
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}