import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/experiences (Search & list)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, companyId, difficulty, outcome, role, batch, interviewType } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = {
      collegeId,
      status: 'APPROVED'
    };

    if (companyId && companyId !== 'ALL') {
      whereClause.companyId = companyId as string;
    }
    if (difficulty && difficulty !== 'ALL') {
      whereClause.difficulty = difficulty as string;
    }
    if (outcome && outcome !== 'ALL') {
      whereClause.outcome = outcome as string;
    }
    if (batch && batch !== 'ALL') {
      whereClause.batch = batch as string;
    }
    if (interviewType && interviewType !== 'ALL') {
      whereClause.interviewType = interviewType as string;
    }
    if (role && role !== 'ALL') {
      whereClause.role = { contains: role as string };
    }

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { role: { contains: q } },
        { overallSummary: { contains: q } },
        { topicsCovered: { contains: q } },
        { company: { name: { contains: q } } }
      ];
    }

    const experiences = await prisma.interviewExperience.findMany({
      where: whereClause,
      include: {
        company: {
          select: { id: true, name: true, logo: true, tier: true }
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            batch: true,
            seniorProfile: {
              select: {
                currentCompany: true,
                jobRole: true,
                linkedinUrl: true
              }
            }
          }
        },
        rounds: {
          orderBy: { roundNumber: 'asc' }
        },
        bookmarks: {
          where: { userId: req.user!.id },
          select: { id: true }
        },
        helpfulVotes: {
          where: { userId: req.user!.id },
          select: { id: true }
        },
        _count: {
          select: { questions: true, bookmarks: true, helpfulVotes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = experiences.map((exp) => ({
      ...exp,
      isBookmarked: exp.bookmarks.length > 0,
      isHelpful: exp.helpfulVotes.length > 0
    }));

    res.json({
      success: true,
      count: formatted.length,
      experiences: formatted
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ success: false, message: 'Failed to load interview experiences.' });
  }
});

// GET /api/experiences/:id
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await prisma.interviewExperience.findUnique({
      where: { id },
      include: {
        company: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            department: true,
            batch: true,
            seniorProfile: true
          }
        },
        rounds: {
          orderBy: { roundNumber: 'asc' }
        },
        questions: {
          include: {
            student: {
              select: { id: true, name: true, avatar: true, department: true }
            },
            answers: {
              include: {
                author: {
                  select: { id: true, name: true, avatar: true, role: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        bookmarks: {
          where: { userId: req.user!.id }
        },
        helpfulVotes: {
          where: { userId: req.user!.id }
        },
        _count: {
          select: { questions: true, bookmarks: true, helpfulVotes: true }
        }
      }
    });

    if (!experience) {
      res.status(404).json({ success: false, message: 'Interview experience not found.' });
      return;
    }

    res.json({
      success: true,
      experience: {
        ...experience,
        isBookmarked: experience.bookmarks.length > 0,
        isHelpful: experience.helpfulVotes.length > 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load experience details.' });
  }
});

// POST /api/experiences (Seniors & Admins)
router.post('/', authenticate, requireRole('SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      companyId,
      role,
      batch,
      packageLpa,
      difficulty,
      interviewType,
      outcome,
      overallSummary,
      preparationStrategy,
      tipsAndAdvice,
      topicsCovered,
      rounds
    } = req.body;

    if (!companyId || !role || !overallSummary || !preparationStrategy) {
      res.status(400).json({ success: false, message: 'Please provide all required interview experience details.' });
      return;
    }

    const experience = await prisma.interviewExperience.create({
      data: {
        collegeId: req.collegeId!,
        companyId,
        authorId: req.user!.id,
        role,
        batch: batch || '2024',
        packageLpa: packageLpa ? parseFloat(packageLpa) : null,
        difficulty: difficulty || 'Medium',
        interviewType: interviewType || 'On-Campus',
        outcome: outcome || 'Selected',
        overallSummary,
        preparationStrategy,
        tipsAndAdvice: tipsAndAdvice || 'Stay calm, focus on fundamentals, and communicate clearly.',
        topicsCovered: topicsCovered || 'DSA, Core CS, Behavioral',
        status: req.user!.role === 'PLACEMENT_ADMIN' ? 'APPROVED' : 'APPROVED', // Auto-approved for verified seniors in demo
        isVerified: true,
        rounds: {
          create: Array.isArray(rounds) && rounds.length > 0
            ? rounds.map((r: any, index: number) => ({
                roundNumber: r.roundNumber || index + 1,
                roundName: r.roundName || `Round ${index + 1}`,
                durationMinutes: r.durationMinutes ? parseInt(r.durationMinutes) : 45,
                description: r.description || '',
                questionsAsked: r.questionsAsked || '',
                tips: r.tips || ''
              }))
            : [
                {
                  roundNumber: 1,
                  roundName: 'Technical & Coding Round',
                  durationMinutes: 60,
                  description: 'Comprehensive technical interview on DSA and core computer science.',
                  questionsAsked: 'Problem solving on arrays, trees, and system concepts.'
                }
              ]
        }
      },
      include: {
        rounds: true,
        company: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Interview experience published successfully!',
      experience
    });
  } catch (error) {
    console.error('Error submitting experience:', error);
    res.status(500).json({ success: false, message: 'Failed to submit interview experience.' });
  }
});

// POST /api/experiences/:id/bookmark (Toggle bookmark)
router.post('/:id/bookmark', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_experienceId: { userId, experienceId: id }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      const count = await prisma.bookmark.count({ where: { experienceId: id } });
      res.json({ success: true, message: 'Bookmark removed.', isBookmarked: false, bookmarkCount: count });
    } else {
      await prisma.bookmark.create({
        data: { userId, experienceId: id }
      });
      const count = await prisma.bookmark.count({ where: { experienceId: id } });
      res.json({ success: true, message: 'Experience saved to bookmarks.', isBookmarked: true, bookmarkCount: count });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle bookmark.' });
  }
});

// POST /api/experiences/:id/helpful (Toggle helpful vote)
router.post('/:id/helpful', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.helpfulVote.findUnique({
      where: {
        userId_experienceId: { userId, experienceId: id }
      }
    });

    if (existing) {
      await prisma.helpfulVote.delete({ where: { id: existing.id } });
      const updated = await prisma.interviewExperience.update({
        where: { id },
        data: { helpfulCount: { decrement: 1 } }
      });
      res.json({ success: true, isHelpful: false, helpfulCount: Math.max(0, updated.helpfulCount) });
    } else {
      await prisma.helpfulVote.create({ data: { userId, experienceId: id } });
      const updated = await prisma.interviewExperience.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } }
      });
      res.json({ success: true, isHelpful: true, helpfulCount: updated.helpfulCount });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle helpful vote.' });
  }
});

// GET /api/experiences/my/bookmarks
router.get('/my/bookmarks', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.id },
      include: {
        experience: {
          include: {
            company: true,
            author: { select: { id: true, name: true, avatar: true } },
            rounds: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bookmarks: bookmarks.map((b) => b.experience)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load bookmarks.' });
  }
});

// GET /api/experiences/my/submitted (For Senior Dashboard)
router.get('/my/submitted', authenticate, requireRole('SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const experiences = await prisma.interviewExperience.findMany({
      where: { authorId: req.user!.id },
      include: {
        company: true,
        rounds: true,
        _count: { select: { questions: true, bookmarks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      experiences
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load submitted experiences.' });
  }
});

// DELETE /api/experiences/:id
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await prisma.interviewExperience.findUnique({ where: { id } });

    if (!experience) {
      res.status(404).json({ success: false, message: 'Experience not found.' });
      return;
    }

    if (experience.authorId !== req.user!.id && req.user!.role !== 'PLACEMENT_ADMIN' && req.user!.role !== 'SYSTEM_ADMIN') {
      res.status(403).json({ success: false, message: 'You are not authorized to delete this experience.' });
      return;
    }

    await prisma.interviewExperience.delete({ where: { id } });
    res.json({ success: true, message: 'Experience deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete experience.' });
  }
});

export default router;
