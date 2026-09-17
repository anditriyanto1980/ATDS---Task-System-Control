import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { formatDateOnly, formatTimeOnly, getDeadlineInfo } from '../utils/helpers';
import { Task, TaskPriority, TaskStatus } from '../types';
import {
  LayoutGrid,
  List,
  Filter,
  Search,
  X,
  Plus,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Edit3,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface TasksPageProps {
  onOpenCreateTask: () => void;
  onEditTask?: (task: Task) => void;
  myTasksOnly?: boolean;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onOpenCreateTask,
  onEditTask,
  myTasksOnly = false,
}) => {
  const { tasks, projects, categories, filters, setFilters, setSelectedTaskId, metrics } = useTasks();
  const { allUsers, currentUser, isManager } = useAuth();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [quickFilter, setQuickFilter] = useState<'all' | 'review' | 'revision' | 'overdue' | 'duesoon'>('all');

  // Filter tasks based on global filters + myTasksOnly + quick filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. My tasks filter
      if (myTasksOnly && t.assignedUserId !== currentUser.id) {
        return false;
      }

      // 2. Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchCode = t.taskCode.toLowerCase().includes(query);
        const matchPic = t.assignedUserName.toLowerCase().includes(query);
        const matchBrief = (t.designBrief || '').toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchPic && !matchBrief) return false;
      }

      // 3. User / PIC filter
      if (filters.userId && t.assignedUserId !== filters.userId) {
        return false;
      }

      // 4. Project filter
      if (filters.projectId && t.projectId !== filters.projectId) {
        return false;
      }

      // 5. Category filter
      if (filters.categoryId && t.categoryId !== filters.categoryId) {
        return false;
      }

      // 6. Priority filter
      if (filters.priority && t.priority !== filters.priority) {
        return false;
      }

      // 7. Status filter
      if (filters.status) {
        if (filters.status === 'OVERDUE') {
          const isDone = t.status === 'COMPLETED' || t.status === 'APPROVED';
          const { isOverdue } = getDeadlineInfo(t.deadline, isDone);
          if (!isOverdue) return false;
        } else if (filters.status === 'WAITING_REVIEW') {
          if (t.status !== 'UNDER_REVIEW' && t.status !== 'SUBMITTED') return false;
        } else if (t.status !== filters.status) {
          return false;
        }
      }

      // 8. Quick Filter Pill
      const isDone = t.status === 'COMPLETED' || t.status === 'APPROVED';
      const deadlineInfo = getDeadlineInfo(t.deadline, isDone);

      if (quickFilter === 'review') {
        if (t.status !== 'UNDER_REVIEW' && t.status !== 'SUBMITTED') return false;
      } else if (quickFilter === 'revision') {
        if (t.status !== 'REVISION') return false;
      } else if (quickFilter === 'overdue') {
        if (!deadlineInfo.isOverdue) return false;
      } else if (quickFilter === 'duesoon') {
        if (!deadlineInfo.isDueSoon) return false;
      }

      return true;
    });
  }, [tasks, filters, myTasksOnly, currentUser.id, quickFilter]);

  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      userId: undefined,
      projectId: undefined,
      categoryId: undefined,
      search: '',
    });
    setQuickFilter('all');
  };

  const hasActiveFilters =
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    Boolean(filters.userId) ||
    Boolean(filters.projectId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.search) ||
    quickFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {myTasksOnly ? 'Daftar Tugas Saya' : 'Seluruh Pekerjaan Desain & Konten'}
          </h2>
          <p className="text-xs text-slate-500">
            Menampilkan {filteredTasks.length} dari {tasks.length} task
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid / Table switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          {/* New Task button */}
          {isManager && (
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Task
            </button>
          )}
        </div>
      </div>

      {/* QUICK CHIP PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setQuickFilter('all');
            setFilters((f) => ({ ...f, status: undefined }));
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all whitespace-nowrap ${
            quickFilter === 'all' && !filters.status
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-orange-600 dark:border-orange-600'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          Semua ({tasks.length})
        </button>

        <button
          onClick={() => {
            setQuickFilter('review');
            setFilters((f) => ({ ...f, status: undefined }));
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
            quickFilter === 'review'
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-violet-50/60 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900 hover:bg-violet-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Perlu Review ({metrics.waitingReview})
        </button>

        <button
          onClick={() => {
            setQuickFilter('revision');
            setFilters((f) => ({ ...f, status: undefined }));
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
            quickFilter === 'revision'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Sedang Revisi ({metrics.revision})
        </button>

        <button
          onClick={() => {
            setQuickFilter('overdue');
            setFilters((f) => ({ ...f, status: undefined }));
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
            quickFilter === 'overdue'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue ({metrics.overdue})
        </button>

        <button
          onClick={() => {
            setQuickFilter('duesoon');
            setFilters((f) => ({ ...f, status: undefined }));
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
            quickFilter === 'duesoon'
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900 hover:bg-orange-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Due Soon &lt;2 Jam ({metrics.dueSoon})
        </button>
      </div>

      {/* MULTI-FACET FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* PIC Filter */}
          {!myTasksOnly && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                PIC / Designer
              </label>
              <select
                value={filters.userId || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, userId: e.target.value || undefined }))
                }
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Semua PIC</option>
                {allUsers
                  .filter((u) => u.role !== 'MANAGER')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Project Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Project
            </label>
            <select
              value={filters.projectId || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, projectId: e.target.value || undefined }))
              }
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Semua Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Kategori
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))
              }
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  priority: (e.target.value as TaskPriority) || undefined,
                }))
              }
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Semua Priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Status Lifecycle
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: (e.target.value as TaskStatus) || undefined,
                }))
              }
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Semua Status</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="REVISION">REVISION</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Filter aktif diterapkan</span>
            <button
              onClick={handleResetFilters}
              className="text-orange-600 hover:underline font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* TASK LIST OR GRID */}
      {filteredTasks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Task ID</th>
                    <th className="py-3 px-4">Judul Task</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">PIC</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Deadline & Countdown</th>
                    <th className="py-3 px-4">Versi / Rev</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTasks.map((task) => {
                    const isDone = task.status === 'COMPLETED' || task.status === 'APPROVED';
                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="hover:bg-orange-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                          {task.taskCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {task.projectName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {task.assignedUserAvatar ? (
                              <img
                                src={task.assignedUserAvatar}
                                alt={task.assignedUserName}
                                className="w-5 h-5 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {task.assignedUserName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} size="sm" />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={task.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <CountdownTimer deadline={task.deadline} isCompleted={isDone} compact />
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {formatDateOnly(task.deadline)} {formatTimeOnly(task.deadline)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {task.currentVersion || 'V0'}
                            </span>
                            {task.revisionCount > 0 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                                R{task.revisionCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isManager && onEditTask && (
                              <button
                                onClick={() => onEditTask(task)}
                                className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Task"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Tidak ada task yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah kombinasi filter status dan prioritas.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};
