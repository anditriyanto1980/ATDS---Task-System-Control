import { TaskStatus, DeadlineStatus, TaskPriority } from '../types';

export function getDeadlineInfo(deadlineIso: string, completed: boolean = false) {
  const now = new Date().getTime();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (completed) {
    return {
      status: 'ON_TRACK' as DeadlineStatus,
      label: 'Completed',
      remainingText: 'Selesai',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      isOverdue: false,
      isDueSoon: false,
      diffHours,
    };
  }

  if (diffMs < 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueMins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      status: 'OVERDUE' as DeadlineStatus,
      label: 'OVERDUE',
      remainingText: `Terlambat ${overdueHours > 0 ? `${overdueHours}j ` : ''}${overdueMins}m`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
      isOverdue: true,
      isDueSoon: false,
      diffHours,
    };
  }

  // Under 2 hours remaining = DUE SOON warning!
  if (diffHours < 2) {
    const hours = Math.floor(diffHours);
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      status: 'DUE_SOON' as DeadlineStatus,
      label: 'DUE SOON',
      remainingText: `${hours > 0 ? `${hours}j ` : ''}${mins}m lagi`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      isOverdue: false,
      isDueSoon: true,
      diffHours,
    };
  }

  // On Track (> 2 hours)
  const days = Math.floor(diffHours / 24);
  const hours = Math.floor(diffHours % 24);
  return {
    status: 'ON_TRACK' as DeadlineStatus,
    label: 'ON TRACK',
    remainingText: days > 0 ? `${days}h ${hours}j lagi` : `${hours}j lagi`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    isOverdue: false,
    isDueSoon: false,
    diffHours,
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; dotColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dotColor: 'bg-violet-500',
  },
  REVISION: {
    label: 'Revision',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dotColor: 'bg-green-600',
  },
  ON_HOLD: {
    label: 'On Hold',
    bg: 'bg-zinc-100',
    text: 'text-zinc-700',
    border: 'border-zinc-200',
    dotColor: 'bg-zinc-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string; indicator: string }
> = {
  LOW: {
    label: 'Low',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    indicator: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    indicator: 'bg-sky-500',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    indicator: 'bg-orange-500',
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    indicator: 'bg-red-600',
  },
};

// Strict Workflow Transitions check
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  DRAFT: ['ASSIGNED', 'ON_HOLD', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'ON_HOLD', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'REVISION'],
  UNDER_REVIEW: ['REVISION', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD'],
  REVISION: ['IN_PROGRESS', 'SUBMITTED', 'ON_HOLD', 'CANCELLED'],
  APPROVED: ['COMPLETED'],
  COMPLETED: ['REVISION'], // Re-open if necessary
  ON_HOLD: ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'CANCELLED'],
  CANCELLED: ['DRAFT', 'ASSIGNED'],
};

export function canTransition(from: TaskStatus, to: TaskStatus, isManager: boolean = false): boolean {
  if (from === to) return true;
  if (isManager) {
    // Managers have full control over workflow transitions
    return true;
  }
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}
