import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser } from '../models/User.model';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export class TokenService {
  static generateTokens(user: IUser): { accessToken: string; refreshToken: string } {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    // Generate access token
    const accessToken = jwt.sign(
      payload, 
      env.jwtSecret, 
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      if (!decoded?.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}