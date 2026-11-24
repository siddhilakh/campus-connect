export type Role = 'STUDENT' | 'SENIOR' | 'PLACEMENT_ADMIN' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  collegeId: string;
  department?: string | null;
  batch?: string | null;
  rollNumber?: string | null;
  avatar?: string | null;
  phone?: string | null;
  seniorProfile?: SeniorProfile | null;
  college?: {
    id: string;
    name: string;
    code: string;
    logo?: string | null;
  };
}

export interface SeniorProfile {
  id: string;
  userId: string;
  currentCompany: string;
  jobRole: string;
  packageLpa?: number | null;
  graduationYear: string;
  bio: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  expertiseTopics: string;
  isAvailableForMentorship: boolean;
}

export interface Company {
  id: string;
  collegeId: string;
  name: string;
  industry: string;
  logo?: string | null;
  website?: string | null;
  description: string;
  tier: string;
  batch: string;
  rolesOffered: string;
  eligibilityCriteria: string;
  minCgpa?: number | null;
  allowedBranches: string;
  packageRange: string;
  averagePackageLpa?: number | null;
  highestPackageLpa?: number | null;
  status: string;
  _count?: {
    placementRecords: number;
    experiences: number;
  };
  placementRecords?: PlacementRecord[];
  experiences?: InterviewExperience[];
}

export interface PlacementRecord {
  id: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    tier: string;
    logo?: string | null;
  };
  studentName: string;
  rollNumber: string;
  department: string;
  batch: string;
  role: string;
  packageLpa: number;
  offerDate: string;
  offerType: string;
  isVerified: boolean;
  verifiedBy?: string | null;
  source: string;
}

export interface PlacementStatistics {
  academicYear: string;
  placedStudents: number;
  eligibleStudents: number;
  placementPercentage: number;
  highestPackageLpa: number;
  averagePackageLpa: number;
  lowestPackageLpa: number;
  totalCompaniesVisited: number;
  totalOffersMade: number;
  departmentBreakdown: Array<{
    department: string;
    placed: number;
    total: number;
    percentage: number;
  }>;
  packageDistribution: Array<{
    range: string;
    count: number;
    label: string;
  }>;
  sourceInfo: string;
  lastUpdated: string;
}

export interface InterviewRound {
  id?: string;
  roundNumber: number;
  roundName: string;
  durationMinutes?: number | null;
  description: string;
  questionsAsked: string;
  tips?: string | null;
}

export interface InterviewExperience {
  id: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    logo?: string | null;
    tier: string;
  };
  authorId: string;
  author: {
    id: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
    department?: string | null;
    batch?: string | null;
    seniorProfile?: {
      currentCompany: string;
      jobRole: string;
      linkedinUrl?: string | null;
    } | null;
  };
  role: string;
  batch: string;
  packageLpa?: number | null;
  difficulty: string;
  outcome: string;
  overallSummary: string;
  preparationStrategy: string;
  tipsAndAdvice: string;
  topicsCovered: string;
  status: string;
  isVerified: boolean;
  rounds: InterviewRound[];
  isBookmarked?: boolean;
  questions?: Question[];
  createdAt: string;
}

export interface Question {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    avatar?: string | null;
    department?: string | null;
    batch?: string | null;
  };
  seniorId: string;
  senior?: {
    id: string;
    name: string;
    avatar?: string | null;
    seniorProfile?: SeniorProfile | null;
  };
  experienceId?: string | null;
  experience?: {
    id: string;
    role: string;
    company: { name: string };
  } | null;
  title: string;
  content: string;
  isAnswered: boolean;
  answers: Answer[];
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
    role: string;
  };
  content: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  resourceType: string;
  url: string;
  tags: string;
  company?: { id: string; name: string } | null;
  role?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}
