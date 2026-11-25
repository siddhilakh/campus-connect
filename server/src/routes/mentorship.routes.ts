import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/mentorship/my - Student's sent mentorship requests
router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.mentorshipRequest.findMany({
      where: { studentId: req.user!.id },
      include: {
        senior: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            batch: true,
            seniorProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load your mentorship requests.' });
  }
});

// GET /api/mentorship/received - Senior's received mentorship requests
router.get('/received', authenticate, requireRole('SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.mentorshipRequest.findMany({
      where: { seniorId: req.user!.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            batch: true,
            rollNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load received mentorship requests.' });
  }
});

// POST /api/mentorship - Request mentorship from a senior
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { seniorId, topic, message } = req.body;

    if (!seniorId || !topic || !message) {
      res.status(400).json({ success: false, message: 'Senior, topic, and message are required.' });
      return;
    }

    const request = await prisma.mentorshipRequest.create({
      data: {
        studentId: req.user!.id,
        seniorId,
        topic: topic.trim(),
        message: message.trim(),
        status: 'PENDING'
      },
      include: {
        senior: { select: { name: true } }
      }
    });

    // Notify senior
    await prisma.notification.create({
      data: {
        userId: seniorId,
        title: `New Mentorship Request from ${req.user!.name}`,
        message: `Topic: "${topic}"`,
        type: 'SYSTEM',
        link: '/senior-dashboard'
      }
    });

    res.status(201).json({
      success: true,
      message: `Mentorship request sent to ${request.senior.name}!`,
      request
    });
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    res.status(500).json({ success: false, message: 'Failed to send mentorship request.' });
  }
});

// PATCH /api/mentorship/:id/respond - Senior accepts or declines request
router.patch('/:id/respond', authenticate, requireRole('SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, responseNote } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be ACCEPTED or DECLINED.' });
      return;
    }

    const existing = await prisma.mentorshipRequest.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mentorship request not found.' });
      return;
    }

    if (existing.seniorId !== req.user!.id && req.user!.role !== 'SYSTEM_ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to respond to this request.' });
      return;
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: {
        status,
        responseNote: responseNote || null
      }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: existing.studentId,
        title: `Mentorship Request ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
        message: `${req.user!.name} ${status === 'ACCEPTED' ? 'accepted' : 'declined'} your request regarding "${existing.topic}".`,
        type: 'SYSTEM',
        link: '/senior-connect'
      }
    });

    res.json({
      success: true,
      message: `Mentorship request ${status.toLowerCase()}.`,
      request: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update mentorship request.' });
  }
});

export default router;
