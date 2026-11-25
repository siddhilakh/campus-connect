import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/practice/questions
router.get('/questions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty } = req.query;
    const whereClause: any = {};

    if (category && category !== 'ALL') {
      whereClause.category = category as string;
    }
    if (difficulty && difficulty !== 'ALL') {
      whereClause.difficulty = difficulty as string;
    }

    const questions = await prisma.practiceQuestion.findMany({
      where: whereClause,
      include: {
        attempts: {
          where: { userId: req.user!.id },
          select: { selectedIdx: true, isCorrect: true, createdAt: true }
        }
      },
      orderBy: [{ category: 'asc' }, { difficulty: 'asc' }]
    });

    const formatted = questions.map((q) => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }
      const userAttempt = q.attempts[0] || null;
      return {
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        title: q.title,
        question: q.question,
        options: parsedOptions,
        correctIdx: q.correctIdx,
        explanation: q.explanation,
        userAttempt
      };
    });

    // Compute category & overall progress for current user
    const allQuestions = await prisma.practiceQuestion.findMany({
      include: {
        attempts: {
          where: { userId: req.user!.id }
        }
      }
    });

    const totalQuestions = allQuestions.length;
    const attemptedCount = allQuestions.filter((q) => q.attempts.length > 0).length;
    const correctCount = allQuestions.filter((q) => q.attempts[0]?.isCorrect).length;

    const categories = ['Aptitude', 'Technical MCQ', 'SQL', 'DSA'];
    const categoryStats = categories.map((cat) => {
      const catQs = allQuestions.filter((q) => q.category === cat);
      const catAttempted = catQs.filter((q) => q.attempts.length > 0).length;
      const catCorrect = catQs.filter((q) => q.attempts[0]?.isCorrect).length;
      return {
        category: cat,
        total: catQs.length,
        attempted: catAttempted,
        correct: catCorrect
      };
    });

    res.json({
      success: true,
      questions: formatted,
      stats: {
        totalQuestions,
        attemptedCount,
        correctCount,
        accuracy: attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error loading practice questions:', error);
    res.status(500).json({ success: false, message: 'Failed to load practice zone.' });
  }
});

// POST /api/practice/attempt
router.post('/attempt', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, selectedIdx } = req.body;

    if (!questionId || selectedIdx === undefined) {
      res.status(400).json({ success: false, message: 'Question ID and selected option index are required.' });
      return;
    }

    const question = await prisma.practiceQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      res.status(404).json({ success: false, message: 'Practice question not found.' });
      return;
    }

    const isCorrect = Number(selectedIdx) === question.correctIdx;

    const attempt = await prisma.practiceAttempt.upsert({
      where: {
        userId_questionId: {
          userId: req.user!.id,
          questionId
        }
      },
      update: {
        selectedIdx: Number(selectedIdx),
        isCorrect
      },
      create: {
        userId: req.user!.id,
        questionId,
        selectedIdx: Number(selectedIdx),
        isCorrect
      }
    });

    res.json({
      success: true,
      attempt,
      isCorrect,
      correctIdx: question.correctIdx,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('Error submitting practice attempt:', error);
    res.status(500).json({ success: false, message: 'Failed to record practice attempt.' });
  }
});

export default router;
