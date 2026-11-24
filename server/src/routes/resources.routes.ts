import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/resources
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, difficulty } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = { collegeId };

    if (category && category !== 'ALL') {
      whereClause.category = category as string;
    }
    if (difficulty && difficulty !== 'ALL') {
      whereClause.difficulty = difficulty as string;
    }

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } }
      ];
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        company: { select: { id: true, name: true, logo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Failed to load preparation resources.' });
  }
});

// POST /api/resources (Admin only)
router.post('/', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, description, difficulty, resourceType, url, tags, companyId, role } = req.body;

    if (!title || !category || !url) {
      res.status(400).json({ success: false, message: 'Title, category, and URL are required.' });
      return;
    }

    const resource = await prisma.resource.create({
      data: {
        collegeId: req.collegeId!,
        title,
        category,
        description: description || 'Preparation resource.',
        difficulty: difficulty || 'Medium',
        resourceType: resourceType || 'Curated Guide',
        url,
        tags: tags || 'Prep',
        companyId: companyId || null,
        role: role || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Resource added successfully.',
      resource
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create resource.' });
  }
});

// DELETE /api/resources/:id (Admin only)
router.delete('/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.resource.delete({ where: { id } });
    res.json({ success: true, message: 'Resource removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resource.' });
  }
});

export default router;
