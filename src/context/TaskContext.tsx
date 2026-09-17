import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Project, Category, TaskStatus, TaskPriority, User } from '../types';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { getDeadlineInfo, canTransition } from '../utils/helpers';

interface TaskFilters {
  search: string;
  status: TaskStatus | 'ALL' | 'WAITING_REVIEW' | 'OVERDUE' | 'DUE_SOON';
  priority: TaskPriority | 'ALL';
  assignedUserId: string | 'ALL';
  userId?: string | 'ALL';
  projectId: string | 'ALL';
  categoryId: string | 'ALL';
}

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  filteredTasks: Task[];
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  resetFilters: () => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTask: Task | null;
  
  // KPI counts
  metrics: {
    total: number;
    inProgress: number;
    waitingReview: number;
    revision: number;
    completed: number;
    overdue: number;
    dueSoon: number;
  };

  // Actions
  refreshData: () => void;
  createTask: (data: Omit<Task, 'id' | 'taskCode' | 'createdDate' | 'submissions' | 'revisions' | 'reassignments' | 'activityLogs' | 'attachments' | 'comments' | 'revisionCount'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>, actionNote?: string) => boolean;
  deleteTask: (taskId: string) => boolean;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  deleteProject: (projectId: string) => boolean;
  createCategory: (category: Omit<Category, 'id'>) => Category;
  deleteCategory: (categoryId: string) => boolean;
  updateStatus: (taskId: string, newStatus: TaskStatus, note?: string) => boolean;
  submitWork: (taskId: string, fileData: { fileName: string; fileType: string; fileUrl: string; notes: string; previewUrl?: string }) => boolean;
  requestRevision: (taskId: string, feedback: string) => boolean;
  approveTask: (taskId: string, approvalNote?: string) => boolean;
  reassignPic: (taskId: string, newPic: User, reason: string) => boolean;
  updateDeadline: (taskId: string, newDeadline: string, reason?: string) => boolean;
  addComment: (taskId: string, content: string) => void;
  resetDatabase: () => void;
  resetToZero: (options?: { clearProjects?: boolean; clearCategories?: boolean }) => void;
}

const defaultFilters: TaskFilters = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
  assignedUserId: 'ALL',
  projectId: 'ALL',
  categoryId: 'ALL',
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isManager } = useAuth();
  const { addToast, reloadNotifications } = useNotifications();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    setTasks(dbService.getTasks());
    setProjects(dbService.getProjects());
    setCategories(dbService.getCategories());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Role scope: if designer or creator and not manager, can see all but let filters guide or default
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesCode = task.taskCode.toLowerCase().includes(q);
        const matchesPic = task.assignedUserName.toLowerCase().includes(q);
        const matchesProject = task.projectName.toLowerCase().includes(q);
        const matchesCategory = task.categoryName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesPic && !matchesProject && !matchesCategory) {
          return false;
        }
      }

      if (filters.status !== 'ALL') {
        if (filters.status === 'WAITING_REVIEW') {
          if (task.status !== 'SUBMITTED' && task.status !== 'UNDER_REVIEW') return false;
        } else if (filters.status === 'OVERDUE') {
          const isCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';
          const { isOverdue } = getDeadlineInfo(task.deadline, isCompleted);
          if (!isOverdue || isCompleted) return false;
        } else if (filters.status === 'DUE_SOON') {
          const isCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';
          const { isDueSoon } = getDeadlineInfo(task.deadline, isCompleted);
          if (!isDueSoon || isCompleted) return false;
        } else {
          if (task.status !== filters.status) return false;
        }
      }

      if (filters.priority !== 'ALL' && task.priority !== filters.priority) {
        return false;
      }

      const effectiveUserFilter = filters.assignedUserId !== 'ALL' ? filters.assignedUserId : (filters.userId && filters.userId !== 'ALL' ? filters.userId : 'ALL');
      if (effectiveUserFilter !== 'ALL' && task.assignedUserId !== effectiveUserFilter) {
        return false;
      }

      if (filters.projectId !== 'ALL' && task.projectId !== filters.projectId) {
        return false;
      }

      if (filters.categoryId !== 'ALL' && task.categoryId !== filters.categoryId) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Executive KPI metrics
  const metrics = useMemo(() => {
    let inProgress = 0;
    let waitingReview = 0;
    let revision = 0;
    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;

    tasks.forEach((t) => {
      const isDone = t.status === 'COMPLETED' || t.status === 'APPROVED';
      const deadlineInfo = getDeadlineInfo(t.deadline, isDone);

      if (t.status === 'IN_PROGRESS') inProgress++;
      if (t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW') waitingReview++;
      if (t.status === 'REVISION') revision++;
      if (isDone) completed++;

      if (!isDone && deadlineInfo.isOverdue) {
        overdue++;
      } else if (!isDone && deadlineInfo.isDueSoon) {
        dueSoon++;
      }
    });

    return {
      total: tasks.length,
      inProgress,
      waitingReview,
      revision,
      completed,
      overdue,
      dueSoon,
    };
  }, [tasks]);

  // Action methods
  const createTask = (
    data: Omit<
      Task,
      'id' | 'taskCode' | 'createdDate' | 'submissions' | 'revisions' | 'reassignments' | 'activityLogs' | 'attachments' | 'comments' | 'revisionCount'
    >
  ) => {
    const newTask = dbService.createTask(data, currentUser);
    refreshData();
    addToast(`Task "${newTask.taskCode}: ${newTask.title}" berhasil dibuat!`, 'success');
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>, actionNote?: string) => {
    const updated = dbService.updateTask(taskId, updates, currentUser, actionNote);
    if (updated) {
      refreshData();
      addToast(`Detail task ${updated.taskCode} berhasil diperbarui!`, 'success');
      return true;
    }
    return false;
  };

  const deleteTask = (taskId: string) => {
    const ok = dbService.deleteTask(taskId, currentUser);
    if (ok) {
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      refreshData();
      addToast('Task berhasil dihapus dari sistem.', 'info');
      return true;
    }
    return false;
  };

  const createProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj = dbService.createProject(project, currentUser);
    refreshData();
    addToast(`Project "${newProj.name}" berhasil ditambahkan!`, 'success');
    return newProj;
  };

  const deleteProject = (projectId: string) => {
    const ok = dbService.deleteProject(projectId);
    if (ok) {
      refreshData();
      addToast('Project berhasil dihapus.', 'info');
      return true;
    }
    return false;
  };

  const createCategory = (category: Omit<Category, 'id'>) => {
    const newCat = dbService.createCategory(category, currentUser);
    refreshData();
    addToast(`Kategori "${newCat.name}" berhasil dibuat!`, 'success');
    return newCat;
  };

  const deleteCategory = (categoryId: string) => {
    const ok = dbService.deleteCategory(categoryId);
    if (ok) {
      refreshData();
      addToast('Kategori berhasil dihapus.', 'info');
      return true;
    }
    return false;
  };

  const updateStatus = (taskId: string, newStatus: TaskStatus, note?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    if (!canTransition(task.status, newStatus, isManager)) {
      addToast(`Transisi status dari ${task.status} ke ${newStatus} tidak diizinkan dalam workflow.`, 'error');
      return false;
    }

    const updated = dbService.updateStatus(taskId, newStatus, currentUser, note);
    if (updated) {
      refreshData();
      addToast(`Status task diperbarui ke ${newStatus}.`, 'success');
      return true;
    }
    return false;
  };

  const submitWork = (
    taskId: string,
    fileData: { fileName: string; fileType: string; fileUrl: string; notes: string; previewUrl?: string }
  ) => {
    const updated = dbService.submitWork(taskId, fileData, currentUser);
    if (updated) {
      refreshData();
      addToast(`Submission berhasil diunggah dan masuk ke Under Review.`, 'success');
      return true;
    }
    return false;
  };

  const requestRevision = (taskId: string, feedback: string) => {
    if (!feedback.trim()) {
      addToast('Catatan revisi wajib diisi!', 'warning');
      return false;
    }
    const updated = dbService.requestRevision(taskId, feedback, currentUser);
    if (updated) {
      refreshData();
      addToast(`Permintaan revisi telah dikirimkan ke Designer.`, 'warning');
      return true;
    }
    return false;
  };

  const approveTask = (taskId: string, approvalNote?: string) => {
    const updated = dbService.approveTask(taskId, currentUser, approvalNote);
    if (updated) {
      refreshData();
      addToast(`Task telah di-approve dan status menjadi COMPLETED! 🎉`, 'success');
      return true;
    }
    return false;
  };

  const reassignPic = (taskId: string, newPic: User, reason: string) => {
    if (!reason.trim()) {
      addToast('Alasan pengalihan tugas wajib diisi!', 'warning');
      return false;
    }
    const updated = dbService.reassignPic(taskId, newPic, currentUser, reason);
    if (updated) {
      refreshData();
      addToast(`Task berhasil dialihkan ke ${newPic.name}.`, 'success');
      return true;
    }
    return false;
  };

  const updateDeadline = (taskId: string, newDeadline: string, reason?: string) => {
    const updated = dbService.updateDeadline(taskId, newDeadline, currentUser, reason);
    if (updated) {
      refreshData();
      addToast(`Deadline berhasil diperbarui.`, 'success');
      return true;
    }
    return false;
  };

  const addComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const updated = dbService.addComment(taskId, content, currentUser);
    if (updated) {
      refreshData();
    }
  };

  const resetToZero = (options?: { clearProjects?: boolean; clearCategories?: boolean }) => {
    dbService.resetToZero(options);
    setSelectedTaskId(null);
    refreshData();
    reloadNotifications();
    addToast('Data simulasi berhasil di-reset menjadi 0. Sistem siap digunakan dari awal!', 'success');
  };

  const resetDatabase = () => {
    dbService.resetToDefault();
    setSelectedTaskId(null);
    refreshData();
    reloadNotifications();
    addToast('Data demo (16 task) berhasil dimuat kembali.', 'info');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        categories,
        filteredTasks,
        filters,
        setFilters,
        resetFilters,
        selectedTaskId,
        setSelectedTaskId,
        selectedTask,
        metrics,
        refreshData,
        createTask,
        updateTask,
        deleteTask,
        createProject,
        deleteProject,
        createCategory,
        deleteCategory,
        updateStatus,
        submitWork,
        requestRevision,
        approveTask,
        reassignPic,
        updateDeadline,
        addComment,
        resetDatabase,
        resetToZero,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
