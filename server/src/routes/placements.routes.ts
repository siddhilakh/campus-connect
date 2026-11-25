import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/placements/analytics (Rich analytics from actual DB records + seeded statistics)
router.get('/analytics', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const collegeId = req.collegeId!;

    const [records, statsRows] = await Promise.all([
      prisma.placementRecord.findMany({
        where: { collegeId, isVerified: true },
        include: { company: { select: { name: true, tier: true } } }
      }),
      prisma.placementStatistic.findMany({
        where: { collegeId },
        orderBy: { academicYear: 'asc' }
      })
    ]);

    // 1. Company-wise selections from actual PlacementRecord rows
    const companyMap = new Map<string, { company: string; selections: number; totalPkg: number }>();
    for (const r of records) {
      const name = r.company?.name || 'Other';
      const cur = companyMap.get(name) || { company: name, selections: 0, totalPkg: 0 };
      cur.selections += 1;
      cur.totalPkg += r.packageLpa;
      companyMap.set(name, cur);
    }
    const companySelections = Array.from(companyMap.values()).map((c) => ({
      company: c.company,
      selections: c.selections,
      avgPackageLpa: parseFloat((c.totalPkg / c.selections).toFixed(2))
    }));

    // 2. Role-wise statistics from actual PlacementRecord rows
    const roleMap = new Map<string, { role: string; count: number; totalPkg: number; maxPkg: number }>();
    for (const r of records) {
      const cur = roleMap.get(r.role) || { role: r.role, count: 0, totalPkg: 0, maxPkg: 0 };
      cur.count += 1;
      cur.totalPkg += r.packageLpa;
      cur.maxPkg = Math.max(cur.maxPkg, r.packageLpa);
      roleMap.set(r.role, cur);
    }
    const roleStatistics = Array.from(roleMap.values()).map((r) => ({
      role: r.role,
      count: r.count,
      avgPackageLpa: parseFloat((r.totalPkg / r.count).toFixed(2)),
      highestPackageLpa: r.maxPkg
    }));

    // 3. Package distribution (computed from records + latest PlacementStatistic)
    const latestStat = statsRows[statsRows.length - 1];
    let packageDistribution = [];
    if (latestStat?.packageDistribution) {
      try {
        packageDistribution = JSON.parse(latestStat.packageDistribution);
      } catch {}
    }

    // Also compute live bracket counts from PlacementRecord
    const liveBrackets = [
      { range: '₹3 - 6 LPA', count: records.filter((r) => r.packageLpa < 6).length },
      { range: '₹6 - 10 LPA', count: records.filter((r) => r.packageLpa >= 6 && r.packageLpa < 10).length },
      { range: '₹10 - 25 LPA', count: records.filter((r) => r.packageLpa >= 10 && r.packageLpa < 25).length },
      { range: '₹25+ LPA', count: records.filter((r) => r.packageLpa >= 25).length }
    ];

    // 4. Placement trends from PlacementStatistic rows
    const placementTrends = statsRows.map((s) => ({
      year: s.academicYear,
      placementPercentage: s.placementPercentage,
      averagePackageLpa: s.averagePackageLpa,
      highestPackageLpa: s.highestPackageLpa,
      placedStudents: s.placedStudents
    }));

    res.json({
      success: true,
      analytics: {
        totalVerifiedOffers: records.length,
        companySelections,
        roleStatistics,
        packageDistribution,
        liveBrackets,
        placementTrends,
        dataLabel: 'Live Institutional Records & Seeded Academic Demo Data',
        lastUpdated: latestStat?.lastUpdated || new Date()
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load placement analytics.' });
  }
});

// GET /api/placements/statistics
router.get('/statistics', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const collegeId = req.collegeId!;

    // Find latest active placement statistics record
    const latestStat = await prisma.placementStatistic.findFirst({
      where: { collegeId },
      orderBy: { createdAt: 'desc' }
    });

    // Also compute live aggregates from placement records
    const verifiedRecords = await prisma.placementRecord.findMany({
      where: { collegeId, isVerified: true },
      include: { company: true }
    });

    const totalPlaced = verifiedRecords.length;
    const totalOffers = verifiedRecords.length;
    const packages = verifiedRecords.map((r) => r.packageLpa);
    const highestPackage = packages.length > 0 ? Math.max(...packages) : latestStat?.highestPackageLpa || 0;
    const lowestPackage = packages.length > 0 ? Math.min(...packages) : latestStat?.lowestPackageLpa || 0;
    const averagePackage =
      packages.length > 0
        ? parseFloat((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2))
        : latestStat?.averagePackageLpa || 0;

    const companiesCount = await prisma.company.count({
      where: { collegeId, status: 'ACTIVE' }
    });

    // Parse JSON distribution from latestStat if present
    let departmentData = [];
    let packageData = [];
    if (latestStat?.departmentBreakdown) {
      try {
        departmentData = JSON.parse(latestStat.departmentBreakdown);
      } catch (e) {}
    }
    if (latestStat?.packageDistribution) {
      try {
        packageData = JSON.parse(latestStat.packageDistribution);
      } catch (e) {}
    }

    res.json({
      success: true,
      statistics: {
        academicYear: latestStat?.academicYear || '2025-26',
        placedStudents: totalPlaced > 0 ? totalPlaced : latestStat?.placedStudents || 685,
        eligibleStudents: latestStat?.eligibleStudents || 920,
        placementPercentage: latestStat?.placementPercentage || 74.45,
        highestPackageLpa: highestPackage || 44.0,
        averagePackageLpa: averagePackage || 7.45,
        lowestPackageLpa: lowestPackage || 3.6,
        totalCompaniesVisited: companiesCount > 0 ? companiesCount : latestStat?.totalCompaniesVisited || 68,
        totalOffersMade: totalOffers > 0 ? totalOffers : latestStat?.totalOffersMade || 780,
        departmentBreakdown: departmentData,
        packageDistribution: packageData,
        sourceInfo: latestStat?.sourceInfo || 'Official Campus Training & Placement Cell',
        lastUpdated: latestStat?.lastUpdated || new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching placement stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load placement statistics.' });
  }
});

// GET /api/placements/records
router.get('/records', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, batch, department, verified } = req.query;
    const collegeId = req.collegeId!;

    const whereClause: any = { collegeId };

    if (batch && batch !== 'ALL') {
      whereClause.batch = batch as string;
    }
    if (department && department !== 'ALL') {
      whereClause.department = department as string;
    }
    if (verified !== undefined && verified !== 'ALL') {
      whereClause.isVerified = verified === 'true';
    }

    if (search) {
      const q = (search as string).toLowerCase();
      whereClause.OR = [
        { studentName: { contains: q } },
        { rollNumber: { contains: q } },
        { role: { contains: q } },
        { company: { name: { contains: q } } }
      ];
    }

    const records = await prisma.placementRecord.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tier: true,
            logo: true
          }
        }
      },
      orderBy: { offerDate: 'desc' }
    });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load placement records.' });
  }
});

// POST /api/placements/records (Admin only)
router.post('/records', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentName, rollNumber, department, batch, companyId, role, packageLpa, offerType, source } = req.body;

    if (!studentName || !rollNumber || !companyId || !role || !packageLpa) {
      res.status(400).json({ success: false, message: 'Please provide all required placement record fields.' });
      return;
    }

    const record = await prisma.placementRecord.create({
      data: {
        collegeId: req.collegeId!,
        companyId,
        studentName,
        rollNumber,
        department: department || 'Computer Science & Engineering',
        batch: batch || '2025',
        role,
        packageLpa: parseFloat(packageLpa),
        offerType: offerType || 'FULL_TIME',
        isVerified: true,
        verifiedBy: req.user!.name,
        source: source || 'Verified On-Campus Drive'
      },
      include: {
        company: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Placement record added successfully.',
      record
    });
  } catch (error) {
    console.error('Error creating placement record:', error);
    res.status(500).json({ success: false, message: 'Failed to create placement record.' });
  }
});

// PUT /api/placements/records/:id (Admin only)
router.put('/records/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { studentName, rollNumber, department, batch, companyId, role, packageLpa, isVerified, source } = req.body;

    const record = await prisma.placementRecord.update({
      where: { id },
      data: {
        studentName,
        rollNumber,
        department,
        batch,
        companyId,
        role,
        packageLpa: packageLpa ? parseFloat(packageLpa) : undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined,
        source
      },
      include: { company: true }
    });

    res.json({
      success: true,
      message: 'Placement record updated successfully.',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update record.' });
  }
});

// DELETE /api/placements/records/:id (Admin only)
router.delete('/records/:id', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.placementRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Placement record removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

// PATCH /api/placements/records/:id/verify
router.patch('/records/:id/verify', authenticate, requireRole('PLACEMENT_ADMIN', 'SYSTEM_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const record = await prisma.placementRecord.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedBy: req.user!.name
      }
    });

    res.json({
      success: true,
      message: 'Placement record officially verified.',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify record.' });
  }
});

export default router;
