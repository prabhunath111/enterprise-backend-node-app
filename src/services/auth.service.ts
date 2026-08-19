import { User, IUser } from '../models/User.model';
import { TokenService } from './token.service';
import { ApiError } from '../utils/response';
import logger from '../utils/logger';

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'User already exists with this email');
    }

    const user = new User({ 
      name, 
      email, 
      password,
      isEmailVerified: false,
      roles: ['user']
    });
    await user.save();

    const { accessToken, refreshToken } = TokenService.generateTokens(user);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User registered: ${email}`);
    return { user, accessToken, refreshToken };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = TokenService.generateTokens(user);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);
    return { user, accessToken, refreshToken };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    const decoded = TokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokens = TokenService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  static async logout(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    logger.info(`User logged out: ${userId}`);
  }

  static async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}