import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/companies (Public to authenticated college users)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, tier, status } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = { collegeId };

    if (tier && tier !== 'ALL') {
      whereClause.tier = tier as string;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status as string;
    }

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { name: { contains: q } },
        { rolesOffered: { contains: q } },
        { industry: { contains: q } },
        { allowedBranches: { contains: q } }
      ];
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            placementRecords: true,
            experiences: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Failed to load company directory.' });
  }
});

// GET /api/companies/:id
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const collegeId = req.collegeId!;

    const company = await prisma.company.findFirst({
      where: { id, collegeId },
      include: {
        placementRecords: {
          orderBy: { packageLpa: 'desc' },
          take: 10
        },
        experiences: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                department: true,
                batch: true,
                avatar: true
              }
            },
            rounds: true
          }
        },
        resources: true
      }
    });

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found.' });
      return;
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load company details.' });
  }
});

// POST /api/companies (Admin only)
router.post('/', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      industry,
      description,
      tier,
      batch,
      rolesOffered,
      eligibilityCriteria,
      minCgpa,
      allowedBranches,
      packageRange,
      averagePackageLpa,
      highestPackageLpa,
      website,
      logo,
      status
    } = req.body;

    if (!name || !rolesOffered || !packageRange) {
      res.status(400).json({ success: false, message: 'Name, roles offered, and package range are required.' });
      return;
    }

    const company = await prisma.company.create({
      data: {
        collegeId: req.collegeId!,
        name,
        industry: industry || 'Technology & IT Services',
        description: description || 'Visiting company for campus recruitment drive.',
        tier: tier || 'Tier 1',
        batch: batch || '2025-26',
        rolesOffered,
        eligibilityCriteria: eligibilityCriteria || 'Minimum 60% with no backlogs',
        minCgpa: minCgpa ? parseFloat(minCgpa) : 6.0,
        allowedBranches: allowedBranches || 'CSE, IT, ECE',
        packageRange,
        averagePackageLpa: averagePackageLpa ? parseFloat(averagePackageLpa) : null,
        highestPackageLpa: highestPackageLpa ? parseFloat(highestPackageLpa) : null,
        website,
        logo: logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
        status: status || 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company added successfully.',
      company
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: 'Failed to create company record.' });
  }
});

// PUT /api/companies/:id (Admin only)
router.put('/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...updateData,
        minCgpa: updateData.minCgpa !== undefined ? parseFloat(updateData.minCgpa) : undefined,
        averagePackageLpa: updateData.averagePackageLpa !== undefined ? parseFloat(updateData.averagePackageLpa) : undefined,
        highestPackageLpa: updateData.highestPackageLpa !== undefined ? parseFloat(updateData.highestPackageLpa) : undefined
      }
    });

    res.json({
      success: true,
      message: 'Company details updated.',
      company
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update company.' });
  }
});

// DELETE /api/companies/:id (Admin only)
router.delete('/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.company.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Company and associated placement data deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete company.' });
  }
});

export default router;
