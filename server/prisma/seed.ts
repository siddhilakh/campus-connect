import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CampusConnect database...');

  // 1. Create or ensure College
  const college = await prisma.college.upsert({
    where: { code: 'MCU-IND' },
    update: {},
    create: {
      name: 'Medi-Caps University',
      code: 'MCU-IND',
      address: 'AB Road, Pigdamber, Rau, Indore, Madhya Pradesh 453331',
      website: 'https://www.medicaps.ac.in',
      logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80',
      placementEmail: 'placements@medicaps.ac.in',
      departments: 'Computer Science & Engineering, Information Technology, Electronics & Communication, Mechanical Engineering, Civil Engineering, Management Studies'
    }
  });

  console.log(`College verified: ${college.name}`);

  // 2. Hash passwords
  const studentPassword = await bcrypt.hash('student123', 10);
  const seniorPassword = await bcrypt.hash('senior123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const superadminPassword = await bcrypt.hash('superadmin123', 10);

  // 3. Create Predefined Demo Accounts
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      collegeId: college.id,
      email: 'student@test.com',
      password: studentPassword,
      name: 'Aarav Sharma',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      batch: '2025',
      rollNumber: 'EN24CS3010995',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const senior = await prisma.user.upsert({
    where: { email: 'senior@test.com' },
    update: {},
    create: {
      collegeId: college.id,
      email: 'senior@test.com',
      password: seniorPassword,
      name: 'Priya Mehta',
      role: 'SENIOR',
      department: 'Information Technology',
      batch: '2024',
      rollNumber: 'EN20IT3010042',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const seniorRahul = await prisma.user.upsert({
    where: { email: 'rahul.senior@test.com' },
    update: {},
    create: {
      collegeId: college.id,
      email: 'rahul.senior@test.com',
      password: seniorPassword,
      name: 'Rahul Singhania',
      role: 'SENIOR',
      department: 'Computer Science & Engineering',
      batch: '2023',
      rollNumber: 'EN19CS3010118',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const placementAdmin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      collegeId: college.id,
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Dr. Rajesh Verma',
      role: 'PLACEMENT_ADMIN',
      department: 'Central Career Cell',
      rollNumber: 'TPO-OFFICIAL-01',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    }
  });

  const systemAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@test.com' },
    update: {},
    create: {
      collegeId: college.id,
      email: 'superadmin@test.com',
      password: superadminPassword,
      name: 'Campus System Administrator',
      role: 'SYSTEM_ADMIN',
      department: 'Institutional IT & ERP',
      rollNumber: 'SYS-ADMIN-01',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log('Demo accounts seeded: student, senior, admin, superadmin');

  // 4. Create Senior Profiles
  await prisma.seniorProfile.upsert({
    where: { userId: senior.id },
    update: {},
    create: {
      userId: senior.id,
      currentCompany: 'Microsoft',
      jobRole: 'Software Development Engineer I',
      packageLpa: 44.0,
      graduationYear: '2024',
      bio: 'SDE at Microsoft Cloud Azure Core. Specializing in high-throughput backend services, LeetCode data structures, and helping juniors navigate technical interview rounds.',
      linkedinUrl: 'https://linkedin.com/in/priyamehta-demo',
      githubUrl: 'https://github.com/priyamehta-demo',
      expertiseTopics: 'DSA, System Design, Graph Algorithms, Dynamic Programming, Core CS',
      isAvailableForMentorship: true
    }
  });

  await prisma.seniorProfile.upsert({
    where: { userId: seniorRahul.id },
    update: {},
    create: {
      userId: seniorRahul.id,
      currentCompany: 'Amazon',
      jobRole: 'SDE I (AWS Platform)',
      packageLpa: 32.5,
      graduationYear: '2023',
      bio: 'AWS Cloud Engineer. Mentor for system architecture, operating systems, distributed storage, and behavioral STAR interviews.',
      linkedinUrl: 'https://linkedin.com/in/rahulsinghania-demo',
      githubUrl: 'https://github.com/rahulsinghania-demo',
      expertiseTopics: 'Cloud, AWS, Microservices, DBMS, OOP, Behavioral Rounds',
      isAvailableForMentorship: true
    }
  });

  // 5. Seed Companies
  const msft = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Microsoft',
      industry: 'Technology / Software Product',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      website: 'https://careers.microsoft.com',
      description: 'Global technology giant known for Windows, Azure Cloud, AI copilots, and enterprise developer tools.',
      tier: 'Super Dream',
      batch: '2025-26',
      rolesOffered: 'Software Development Engineer (SDE-1), Cloud Solution Architect',
      eligibilityCriteria: 'B.Tech CSE/IT/ECE · Minimum 7.5 CGPA · Zero active backlogs',
      minCgpa: 7.5,
      allowedBranches: 'CSE, IT, ECE',
      packageRange: '₹44.0 - ₹51.0 LPA',
      averagePackageLpa: 46.5,
      highestPackageLpa: 51.0,
      status: 'ACTIVE'
    }
  });

  const amzn = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Amazon',
      industry: 'E-commerce & Cloud Computing',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      website: 'https://amazon.jobs',
      description: 'Pioneers in e-commerce, cloud computing infrastructure (AWS), logistics, and artificial intelligence.',
      tier: 'Super Dream',
      batch: '2025-26',
      rolesOffered: 'Software Development Engineer, Cloud Associate, Operations Tech',
      eligibilityCriteria: 'B.Tech all branches · Minimum 7.0 CGPA · No backlogs at the time of drive',
      minCgpa: 7.0,
      allowedBranches: 'CSE, IT, ECE, EE',
      packageRange: '₹28.0 - ₹45.0 LPA',
      averagePackageLpa: 34.0,
      highestPackageLpa: 45.0,
      status: 'ACTIVE'
    }
  });

  const tcs = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Tata Consultancy Services (TCS)',
      industry: 'IT Services & Consulting',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      website: 'https://www.tcs.com/careers',
      description: 'Global leader in IT services, consulting, and business solutions with mass and premium recruitment drives.',
      tier: 'Tier 1',
      batch: '2025-26',
      rolesOffered: 'TCS Prime (₹9 LPA), TCS Digital (₹7 LPA), TCS Ninja (₹3.36 LPA)',
      eligibilityCriteria: 'B.Tech 60%+ in 10th, 12th, and undergraduate studies · Up to 1 backlog permitted',
      minCgpa: 6.0,
      allowedBranches: 'All Engineering Branches',
      packageRange: '₹3.36 - ₹9.0 LPA',
      averagePackageLpa: 6.2,
      highestPackageLpa: 9.0,
      status: 'ACTIVE'
    }
  });

  const infosys = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Infosys',
      industry: 'IT Services & Digital Transformation',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
      website: 'https://www.infosys.com/careers',
      description: 'Next-generation digital services provider recruiting for Specialist Programmer and Systems Engineer roles.',
      tier: 'Tier 1',
      batch: '2025-26',
      rolesOffered: 'Specialist Programmer (SP - ₹9.5 LPA), Digital Specialist Engineer (DSE - ₹6.5 LPA), Systems Engineer (₹3.6 LPA)',
      eligibilityCriteria: 'B.Tech 60%+ aggregate with strong programming fundamentals',
      minCgpa: 6.0,
      allowedBranches: 'CSE, IT, ECE, ME, CE',
      packageRange: '₹3.6 - ₹9.5 LPA',
      averagePackageLpa: 5.8,
      highestPackageLpa: 9.5,
      status: 'ACTIVE'
    }
  });

  const accenture = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Accenture',
      industry: 'Professional Services & Consulting',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
      website: 'https://www.accenture.com/in-en/careers',
      description: 'Global professional services company providing consulting, digital, technology and operations services.',
      tier: 'Tier 1',
      batch: '2025-26',
      rolesOffered: 'Advanced Associate Software Engineer (AASE - ₹6.5 LPA), Associate Software Engineer (ASE - ₹4.5 LPA)',
      eligibilityCriteria: 'B.Tech 65% aggregate · No active backlogs during onboarding',
      minCgpa: 6.5,
      allowedBranches: 'All Branches',
      packageRange: '₹4.5 - ₹6.5 LPA',
      averagePackageLpa: 5.2,
      highestPackageLpa: 6.5,
      status: 'ACTIVE'
    }
  });

  const cisco = await prisma.company.create({
    data: {
      collegeId: college.id,
      name: 'Cisco Systems',
      industry: 'Networking & Telecommunications',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
      website: 'https://jobs.cisco.com',
      description: 'Worldwide leader in technology that powers the Internet, cybersecurity, and cloud infrastructure.',
      tier: 'Dream',
      batch: '2025-26',
      rolesOffered: 'Software Engineer, Network Consulting Engineer',
      eligibilityCriteria: 'B.Tech CSE/IT/ECE · 7.5+ CGPA · Deep knowledge of Computer Networks and OS',
      minCgpa: 7.5,
      allowedBranches: 'CSE, IT, ECE',
      packageRange: '₹14.0 - ₹24.0 LPA',
      averagePackageLpa: 17.5,
      highestPackageLpa: 24.0,
      status: 'UPCOMING'
    }
  });

  console.log('Seeded 6 major companies');

  // 6. Placement Statistics
  await prisma.placementStatistic.create({
    data: {
      collegeId: college.id,
      academicYear: '2025-26 (Current Batch)',
      totalStudents: 1050,
      eligibleStudents: 920,
      placedStudents: 685,
      placementPercentage: 74.45,
      highestPackageLpa: 44.0,
      averagePackageLpa: 7.45,
      medianPackageLpa: 6.0,
      lowestPackageLpa: 3.6,
      totalCompaniesVisited: 68,
      totalOffersMade: 780,
      departmentBreakdown: JSON.stringify([
        { department: 'Computer Science', placed: 310, total: 360, percentage: 86.1 },
        { department: 'Information Tech', placed: 165, total: 190, percentage: 86.8 },
        { department: 'Electronics & Comm', placed: 120, total: 180, percentage: 66.6 },
        { department: 'Mechanical & Civil', placed: 90, total: 190, percentage: 47.3 }
      ]),
      packageDistribution: JSON.stringify([
        { range: '₹3 - 5 LPA', count: 320, label: 'Standard' },
        { range: '₹5 - 8 LPA', count: 210, label: 'Core / IT' },
        { range: '₹8 - 15 LPA', count: 110, label: 'Dream' },
        { range: '₹15 - 50 LPA', count: 45, label: 'Super Dream' }
      ]),
      sourceInfo: 'Official Central Training and Placement Cell Records - Verified',
      lastUpdated: new Date()
    }
  });

  await prisma.placementStatistic.create({
    data: {
      collegeId: college.id,
      academicYear: '2024-25',
      totalStudents: 1020,
      eligibleStudents: 890,
      placedStudents: 785,
      placementPercentage: 88.2,
      highestPackageLpa: 42.5,
      averagePackageLpa: 6.85,
      medianPackageLpa: 5.5,
      lowestPackageLpa: 3.5,
      totalCompaniesVisited: 94,
      totalOffersMade: 910,
      departmentBreakdown: JSON.stringify([
        { department: 'Computer Science', placed: 335, total: 350, percentage: 95.7 },
        { department: 'Information Tech', placed: 180, total: 190, percentage: 94.7 },
        { department: 'Electronics & Comm', placed: 145, total: 180, percentage: 80.5 },
        { department: 'Mechanical & Civil', placed: 125, total: 170, percentage: 73.5 }
      ]),
      packageDistribution: JSON.stringify([
        { range: '₹3 - 5 LPA', count: 410, label: 'Standard' },
        { range: '₹5 - 8 LPA', count: 235, label: 'Core / IT' },
        { range: '₹8 - 15 LPA', count: 102, label: 'Dream' },
        { range: '₹15 - 50 LPA', count: 38, label: 'Super Dream' }
      ]),
      sourceInfo: 'Official Placement Records - Archived',
      lastUpdated: new Date('2025-06-30')
    }
  });

  // 7. Seed Placement Records
  const placementData = [
    { studentName: 'Priya Mehta', rollNumber: 'EN20IT3010042', department: 'Information Technology', batch: '2024', role: 'Software Development Engineer I', packageLpa: 44.0, companyId: msft.id },
    { studentName: 'Rahul Singhania', rollNumber: 'EN19CS3010118', department: 'Computer Science & Engineering', batch: '2023', role: 'SDE I', packageLpa: 32.5, companyId: amzn.id },
    { studentName: 'Ananya Deshmukh', rollNumber: 'EN21CS3010012', department: 'Computer Science & Engineering', batch: '2025', role: 'TCS Prime Developer', packageLpa: 9.0, companyId: tcs.id },
    { studentName: 'Rohan Gupta', rollNumber: 'EN21IT3010084', department: 'Information Technology', batch: '2025', role: 'Specialist Programmer', packageLpa: 9.5, companyId: infosys.id },
    { studentName: 'Kavita Nair', rollNumber: 'EN21EC3010034', department: 'Electronics & Communication', batch: '2025', role: 'Advanced Associate Software Engineer', packageLpa: 6.5, companyId: accenture.id },
    { studentName: 'Sameer Khan', rollNumber: 'EN21CS3010145', department: 'Computer Science & Engineering', batch: '2025', role: 'TCS Digital Engineer', packageLpa: 7.0, companyId: tcs.id },
    { studentName: 'Sneha Patel', rollNumber: 'EN21IT3010099', department: 'Information Technology', batch: '2025', role: 'Associate Software Engineer', packageLpa: 4.5, companyId: accenture.id },
    { studentName: 'Vikas Joshi', rollNumber: 'EN21CS3010210', department: 'Computer Science & Engineering', batch: '2025', role: 'Digital Specialist Engineer', packageLpa: 6.5, companyId: infosys.id }
  ];

  for (const record of placementData) {
    await prisma.placementRecord.create({
      data: {
        collegeId: college.id,
        companyId: record.companyId,
        studentName: record.studentName,
        rollNumber: record.rollNumber,
        department: record.department,
        batch: record.batch,
        role: record.role,
        packageLpa: record.packageLpa,
        offerType: 'FULL_TIME',
        isVerified: true,
        verifiedBy: 'Dr. Rajesh Verma (TPO)',
        source: 'Campus On-Campus Drive Records 2024-25'
      }
    });
  }

  console.log('Seeded placement records');

  // 8. Seed Detailed Interview Experiences
  const msftExp = await prisma.interviewExperience.create({
    data: {
      collegeId: college.id,
      companyId: msft.id,
      authorId: senior.id,
      role: 'Software Development Engineer I',
      batch: '2024',
      packageLpa: 44.0,
      difficulty: 'Hard',
      outcome: 'Selected',
      overallSummary: 'The interview process consisted of an online coding round followed by 3 rounds of technical interviews and 1 hiring manager interview. The focus was heavily on clean, modular code, problem-solving under pressure, and understanding space-time complexity trade-offs.',
      preparationStrategy: 'I solved around 250 problems on LeetCode with emphasis on Binary Trees, Graphs, Dynamic Programming, and Heaps. For core subjects, I revised DBMS indexing, OS concurrency (mutex vs semaphore), and practiced mock interviews on Pramp.',
      tipsAndAdvice: 'Never jump straight into writing code! Talk out loud, clarify constraints (e.g. negative numbers, duplicates), validate your approach with a dry run on small examples, and write clean variable names.',
      topicsCovered: 'Binary Trees, Dynamic Programming, Graph Shortest Path, Operating Systems, Database Indexing, System Design Basics',
      status: 'APPROVED',
      isVerified: true,
      rounds: {
        create: [
          {
            roundNumber: 1,
            roundName: 'Online Coding Assessment (OA)',
            durationMinutes: 90,
            description: 'Conducted on Codility. 3 algorithmic coding challenges with rigorous hidden test cases.',
            questionsAsked: '1. Finding the maximum sum of non-adjacent elements in a circular array (variation of House Robber II). 2. Shortest cycle in an undirected graph. 3. String transformation with minimum character swaps.',
            tips: 'Test corner cases like single-element arrays and large integer constraints to avoid integer overflow.'
          },
          {
            roundNumber: 2,
            roundName: 'Technical Round 1 (Data Structures)',
            durationMinutes: 60,
            description: 'One-on-one virtual whiteboard interview with a Senior SDE from Azure.',
            questionsAsked: 'Lowest Common Ancestor in a Binary Tree with deep optimization. Follow-up: What if parent pointers are provided? Then asked about Trie implementation for prefix search and autocomplete.',
            tips: 'Explain your reasoning before typing. Write production-level code with error checking.'
          },
          {
            roundNumber: 3,
            roundName: 'Technical Round 2 (LLD & Core CS)',
            durationMinutes: 60,
            description: 'Object Oriented Design and Operating Systems fundamentals.',
            questionsAsked: 'Design an in-memory LRU Cache with O(1) get and put operations using Doubly Linked List and Hash Map. Follow-up questions on process synchronization, deadlock prevention conditions, and B-Trees vs Hash indexes.',
            tips: 'Use standard OOP design patterns. Clearly articulate trade-offs between memory and speed.'
          },
          {
            roundNumber: 4,
            roundName: 'Hiring Manager & Culture Fit',
            durationMinutes: 45,
            description: 'Discussion with the Director of Engineering on past academic projects and cultural alignment.',
            questionsAsked: 'Deep dive into my final year distributed chat project: How did you handle message ordering and server failovers? Behavioral questions on handling disagreements in technical architecture.',
            tips: 'Use the STAR technique (Situation, Task, Action, Result) for behavioral answers.'
          }
        ]
      }
    }
  });

  const tcsExp = await prisma.interviewExperience.create({
    data: {
      collegeId: college.id,
      companyId: tcs.id,
      authorId: seniorRahul.id,
      role: 'TCS Digital Engineer',
      batch: '2023',
      packageLpa: 7.0,
      difficulty: 'Medium',
      outcome: 'Selected',
      overallSummary: 'TCS National Qualifier Test (NQT) followed by a combined Technical, Managerial, and HR interview. Clearing the Advanced Coding section in NQT was key to qualifying for the Digital/Prime interview band.',
      preparationStrategy: 'Prepared quantitative aptitude and logical reasoning from PrepInsta and IndiaBix. Practiced medium level coding questions on arrays, strings, hashing, and revised SQL queries (JOINs, GROUP BY, HAVING).',
      tipsAndAdvice: 'Confidence and good spoken English matter a lot in the MR/HR round. In the technical round, be honest—if you do not know a specific concept, politely admit it and explain what you do know.',
      topicsCovered: 'Aptitude, SQL Joins, Basic Coding, OOP Concepts, SDLC, Cloud Basics',
      status: 'APPROVED',
      isVerified: true,
      rounds: {
        create: [
          {
            roundNumber: 1,
            roundName: 'TCS NQT (Cognitive + Advanced Coding)',
            durationMinutes: 120,
            description: 'Sectional timed test: Numerical Ability, Reasoning, Verbal, and 2 programming problems.',
            questionsAsked: 'Problem 1: Matrix spiral traversal. Problem 2: Counting distinct palindromic substrings. Aptitude had speed math and probability.',
            tips: 'Time management is essential. Do not spend more than 1.5 minutes per aptitude question.'
          },
          {
            roundNumber: 2,
            roundName: 'TR + MR + HR Combined Panel',
            durationMinutes: 40,
            description: 'Panel of 3 interviewers covering technical fundamentals, managerial scenarios, and HR fit.',
            questionsAsked: 'Technical: Explain the difference between primary key and unique key. Write a SQL query to find the 2nd highest salary. Managerial: How will you handle a tight project deadline? HR: Willing to work in shifts and relocate?',
            tips: 'Keep your camera at eye level, wear formal attire, and have a clear resume in front of you.'
          }
        ]
      }
    }
  });

  console.log('Seeded interview experiences with multi-round breakdowns');

  // 9. Seed Questions & Answers
  const question1 = await prisma.question.create({
    data: {
      studentId: student.id,
      seniorId: senior.id,
      experienceId: msftExp.id,
      title: 'How should a 3rd year student structure daily preparation for Tier-1 companies?',
      content: 'Hi Priya, I am currently in 6th semester. I find it difficult to balance semester college exams with LeetCode. How many hours did you dedicate daily, and what roadmap would you suggest?',
      isAnswered: true
    }
  });

  await prisma.answer.create({
    data: {
      questionId: question1.id,
      authorId: senior.id,
      content: 'Hi Aarav! Consistency beats marathon weekend sessions. Dedicate 2 focused hours daily: 1 hour for 1-2 coding problems (aim for quality over quantity, understand patterns), and 1 hour for Core CS subjects (DBMS, OS, Networks). During exam months, drop coding to 3-4 problems a week and focus on academics, since maintaining a 7.5+ CGPA is a mandatory cutoff for Microsoft, Cisco, and Goldman Sachs.'
    }
  });

  const question2 = await prisma.question.create({
    data: {
      studentId: student.id,
      seniorId: seniorRahul.id,
      experienceId: tcsExp.id,
      title: 'Are web development projects valued during mass and premium IT drives?',
      content: 'I have built a couple of MERN stack projects. Will interviewers ask me to write React code or do they strictly stick to DSA and Java/C++?',
      isAnswered: true
    }
  });

  await prisma.answer.create({
    data: {
      questionId: question2.id,
      authorId: seniorRahul.id,
      content: 'Yes, absolutely! Having full-stack projects gives you something tangible to drive the interview discussion. They will ask how your APIs communicate, how state is managed, how you handled database schema design, and how you secured user passwords. Be ready to explain your architecture on paper.'
    }
  });

  // 10. Seed Bookmarks
  await prisma.bookmark.create({
    data: {
      userId: student.id,
      experienceId: msftExp.id
    }
  });

  // 11. Seed Preparation Resources
  const resources = [
    {
      title: 'Striver SDE Sheet & A2Z DSA Course',
      category: 'DSA & Coding',
      description: 'The most popular step-by-step curriculum for college students preparing for product and service interviews.',
      difficulty: 'Intermediate',
      resourceType: 'Curated Sheet & Videos',
      url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
      tags: 'DSA, Arrays, Trees, DP, LeetCode'
    },
    {
      title: 'NeetCode 150 Practice Roadmap',
      category: 'DSA & Coding',
      description: '150 handpicked LeetCode problems grouped cleanly by algorithmic patterns with interactive video solutions.',
      difficulty: 'Advanced',
      resourceType: 'Interactive Problem Set',
      url: 'https://neetcode.io/practice',
      tags: 'Patterns, Two Pointers, Graphs, Backtracking'
    },
    {
      title: 'System Design Primer by Donne Martin',
      category: 'System Design',
      description: 'Comprehensive open-source guide to learning how to design large-scale distributed systems and web architectures.',
      difficulty: 'Advanced',
      resourceType: 'Comprehensive Guide',
      url: 'https://github.com/donnemartin/system-design-primer',
      tags: 'Scalability, Caching, Load Balancing, SQL vs NoSQL'
    },
    {
      title: 'Gate Smashers - Operating Systems Crash Course',
      category: 'Core CS',
      description: 'Crystal-clear video explanations on CPU scheduling, deadlocks, paging, virtual memory, and process synchronization.',
      difficulty: 'Beginner',
      resourceType: 'Video Playlist',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdPvP',
      tags: 'OS, Scheduling, Deadlocks, Paging'
    },
    {
      title: 'DBMS Normalization & SQL Queries Mastery',
      category: 'Core CS',
      description: 'Complete notes on 1NF, 2NF, 3NF, BCNF, ACID properties, indexing, and the top 50 interview SQL queries.',
      difficulty: 'Intermediate',
      resourceType: 'Notes & Practice Queries',
      url: 'https://www.geeksforgeeks.org/sql-interview-questions/',
      tags: 'DBMS, SQL, Normalization, ACID'
    },
    {
      title: 'IndiaBix Quantitative Aptitude & Reasoning Bank',
      category: 'Aptitude & Reasoning',
      description: 'Essential practice portal for TCS NQT, Infosys, and Accenture aptitude screening tests.',
      difficulty: 'Beginner',
      resourceType: 'Practice Bank',
      url: 'https://www.indiabix.com/aptitude/questions-and-answers/',
      tags: 'Aptitude, Time & Work, Speed, Probability'
    },
    {
      title: 'STAR Method Framework for Behavioral & HR Interviews',
      category: 'HR & Behavioral',
      description: 'A structured blueprint for framing compelling answers for situational, leadership, and team conflict questions.',
      difficulty: 'Beginner',
      resourceType: 'Guide & Templates',
      url: 'https://www.thebalancemoney.com/what-is-the-star-interview-response-technique-2061629',
      tags: 'HR, Behavioral, STAR, Leadership'
    }
  ];

  for (const res of resources) {
    await prisma.resource.create({
      data: {
        collegeId: college.id,
        title: res.title,
        category: res.category,
        description: res.description,
        difficulty: res.difficulty,
        resourceType: res.resourceType,
        url: res.url,
        tags: res.tags
      }
    });
  }

  // 12. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Answer Received on Senior Connect',
      message: 'Priya Mehta answered your question regarding 3rd year preparation for Tier-1 companies.',
      type: 'ANSWER_RECEIVED',
      link: '/senior-connect'
    }
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'New Placement Drive Announced: Cisco Systems',
      message: 'Cisco Systems has opened registrations for Software Engineer roles (₹14 - 24 LPA). Check eligibility criteria.',
      type: 'PLACEMENT_UPDATE',
      link: '/companies'
    }
  });

  await prisma.notification.create({
    data: {
      userId: senior.id,
      title: 'New Question Received from Aarav Sharma',
      message: 'A junior asked you a question about balancing semester exams with competitive programming.',
      type: 'QUESTION_RECEIVED',
      link: '/senior-dashboard'
    }
  });

  await prisma.notification.create({
    data: {
      userId: placementAdmin.id,
      title: 'New Interview Experience Submitted for Review',
      message: 'A new senior interview experience for Microsoft SDE-1 has been auto-verified and published.',
      type: 'MODERATION_UPDATE',
      link: '/admin/manage-placements'
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
