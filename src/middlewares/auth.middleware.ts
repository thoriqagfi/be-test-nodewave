import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '$utils/jwt.utils';
import { response_unauthorized, response_forbidden } from '$utils/response.utils';
import { UserJWTDAO } from '$entities/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserJWTDAO;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response_unauthorized(res, 'Access token required');
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return response_unauthorized(res, 'Invalid or expired access token');
  }

  req.user = decoded;
  next();
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return response_unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return response_forbidden(res, 'Insufficient permissions');
    }

    next();
  };
}