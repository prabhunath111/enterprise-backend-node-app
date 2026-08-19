import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { User } from '../models/User.model';
import { ApiError } from '../utils/response';

// No custom interface needed - use the built-in Request type directly
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.headers is available on the built-in Request type
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

    // Attach user to request using type assertion
    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    const userRole = user.roles && user.roles.length > 0 
      ? user.roles[0] 
      : 'user';
      
    if (!roles.includes(userRole)) {
      next(new ApiError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
};