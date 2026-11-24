import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true
          }
        },
        seniorProfile: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please use one of the demo accounts provided.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid password. Check the demo credentials.'
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'campusconnect_fallback_secret_key';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId
      },
      secret,
      { expiresIn: '7d' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: user.id,
        details: `Successful sign in with role ${user.role}`,
        ipAddress: req.ip
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        college: true,
        seniorProfile: true,
        _count: {
          select: {
            notifications: {
              where: { isRead: false }
            },
            bookmarks: true,
            experiences: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      unreadNotificationsCount: user._count.notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, department, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: name !== undefined ? name : undefined,
        department: department !== undefined ? department : undefined,
        phone: phone !== undefined ? phone : undefined,
        avatar: avatar !== undefined ? avatar : undefined
      },
      include: {
        college: true,
        seniorProfile: true
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

export default router;
