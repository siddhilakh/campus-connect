import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const VALID_STATUSES = ['Interested', 'Applied', 'Assessment', 'Interview', 'Selected', 'Rejected'];

// GET /api/applications
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const whereClause: any = { userId: req.user!.id };

    if (status && status !== 'ALL') {
      whereClause.status = status as string;
    }

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { companyName: { contains: q } },
        { role: { contains: q } },
        { notes: { contains: q } }
      ];
    }

    const applications = await prisma.placementApplication.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to load placement applications.' });
  }
});

// POST /api/applications
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, role, status, applicationDate, packageLpa, notes } = req.body;

    if (!companyName || !role) {
      res.status(400).json({ success: false, message: 'Company name and role are required.' });
      return;
    }

    const cleanStatus = VALID_STATUSES.includes(status) ? status : 'Interested';

    const application = await prisma.placementApplication.create({
      data: {
        userId: req.user!.id,
        collegeId: req.collegeId!,
        companyName: companyName.trim(),
        role: role.trim(),
        status: cleanStatus,
        applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
        packageLpa: packageLpa ? parseFloat(packageLpa) : null,
        notes: notes || ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application added to tracker.',
      application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, message: 'Failed to add application.' });
  }
});

// PUT /api/applications/:id
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.placementApplication.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const { companyName, role, status, applicationDate, packageLpa, notes } = req.body;

    const updated = await prisma.placementApplication.update({
      where: { id },
      data: {
        companyName: companyName ?? existing.companyName,
        role: role ?? existing.role,
        status: status && VALID_STATUSES.includes(status) ? status : existing.status,
        applicationDate: applicationDate ? new Date(applicationDate) : existing.applicationDate,
        packageLpa: packageLpa !== undefined ? (packageLpa ? parseFloat(packageLpa) : null) : existing.packageLpa,
        notes: notes !== undefined ? notes : existing.notes
      }
    });

    res.json({
      success: true,
      message: 'Application updated.',
      application: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.placementApplication.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    await prisma.placementApplication.delete({ where: { id } });
    res.json({ success: true, message: 'Application removed from tracker.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application.' });
  }
});

export default router;
