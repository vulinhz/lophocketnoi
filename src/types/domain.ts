export type UserRole = 'ADMIN' | 'GVCN' | 'PARENT' | 'STUDENT';

export type ClassId = '7A1' | '7A3' | '10A2' | '11A1' | '11A2';

export type ContentStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED';

export type ObservationCategory =
  | 'Học tập'
  | 'Kỷ luật & Nề nếp'
  | 'Kỹ năng xã hội'
  | 'Cảm xúc & Tâm lý'
  | 'Hoạt động phong trào';

export interface DemoAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  title: string;
  avatarUrl?: string;
  assignedClassId?: ClassId;
  linkedStudentId?: string;
  teacherId?: string;
  parentId?: string;
}

export interface Classroom {
  id: ClassId;
  name: string;
  gradeLevel: 7 | 10 | 11;
  schoolLevel: 'THCS' | 'THPT';
  academicYear: string;
  room: string;
  homeroomTeacherId: string;
  targetCount: number;
  motto: string;
  weeklyFocus: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  phone: string;
  gender: 'female' | 'male';
  avatarUrl: string;
  assignedClassId: ClassId;
  yearsExperience: number;
  bio: string;
}

export interface AvatarPalette {
  bg: string;
  fg: string;
  accent: string;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string; // YYYY-MM-DD
  classId: ClassId;
  parentId: string;
  parentName: string;
  parentPhone: string;
  gpa: number;
  conduct: 'Tốt' | 'Khá' | 'Đạt';
  attendanceRate: number;
  needsAttention: boolean;
  attentionReason?: string;
  strengths: string[];
  focusAreas: string[];
  interests: string[];
  personalityNote: string;
  avatarPalette: AvatarPalette;
  effortPoints: number;
  badgeIds: string[];
}

export interface ParentProfile {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  relationship: 'Mẹ' | 'Bố' | 'Người giám hộ';
  occupation: string;
  linkedStudentIds: string[];
  isDemoAccount: boolean;
}

export interface Observation {
  id: string;
  studentId: string;
  classId: ClassId;
  teacherId: string;
  category: ObservationCategory;
  sentiment: 'positive' | 'neutral' | 'attention';
  title: string;
  content: string;
  observedAt: string; // ISO date YYYY-MM-DD
  tags: string[];
}

export interface SelfAssessment {
  id: string;
  studentId: string;
  classId: ClassId;
  weekLabel: string;
  submittedAt: string;
  mood: 'Hào hứng' | 'Ổn định' | 'Cần hỗ trợ' | 'Hơi căng thẳng';
  focusScore: number; // 1-5
  studyHoursPerDay: number;
  weeklyWin: string;
  challenge: string;
  supportNeeded: string;
}

export interface ApprovalHistoryItem {
  id: string;
  action: 'CREATED_DRAFT' | 'EDITED' | 'APPROVED' | 'PUBLISHED' | 'REVERTED_TO_DRAFT';
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  note?: string;
}

export interface PeriodicComment {
  id: string;
  studentId: string;
  classId: ClassId;
  teacherId: string;
  periodLabel: string;
  status: ContentStatus;
  content: string;
  encouragementText: string;
  homeCompanionTip: string;
  isAiGenerated: boolean;
  aiSource: 'gemini' | 'mock-ai' | 'manual';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  approvalHistory: ApprovalHistoryItem[];
}

export interface Announcement {
  id: string;
  classId: ClassId | 'ALL';
  teacherId: string;
  title: string;
  content: string;
  category: 'Học tập' | 'Sự kiện lớp' | 'Phối hợp phụ huynh' | 'Nhắc nhở tuần';
  status: 'DRAFT' | 'PUBLISHED';
  isAiGenerated: boolean;
  aiSource: 'gemini' | 'mock-ai' | 'manual';
  createdAt: string;
  publishedAt?: string;
  readByParentIds: string[];
  targetParentCount: number;
}

export interface ParentFeedback {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  classId: ClassId;
  topic: 'Học tập' | 'Tâm lý - Nề nếp' | 'Sức khỏe' | 'Đề xuất lớp học';
  message: string;
  createdAt: string;
  teacherReply?: string;
  repliedAt?: string;
  isResolved: boolean;
}

export interface WeeklyGoal {
  id: string;
  studentId: string;
  classId: ClassId;
  weekLabel: string;
  title: string;
  category: 'Học tập' | 'Thói quen' | 'Kỹ năng';
  progress: number; // 0-100
  isCompleted: boolean;
  updatedAt: string;
}

export interface StudentTask {
  id: string;
  studentId: string;
  classId: ClassId;
  title: string;
  subjectOrArea: string;
  dueDate: string;
  isCompleted: boolean;
  points: number;
}

export interface EffortBadge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  tone: 'teal' | 'amber' | 'sky' | 'emerald';
}

export interface DemoDatabaseState {
  version: number;
  classes: Classroom[];
  teachers: Teacher[];
  students: Student[];
  parents: ParentProfile[];
  observations: Observation[];
  assessments: SelfAssessment[];
  comments: PeriodicComment[];
  announcements: Announcement[];
  feedbacks: ParentFeedback[];
  goals: WeeklyGoal[];
  tasks: StudentTask[];
  badges: EffortBadge[];
  lastUpdatedAt: string;
}
