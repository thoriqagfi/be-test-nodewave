import jwt from 'jsonwebtoken';
import { UserJWTDAO } from '$entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function generateAccessToken(payload: UserJWTDAO): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'nodewave',
    audience: 'user'
  });
}

export function generateRefreshToken(payload: UserJWTDAO): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'nodewave',
    audience: 'user'
  });
}

export function verifyAccessToken(token: string): UserJWTDAO | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'nodewave',
      audience: 'user'
    });
    return decoded as UserJWTDAO;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): UserJWTDAO | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'nodewave',
      audience: 'user'
    });
    return decoded as UserJWTDAO;
  } catch (error) {
    return null;
  }
}