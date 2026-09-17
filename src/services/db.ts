import {
  Task,
  User,
  Project,
  Category,
  Notification,
  TaskStatus,
  ActivityLog,
  TaskSubmission,
  TaskRevision,
  TaskReassignment,
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_CATEGORIES,
  INITIAL_NOTIFICATIONS,
} from './seedData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_TASKS = 'at_tasks_v2';
const STORAGE_KEY_USERS = 'at_users_v2';
const STORAGE_KEY_PROJECTS = 'at_projects_v2';
const STORAGE_KEY_CATEGORIES = 'at_categories_v2';
const STORAGE_KEY_NOTIFS = 'at_notifications_v2';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEY_TASKS)) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEY_PROJECTS)) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEY_NOTIFS)) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }

  public resetToDefault() {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  public resetToZero(options?: { clearProjects?: boolean; clearCategories?: boolean }) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify([]));
    if (options?.clearProjects) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify([]));
    }
    if (options?.clearCategories) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]));
    }
  }

  // --- GETTERS ---
  public getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  }

  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
      return data ? JSON.parse(data) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  public getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public getNotifications(): Notification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  // --- SAVE HELPERS ---
  private saveTasks(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }

  private saveNotifications(notifs: Notification[]) {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  }

  public saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }

  public saveCategories(categories: Category[]) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }

  // --- TASK ACTIONS ---
  public createTask(taskData: Omit<Task, 'id' | 'taskCode' | 'createdDate' | 'submissions' | 'revisions' | 'reassignments' | 'activityLogs' | 'attachments' | 'comments' | 'revisionCount'>, actor: User): Task {
    const tasks = this.getTasks();
    let nextCodeNumber = 1;
    if (tasks.length > 0) {
      const existingCodes = tasks
        .map((t) => parseInt(t.taskCode.replace(/[^\d]/g, ''), 10))
        .filter((n) => !isNaN(n));
      if (existingCodes.length > 0) {
        nextCodeNumber = Math.max(...existingCodes) + 1;
      } else {
        nextCodeNumber = tasks.length + 1;
      }
    }
    const taskCode = `AT-${String(nextCodeNumber).padStart(6, '0')}`;
    const taskId = `task-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const initialLog: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Task Created',
      details: `Created task "${taskData.title}" and assigned to ${taskData.assignedUserName}`,
      timestamp: nowIso,
    };

    const newTask: Task = {
      ...taskData,
      id: taskId,
      taskCode,
      createdDate: nowIso,
      revisionCount: 0,
      currentVersion: 'V1',
      submissions: [],
      revisions: [],
      reassignments: [],
      activityLogs: [initialLog],
      attachments: [],
      comments: [],
    };

    const updatedTasks = [newTask, ...tasks];
    this.saveTasks(updatedTasks);

    // Create notification for assigned user
    this.createNotification({
      userId: taskData.assignedUserId,
      title: 'Tugas Baru Diberikan',
      message: `${actor.name} menugaskan "${taskData.title}" (${taskCode}) kepada Anda.`,
      taskId,
      type: 'ASSIGNMENT',
    });

    return newTask;
  }

  public updateTask(taskId: string, updates: Partial<Task>, actor: User, actionNote?: string): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const updatedTask = { ...oldTask, ...updates };

    if (actionNote) {
      const log: ActivityLog = {
        id: `log-${Date.now()}`,
        taskId,
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: actionNote,
        timestamp: new Date().toISOString(),
      };
      updatedTask.activityLogs = [log, ...updatedTask.activityLogs];
    }

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  public updateStatus(taskId: string, newStatus: TaskStatus, actor: User, note?: string): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const oldStatus = oldTask.status;
    const nowIso = new Date().toISOString();

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Status Changed',
      oldValue: oldStatus,
      newValue: newStatus,
      details: note,
      timestamp: nowIso,
    };

    const updates: Partial<Task> = {
      status: newStatus,
    };

    if (newStatus === 'IN_PROGRESS' && !oldTask.startDate) {
      updates.startDate = nowIso;
    }
    if (newStatus === 'COMPLETED' || newStatus === 'APPROVED') {
      updates.completedAt = nowIso;
    }

    const updatedTask: Task = {
      ...oldTask,
      ...updates,
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify Manager or Designer
    if (actor.role === 'DESIGNER' || actor.role === 'CONTENT_CREATOR') {
      this.createNotification({
        userId: 'user-manager',
        title: `Status Update: ${newStatus}`,
        message: `${actor.name} memperbarui status "${oldTask.title}" menjadi ${newStatus}.`,
        taskId,
        type: 'INFO',
      });
    }

    return updatedTask;
  }

  public reassignPic(
    taskId: string,
    newPic: User,
    actor: User,
    reason: string
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const prevPicName = oldTask.assignedUserName;
    const prevPicId = oldTask.assignedUserId;
    const nowIso = new Date().toISOString();

    const reassignmentRecord: TaskReassignment = {
      id: `reassign-${Date.now()}`,
      taskId,
      previousPicId: prevPicId,
      previousPicName: prevPicName,
      newPicId: newPic.id,
      newPicName: newPic.name,
      changedById: actor.id,
      changedByName: actor.name,
      changedAt: nowIso,
      reason,
    };

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Changed PIC (Reassigned)',
      oldValue: prevPicName,
      newValue: newPic.name,
      details: `Alasan: ${reason}`,
      timestamp: nowIso,
    };

    const updatedTask: Task = {
      ...oldTask,
      assignedUserId: newPic.id,
      assignedUserName: newPic.name,
      assignedUserAvatar: newPic.avatar,
      reassignments: [reassignmentRecord, ...oldTask.reassignments],
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify previous PIC and new PIC
    this.createNotification({
      userId: newPic.id,
      title: 'Tugas Dialihkan kepada Anda',
      message: `${actor.name} mengalihkan task "${oldTask.title}" kepada Anda dari ${prevPicName}. Alasan: ${reason}`,
      taskId,
      type: 'ASSIGNMENT',
    });

    return updatedTask;
  }

  public updateDeadline(
    taskId: string,
    newDeadline: string,
    actor: User,
    reason?: string
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const oldDeadline = oldTask.deadline;
    const nowIso = new Date().toISOString();

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Changed Deadline',
      oldValue: oldDeadline,
      newValue: newDeadline,
      details: reason ? `Alasan: ${reason}` : undefined,
      timestamp: nowIso,
    };

    const updatedTask: Task = {
      ...oldTask,
      deadline: newDeadline,
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    this.createNotification({
      userId: oldTask.assignedUserId,
      title: 'Perubahan Deadline',
      message: `Deadline untuk task "${oldTask.title}" diubah oleh ${actor.name}.`,
      taskId,
      type: 'DEADLINE_WARNING',
    });

    return updatedTask;
  }

  public submitWork(
    taskId: string,
    fileData: { fileName: string; fileType: string; fileUrl: string; notes: string; previewUrl?: string },
    actor: User
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const currentVersionNumber = (oldTask.submissions?.length || 0) + 1;
    const versionLabel = `V${currentVersionNumber}`;
    const nowIso = new Date().toISOString();

    const newSubmission: TaskSubmission = {
      id: `sub-${Date.now()}`,
      taskId,
      version: versionLabel,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileUrl: fileData.fileUrl,
      previewUrl: fileData.previewUrl || fileData.fileUrl,
      notes: fileData.notes,
      uploaderId: actor.id,
      uploaderName: actor.name,
      uploadedAt: nowIso,
      status: 'PENDING_REVIEW',
    };

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: `Submitted ${versionLabel}`,
      details: `File: ${fileData.fileName} | Catatan: ${fileData.notes}`,
      timestamp: nowIso,
    };

    const updatedTask: Task = {
      ...oldTask,
      status: 'UNDER_REVIEW', // Automatically moves to UNDER_REVIEW
      currentVersion: versionLabel,
      submissions: [newSubmission, ...oldTask.submissions],
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify Manager
    this.createNotification({
      userId: 'user-manager',
      title: `Submission Baru: ${versionLabel}`,
      message: `${actor.name} telah men-submit ${versionLabel} untuk "${oldTask.title}" dan menunggu review.`,
      taskId,
      type: 'SUBMISSION',
    });

    return updatedTask;
  }

  public requestRevision(
    taskId: string,
    feedback: string,
    actor: User
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const nextRevisionNum = oldTask.revisionCount + 1;
    const nowIso = new Date().toISOString();

    const revision: TaskRevision = {
      id: `rev-${Date.now()}`,
      taskId,
      revisionNumber: nextRevisionNum,
      requestedById: actor.id,
      requestedByName: actor.name,
      requestedAt: nowIso,
      feedback,
      submissionVersion: oldTask.currentVersion || 'V1',
    };

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Revision Requested',
      oldValue: oldTask.status,
      newValue: 'REVISION',
      details: feedback,
      timestamp: nowIso,
    };

    // Mark current submission as REVISION_REQUESTED
    const updatedSubmissions = oldTask.submissions.map((sub, i) =>
      i === 0 ? { ...sub, status: 'REVISION_REQUESTED' as const } : sub
    );

    const updatedTask: Task = {
      ...oldTask,
      status: 'REVISION',
      revisionCount: nextRevisionNum,
      revisions: [revision, ...oldTask.revisions],
      submissions: updatedSubmissions,
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify PIC
    this.createNotification({
      userId: oldTask.assignedUserId,
      title: 'Permintaan Revisi Desain',
      message: `${actor.name} meminta revisi untuk "${oldTask.title}": "${feedback}"`,
      taskId,
      type: 'REVISION',
    });

    return updatedTask;
  }

  public approveTask(
    taskId: string,
    actor: User,
    approvalNote?: string
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const nowIso = new Date().toISOString();

    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Approved & Completed',
      oldValue: oldTask.status,
      newValue: 'COMPLETED',
      details: approvalNote || 'Desain telah disetujui sesuai brief.',
      timestamp: nowIso,
    };

    // Mark current submission as APPROVED
    const updatedSubmissions = oldTask.submissions.map((sub, i) =>
      i === 0 ? { ...sub, status: 'APPROVED' as const } : sub
    );

    const updatedTask: Task = {
      ...oldTask,
      status: 'COMPLETED',
      approvedBy: actor.name,
      approvedAt: nowIso,
      completedAt: nowIso,
      submissions: updatedSubmissions,
      activityLogs: [log, ...oldTask.activityLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify PIC
    this.createNotification({
      userId: oldTask.assignedUserId,
      title: 'Tugas Disetujui (Approved)! 🎉',
      message: `Hebat! Desain "${oldTask.title}" telah disetujui dan diselesaikan oleh ${actor.name}.`,
      taskId,
      type: 'APPROVAL',
    });

    return updatedTask;
  }

  public addComment(
    taskId: string,
    content: string,
    actor: User
  ): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const oldTask = tasks[index];
    const newComment = {
      id: `com-${Date.now()}`,
      taskId,
      userId: actor.id,
      userName: actor.name,
      userAvatar: actor.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedTask: Task = {
      ...oldTask,
      comments: [...oldTask.comments, newComment],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  public createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const notifs = this.getNotifications();
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.saveNotifications([newNotif, ...notifs]);
  }

  public markNotificationAsRead(notifId: string) {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  }

  public markAllNotificationsAsRead(userId: string) {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  }

  public deleteTask(taskId: string, actor: User): boolean {
    const tasks = this.getTasks();
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return false;
    const remaining = tasks.filter((t) => t.id !== taskId);
    this.saveTasks(remaining);
    this.createNotification({
      userId: 'user-manager',
      title: 'Task Dihapus',
      message: `${actor.name} menghapus task ${taskToDelete.taskCode}: "${taskToDelete.title}".`,
      type: 'INFO',
    });
    return true;
  }

  public createProject(project: Omit<Project, 'id' | 'createdAt'>, actor: User): Project {
    const projects = this.getProjects();
    const newProj: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      code: project.code || `PRJ-${project.name.slice(0, 4).toUpperCase()}`,
      status: project.status || 'ACTIVE',
    };
    this.saveProjects([newProj, ...projects]);
    return newProj;
  }

  public deleteProject(projectId: string): boolean {
    const projects = this.getProjects();
    const updated = projects.filter((p) => p.id !== projectId);
    this.saveProjects(updated);
    return true;
  }

  public createCategory(category: Omit<Category, 'id'>, actor: User): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    this.saveCategories([...categories, newCat]);
    return newCat;
  }

  public deleteCategory(categoryId: string): boolean {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== categoryId);
    this.saveCategories(updated);
    return true;
  }

  public createUser(userData: Omit<User, 'id'>, actor: User): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, newUser]));
    return newUser;
  }

  public deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const updated = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    return true;
  }
}

export const dbService = DatabaseService.getInstance();
