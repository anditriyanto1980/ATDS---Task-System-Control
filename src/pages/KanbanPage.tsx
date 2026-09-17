import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { Task, TaskStatus } from '../types';
import { canTransition } from '../utils/helpers';
import {
  Layers,
  Clock,
  Eye,
  RotateCcw,
  CheckCircle2,
  CheckCheck,
  Plus,
} from 'lucide-react';

interface KanbanPageProps {
  onOpenCreateTask: () => void;
}

interface KanbanColumn {
  status: TaskStatus;
  label: string;
  icon: React.ElementType;
  badgeColor: string;
  headerBg: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    status: 'ASSIGNED',
    label: 'Assigned',
    icon: Layers,
    badgeColor: 'bg-slate-100 text-slate-700',
    headerBg: 'border-t-slate-400',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    icon: Clock,
    badgeColor: 'bg-blue-100 text-blue-800',
    headerBg: 'border-t-blue-500',
  },
  {
    status: 'UNDER_REVIEW',
    label: 'Under Review',
    icon: Eye,
    badgeColor: 'bg-violet-100 text-violet-800',
    headerBg: 'border-t-violet-500',
  },
  {
    status: 'REVISION',
    label: 'Revision',
    icon: RotateCcw,
    badgeColor: 'bg-amber-100 text-amber-800',
    headerBg: 'border-t-amber-500',
  },
  {
    status: 'APPROVED',
    label: 'Approved',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-100 text-emerald-800',
    headerBg: 'border-t-emerald-500',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: CheckCheck,
    badgeColor: 'bg-emerald-100 text-emerald-900',
    headerBg: 'border-t-emerald-700',
  },
];

export const KanbanPage: React.FC<KanbanPageProps> = ({ onOpenCreateTask }) => {
  const { tasks, updateStatus, setSelectedTaskId } = useTasks();
  const { isManager, currentUser } = useAuth();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colStatus) {
      setActiveDropColumn(colStatus);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    // Check transition validity
    if (!canTransition(task.status, targetStatus, isManager)) {
      // If manager, permit with confirmation
      if (isManager) {
        const proceed = window.confirm(
          `Workflow bypass: Pindahkan "${task.title}" dari [${task.status}] langsung ke [${targetStatus}]?`
        );
        if (!proceed) return;
      } else {
        alert(
          `Transisi workflow tidak valid dari ${task.status} ke ${targetStatus}. Silakan ikuti tahapan standar lifecycle.`
        );
        return;
      }
    }

    // Perform the status transition
    updateStatus(
      task.id,
      targetStatus,
      `Status dipindahkan melalui Kanban board ke ${targetStatus}.`
    );
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Kanban Board Lifecycle
          </h2>
          <p className="text-xs text-slate-500">
            Tarik dan lepas (drag & drop) kartu untuk memindahkan tahapan status pekerjaan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Buat Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Horizontal Scrolling Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[calc(100vh-210px)] items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => {
            // Include SUBMITTED inside UNDER_REVIEW column for visual clarity
            if (col.status === 'UNDER_REVIEW') {
              return t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED';
            }
            return t.status === col.status;
          });

          const Icon = col.icon;
          const isDropTarget = activeDropColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`w-72 shrink-0 flex flex-col rounded-2xl border transition-all ${
                isDropTarget
                  ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-400 dark:border-orange-500 shadow-md ring-2 ring-orange-400/30'
                  : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-t-4 ${col.headerBg} border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between rounded-t-2xl bg-white/70 dark:bg-slate-900/70`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {col.label}
                  </h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTaskId(task.id)}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium">
                    Tarik task ke sini
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
