import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/readiness - Get current user's placement readiness progress
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    let progress = await prisma.readinessProgress.findUnique({
      where: { userId: req.user!.id }
    });

    if (!progress) {
      progress = await prisma.readinessProgress.create({
        data: {
          userId: req.user!.id,
          aptitude: 40,
          dsa: 35,
          coreCs: 45,
          communication: 55,
          resumePreparation: 60
        }
      });
    }

    const overall = Math.round(
      (progress.aptitude +
        progress.dsa +
        progress.coreCs +
        progress.communication +
        progress.resumePreparation) /
        5
    );

    res.json({
      success: true,
      readiness: {
        ...progress,
        overallPercentage: overall
      }
    });
  } catch (error) {
    console.error('Readiness fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to load placement readiness progress.' });
  }
});

// PUT /api/readiness - Update current user's readiness scores
router.put('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const clamp = (val: any, fallback: number) => {
      const n = Number(val);
      if (Number.isNaN(n)) return fallback;
      return Math.max(0, Math.min(100, Math.round(n)));
    };

    const existing = await prisma.readinessProgress.findUnique({
      where: { userId: req.user!.id }
    });

    const data = {
      aptitude: clamp(req.body.aptitude, existing?.aptitude ?? 40),
      dsa: clamp(req.body.dsa, existing?.dsa ?? 35),
      coreCs: clamp(req.body.coreCs, existing?.coreCs ?? 45),
      communication: clamp(req.body.communication, existing?.communication ?? 55),
      resumePreparation: clamp(req.body.resumePreparation, existing?.resumePreparation ?? 60)
    };

    const progress = await prisma.readinessProgress.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: {
        userId: req.user!.id,
        ...data
      }
    });

    const overall = Math.round(
      (progress.aptitude +
        progress.dsa +
        progress.coreCs +
        progress.communication +
        progress.resumePreparation) /
        5
    );

    res.json({
      success: true,
      message: 'Placement readiness progress updated!',
      readiness: {
        ...progress,
        overallPercentage: overall
      }
    });
  } catch (error) {
    console.error('Readiness update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update readiness progress.' });
  }
});

export default router;
