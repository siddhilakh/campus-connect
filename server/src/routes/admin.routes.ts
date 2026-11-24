import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/admin/metrics (High-level stats for Admins)
router.get('/metrics', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const collegeId = req.collegeId!;

    const [
      totalUsers,
      totalStudents,
      totalSeniors,
      totalCompanies,
      totalVerifiedPlacements,
      totalExperiences,
      pendingExperiencesCount
    ] = await Promise.all([
      prisma.user.count({ where: { collegeId } }),
      prisma.user.count({ where: { collegeId, role: 'STUDENT' } }),
      prisma.user.count({ where: { collegeId, role: 'SENIOR' } }),
      prisma.company.count({ where: { collegeId } }),
      prisma.placementRecord.count({ where: { collegeId, isVerified: true } }),
      prisma.interviewExperience.count({ where: { collegeId } }),
      prisma.interviewExperience.count({ where: { collegeId, status: 'PENDING' } })
    ]);

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { name: true, code: true, departments: true, address: true, placementEmail: true }
    });

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalStudents,
        totalSeniors,
        totalCompanies,
        totalVerifiedPlacements,
        totalExperiences,
        pendingExperiencesCount,
        college
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to load administration metrics.' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = { collegeId };

    if (role && role !== 'ALL') {
      whereClause.role = role as string;
    }
    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { rollNumber: { contains: q } },
        { department: { contains: q } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        batch: true,
        rollNumber: true,
        isActive: true,
        createdAt: true,
        seniorProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user directory.' });
  }
});

// PATCH /api/admin/users/:id/role (System Admin only)
router.patch('/users/:id/role', authenticate, requireRole('SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['STUDENT', 'SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
});

// GET /api/admin/moderation (Interview experiences moderation queue)
router.get('/moderation', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const collegeId = req.collegeId!;

    const experiences = await prisma.interviewExperience.findMany({
      where: { collegeId },
      include: {
        company: true,
        author: { select: { name: true, email: true, department: true } },
        rounds: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load moderation queue.' });
  }
});

// PATCH /api/admin/moderation/experience/:id (Update experience status)
router.patch('/moderation/experience/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['APPROVED', 'PENDING', 'HIDDEN', 'ARCHIVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status specified.' });
      return;
    }

    const updated = await prisma.interviewExperience.update({
      where: { id },
      data: { status, isVerified: status === 'APPROVED' }
    });

    // Record in moderation log
    await prisma.moderationRecord.create({
      data: {
        targetType: 'EXPERIENCE',
        targetId: id,
        action: status,
        reason: reason || 'Reviewed by Placement Administrator',
        moderatedBy: req.user!.name
      }
    });

    res.json({
      success: true,
      message: `Experience status set to ${status}.`,
      experience: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update moderation state.' });
  }
});

// GET /api/admin/college
router.get('/college', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: req.collegeId! }
    });
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load college settings.' });
  }
});

// PUT /api/admin/college
router.put('/college', authenticate, requireRole('SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, website, placementEmail, departments } = req.body;

    const college = await prisma.college.update({
      where: { id: req.collegeId! },
      data: {
        name,
        address,
        website,
        placementEmail,
        departments
      }
    });

    res.json({
      success: true,
      message: 'College information updated.',
      college
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update college data.' });
  }
});

export default router;
