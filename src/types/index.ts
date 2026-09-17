export type UserRole = 'ADMIN' | 'MANAGER' | 'DESIGNER' | 'CONTENT_CREATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  specialization?: string;
  activeTasksCount?: number;
}

export type TaskStatus =
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION'
  | 'APPROVED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DeadlineStatus = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  code?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  taskCount?: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'DESIGN' | 'CONTENT' | 'BOTH';
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  version: string; // V1, V2, V3...
  fileName: string;
  fileType: string;
  fileUrl: string;
  previewUrl?: string;
  notes: string;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
  status: 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED';
}

export interface TaskRevision {
  id: string;
  taskId: string;
  revisionNumber: number;
  requestedById: string;
  requestedByName: string;
  requestedAt: string;
  feedback: string;
  submissionVersion: string;
  resolvedAt?: string;
}

export interface TaskReassignment {
  id: string;
  taskId: string;
  previousPicId: string;
  previousPicName: string;
  newPicId: string;
  newPicName: string;
  changedById: string;
  changedByName: string;
  changedAt: string;
  reason: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  type: 'ASSIGNMENT' | 'SUBMISSION' | 'REVISION' | 'APPROVAL' | 'DEADLINE_WARNING' | 'OVERDUE' | 'INFO';
  read: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  taskCode: string; // e.g. AT-000124
  title: string;
  projectId: string;
  projectName: string;
  categoryId: string;
  categoryName: string;
  taskType: string; // Graphic Design, Video, Motion, Feed, Story, Packaging, Banner, etc.
  requester: string;
  assignedUserId: string;
  assignedUserName: string;
  assignedUserAvatar?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdDate: string;
  startDate?: string;
  deadline: string; // ISO String
  estimatedWorkTime?: string;
  
  // Design Brief & Clues
  designBrief: string;
  objective?: string;
  targetAudience?: string;
  designConcept?: string;
  designClue?: string;
  reference?: string;
  requiredText?: string;
  cta?: string;
  platform?: string; // Shopee, Instagram, TikTok, Marketplace, Print, Website
  dimension?: string; // 1080x1080px, 1080x1920px, etc.
  notes?: string;

  // Lifecycle Metadata
  currentVersion?: string; // V1, V2...
  revisionCount: number;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;

  // Relational items
  submissions: TaskSubmission[];
  revisions: TaskRevision[];
  reassignments: TaskReassignment[];
  activityLogs: ActivityLog[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}
