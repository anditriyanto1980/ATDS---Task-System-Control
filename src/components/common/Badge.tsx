import React from 'react';
import { TaskStatus, TaskPriority } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/helpers';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-[11px] px-2.5 py-0.5 font-semibold tracking-tight',
    lg: 'text-xs px-3 py-1 font-semibold tracking-tight',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} whitespace-nowrap shadow-2xs transition-colors duration-150`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`}
        />
      )}
      {config.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
}) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

  const sizeClasses = {
    sm: 'text-[9.5px] px-1.5 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-[10.5px] px-2 py-0.5 font-bold uppercase tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses} whitespace-nowrap shadow-2xs transition-colors duration-150`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.indicator}`} />
      {config.label}
    </span>
  );
};
