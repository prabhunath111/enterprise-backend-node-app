import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);
      ApiResponse.success(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      await AuthService.logout(userId);
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const user = await AuthService.getCurrentUser(userId);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}