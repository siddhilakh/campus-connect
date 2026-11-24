import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/seniors (List active mentors/seniors)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, company } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = {
      collegeId,
      role: 'SENIOR',
      isActive: true,
      seniorProfile: { isNot: null }
    };

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { name: { contains: q } },
        { department: { contains: q } },
        { seniorProfile: { currentCompany: { contains: q } } },
        { seniorProfile: { jobRole: { contains: q } } },
        { seniorProfile: { expertiseTopics: { contains: q } } }
      ];
    }

    if (company && company !== 'ALL') {
      whereClause.seniorProfile = {
        ...whereClause.seniorProfile,
        currentCompany: { contains: company as string }
      };
    }

    const seniors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        batch: true,
        avatar: true,
        seniorProfile: true,
        _count: {
          select: {
            experiences: { where: { status: 'APPROVED' } },
            questionsReceived: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      count: seniors.length,
      seniors
    });
  } catch (error) {
    console.error('Error fetching seniors:', error);
    res.status(500).json({ success: false, message: 'Failed to load seniors directory.' });
  }
});

// GET /api/seniors/:id (Senior Profile Details)
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const senior = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        batch: true,
        avatar: true,
        seniorProfile: true,
        experiences: {
          where: { status: 'APPROVED' },
          include: {
            company: true,
            rounds: true
          }
        }
      }
    });

    if (!senior || !senior.seniorProfile) {
      res.status(404).json({ success: false, message: 'Senior mentor not found.' });
      return;
    }

    res.json({
      success: true,
      senior
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load senior profile.' });
  }
});

// PUT /api/seniors/profile (Update Senior Mentorship Profile)
router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentCompany, jobRole, packageLpa, graduationYear, bio, linkedinUrl, githubUrl, expertiseTopics, isAvailableForMentorship } = req.body;

    const seniorProfile = await prisma.seniorProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        currentCompany,
        jobRole,
        packageLpa: packageLpa ? parseFloat(packageLpa) : undefined,
        graduationYear,
        bio,
        linkedinUrl,
        githubUrl,
        expertiseTopics,
        isAvailableForMentorship: isAvailableForMentorship !== undefined ? isAvailableForMentorship : true
      },
      create: {
        userId: req.user!.id,
        currentCompany: currentCompany || 'Tech Company',
        jobRole: jobRole || 'Software Engineer',
        packageLpa: packageLpa ? parseFloat(packageLpa) : 10.0,
        graduationYear: graduationYear || '2024',
        bio: bio || 'Senior mentor ready to guide juniors.',
        linkedinUrl,
        githubUrl,
        expertiseTopics: expertiseTopics || 'DSA, Interviews',
        isAvailableForMentorship: isAvailableForMentorship !== undefined ? isAvailableForMentorship : true
      }
    });

    res.json({
      success: true,
      message: 'Senior mentorship profile updated.',
      seniorProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update senior profile.' });
  }
});

export default router;
