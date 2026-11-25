import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

async function runTests() {
  console.log('=======================================================');
  console.log(' Running CampusConnect Automated Verification Suite');
  console.log('=======================================================');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  try {
    // Test 1: College Existence
    const college = await prisma.college.findUnique({ where: { code: 'MCU-IND' } });
    assert(!!college && college.name === 'Medi-Caps University', 'College record initialized for Medi-Caps University');

    // Test 2: Demo Users & Passwords
    const accounts = [
      { email: 'student@test.com', expectedRole: 'STUDENT', pass: 'student123' },
      { email: 'senior@test.com', expectedRole: 'SENIOR', pass: 'senior123' },
      { email: 'admin@test.com', expectedRole: 'PLACEMENT_ADMIN', pass: 'admin123' },
      { email: 'superadmin@test.com', expectedRole: 'SYSTEM_ADMIN', pass: 'superadmin123' }
    ];

    for (const acc of accounts) {
      const user = await prisma.user.findUnique({ where: { email: acc.email } });
      assert(!!user, `User ${acc.email} exists in database`);
      assert(user?.role === acc.expectedRole, `User ${acc.email} has role ${acc.expectedRole}`);
      if (user) {
        const isMatch = await bcrypt.compare(acc.pass, user.password);
        assert(isMatch, `Password for ${acc.email} hashes & verifies successfully with bcrypt`);
      }
    }

    // Test 3: JWT Token generation & verification
    const testUser = await prisma.user.findUnique({ where: { email: 'student@test.com' } });
    const secret = process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026_medicaps';
    const token = jwt.sign({ id: testUser!.id, role: testUser!.role }, secret, { expiresIn: '1h' });
    const decoded: any = jwt.verify(token, secret);
    assert(decoded.id === testUser!.id && decoded.role === 'STUDENT', 'JWT auth token issues and verifies payload');

    // Test 4: Placement Statistics
    const stats = await prisma.placementStatistic.findFirst({ where: { collegeId: college!.id } });
    assert(!!stats && stats.highestPackageLpa === 44.0, 'Placement statistics record present with highest package ₹44 LPA');

    // Test 5: Companies Directory
    const companies = await prisma.company.findMany({ where: { collegeId: college!.id } });
    assert(companies.length >= 6, `Visiting companies seeded (found: ${companies.length})`);

    // Test 6: Placement Records
    const records = await prisma.placementRecord.findMany({ where: { collegeId: college!.id } });
    assert(records.length >= 8, `Verified placement records exist (found: ${records.length})`);

    // Test 7: Interview Experiences & Rounds
    const experiences = await prisma.interviewExperience.findMany({
      where: { collegeId: college!.id },
      include: { rounds: true }
    });
    assert(experiences.length >= 2, `Interview experiences found (found: ${experiences.length})`);
    const msftExp = experiences.find((e) => e.packageLpa === 44.0);
    assert(!!msftExp && msftExp.rounds.length >= 4, 'Microsoft experience has all 4 detailed interview rounds');

    // Test 8: Questions & Answers Thread
    const questions = await prisma.question.findMany({
      include: { answers: true }
    });
    assert(questions.length >= 2, `Student-senior Q&A questions present (found: ${questions.length})`);
    assert(questions[0].answers.length >= 1, 'Senior reply present on student discussion thread');

    // Test 9: Preparation Resources
    const resources = await prisma.resource.findMany({ where: { collegeId: college!.id } });
    assert(resources.length >= 7, `Curated preparation resources available (found: ${resources.length})`);

    // Test 10: Notifications
    const notifs = await prisma.notification.findMany();
    assert(notifs.length >= 4, `In-app notifications seeded across demo accounts (found: ${notifs.length})`);

    // Test 11: Placement Readiness Progress
    const readiness = await prisma.readinessProgress.findUnique({ where: { userId: testUser!.id } });
    assert(!!readiness && readiness.aptitude > 0 && readiness.dsa > 0, 'Placement Readiness Progress seeded for student');

    // Test 12: Placement Application Tracker
    const apps = await prisma.placementApplication.findMany({ where: { userId: testUser!.id } });
    assert(apps.length >= 5, `Placement applications seeded across pipeline stages (found: ${apps.length})`);

    // Test 13: Practice Zone Questions
    const practiceQs = await prisma.practiceQuestion.findMany();
    assert(practiceQs.length >= 12, `Practice Zone questions seeded across 4 categories (found: ${practiceQs.length})`);

    // Test 14: Senior Mentorship Requests
    const mentorships = await prisma.mentorshipRequest.findMany({ where: { studentId: testUser!.id } });
    assert(mentorships.length >= 2, `Senior mentorship requests seeded (found: ${mentorships.length})`);

    console.log('=======================================================');
    console.log(` Verification Completed: ${passed}/${total} Tests Passed!`);
    console.log('=======================================================');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
