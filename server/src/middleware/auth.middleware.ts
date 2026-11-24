import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId: string;
  department?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      collegeId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'campusconnect_fallback_secret_key';

    const decoded = jwt.verify(token, secret) as { id: string };
    if (!decoded || !decoded.id) {
      res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        collegeId: true,
        department: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User account not found or deactivated.' });
      return;
    }

    req.user = user;
    req.collegeId = user.collegeId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication token is invalid or expired.' });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please sign in.' });
      return;
    }

    // SYSTEM_ADMIN has superuser privileges across all modules
    if (req.user.role === 'SYSTEM_ADMIN' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
    });
  };
};
