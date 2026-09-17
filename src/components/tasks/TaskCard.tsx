import React from 'react';
import { Task } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { CountdownTimer } from '../common/CountdownTimer';
import { formatDateOnly, formatTimeOnly } from '../../utils/helpers';
import { MessageSquare, Paperclip, GitPullRequest, Layers, Sparkles } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  draggable = false,
  onDragStart,
  compact = false,
}) => {
  const isDone = task.status === 'COMPLETED' || task.status === 'APPROVED';

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer select-none ${
        compact ? 'space-y-2' : 'space-y-2.5'
      }`}
    >
      {/* Top row: Task ID & Priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-amber-900/50">
            {task.taskCode}
          </span>
          {task.currentVersion && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
              {task.currentVersion}
            </span>
          )}
        </div>
        <PriorityBadge priority={task.priority} size="sm" />
      </div>

      {/* Task Title */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
            {task.projectName}
          </span>
          <span className="text-slate-300 dark:text-slate-600">&bull;</span>
          <span className="truncate max-w-[110px]">{task.categoryName}</span>
        </div>
      </div>

      {/* Status & Revision indicator */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <StatusBadge status={task.status} size="sm" />
        {task.revisionCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-amber-900/50">
            <GitPullRequest className="w-3 h-3" />
            Rev: {task.revisionCount}
          </span>
        )}
      </div>

      {/* Footer: PIC & Deadline with Realtime Countdown */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        {/* PIC */}
        <div className="flex items-center gap-2 min-w-0">
          {task.assignedUserAvatar ? (
            <img
              src={task.assignedUserAvatar}
              alt={task.assignedUserName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[9px] shrink-0">
              {task.assignedUserName.charAt(0)}
            </div>
          )}
          <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
            {task.assignedUserName}
          </span>
        </div>

        {/* Realtime Countdown */}
        <div className="shrink-0 text-right">
          <CountdownTimer deadline={task.deadline} isCompleted={isDone} compact />
        </div>
      </div>
    </div>
  );
};
