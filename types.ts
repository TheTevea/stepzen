export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'Onsite';
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Design' | 'Mobile' | 'Data';
  postedDate: string;
  deadline: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  duration?: string;
  stipend?: string;
  telegramApplyLink: string;
}

export interface FilterState {
  search: string;
  location: string;
  type: string;
  category: string;
  sort: 'newest' | 'deadline' | 'alpha';
}

// ─── Admin / Role types ───────────────────────────────────────────────────────

export type UserRole = 'SEEKER' | 'EMPLOYER' | 'ADMIN';

export type JobStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type ReportReason =
  | 'SPAM'
  | 'SCAM'
  | 'INAPPROPRIATE'
  | 'DUPLICATE'
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBanned: boolean;
  banReason?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminJob {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location?: string;
  jobType?: string;
  telegramLink: string;
  categoryId: string;
  createdById: string;
  status: JobStatus;
  reviewedById?: string;
  reviewNote?: string;
  publishedAt?: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface JobReport {
  id: string;
  jobId: string;
  reportedById?: string;
  reason: ReportReason;
  message?: string;
  status: ReportStatus;
  handledById?: string;
  handledNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: 'Job' | 'User' | 'Category' | 'Report';
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}