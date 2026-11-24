import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/questions (All questions or filtered)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { seniorId, experienceId } = req.query;

    const whereClause: any = {};
    if (seniorId) whereClause.seniorId = seniorId as string;
    if (experienceId) whereClause.experienceId = experienceId as string;

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, avatar: true, department: true } },
        senior: { select: { id: true, name: true, avatar: true, seniorProfile: true } },
        answers: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load questions.' });
  }
});

// GET /api/questions/received (For Senior Dashboard)
router.get('/received', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await prisma.question.findMany({
      where: { seniorId: req.user!.id },
      include: {
        student: { select: { id: true, name: true, avatar: true, department: true, batch: true } },
        experience: { select: { id: true, role: true, company: { select: { name: true } } } },
        answers: {
          include: {
            author: { select: { id: true, name: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch received questions.' });
  }
});

// GET /api/questions/asked (For Student Dashboard)
router.get('/asked', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await prisma.question.findMany({
      where: { studentId: req.user!.id },
      include: {
        senior: { select: { id: true, name: true, avatar: true, seniorProfile: true } },
        answers: {
          include: {
            author: { select: { id: true, name: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch asked questions.' });
  }
});

// POST /api/questions (Ask a Question)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { seniorId, title, content, experienceId } = req.body;

    if (!seniorId || !title || !content) {
      res.status(400).json({ success: false, message: 'Please provide senior recipient, title, and question details.' });
      return;
    }

    const question = await prisma.question.create({
      data: {
        studentId: req.user!.id,
        seniorId,
        experienceId: experienceId || null,
        title,
        content
      },
      include: {
        student: { select: { name: true } }
      }
    });

    // Notify the senior
    await prisma.notification.create({
      data: {
        userId: seniorId,
        title: `New Question from ${req.user!.name}`,
        message: `"${title}" - Asked on CampusConnect Senior Hub`,
        type: 'QUESTION_RECEIVED',
        link: '/senior-dashboard'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Question sent to senior! You will be notified when they answer.',
      question
    });
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).json({ success: false, message: 'Failed to post question.' });
  }
});

// POST /api/questions/:id/answers (Answer Question)
router.post('/:id/answers', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Answer content cannot be empty.' });
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const answer = await prisma.answer.create({
      data: {
        questionId: id,
        authorId: req.user!.id,
        content
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } }
      }
    });

    // Mark question as answered
    await prisma.question.update({
      where: { id },
      data: { isAnswered: true }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: question.studentId,
        title: `Response from ${req.user!.name}`,
        message: `Your question "${question.title}" has been answered!`,
        type: 'ANSWER_RECEIVED',
        link: '/senior-connect'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully!',
      answer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to post answer.' });
  }
});

export default router;
