import { Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { User } from '../models/User.model';
import { ApiError } from '../utils/response';
import { AuthRequest } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = TokenService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    const userRole = req.user.roles && req.user.roles[0] ? req.user.roles[0] : 'user';
    if (!roles.includes(userRole)) {
      next(new ApiError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
};