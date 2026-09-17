import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDeadlineInfo } from '../../utils/helpers';

interface CountdownTimerProps {
  deadline: string;
  isCompleted?: boolean;
  detailed?: boolean;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadline,
  isCompleted = false,
  detailed = false,
  compact = false,
}) => {
  const [timeState, setTimeState] = useState(() => getDeadlineInfo(deadline, isCompleted));

  useEffect(() => {
    const update = () => {
      setTimeState(getDeadlineInfo(deadline, isCompleted));
    };

    update();
    const interval = setInterval(update, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [deadline, isCompleted]);

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Selesai</span>
      </span>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {timeState.isOverdue ? (
          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {timeState.remainingText}
          </span>
        ) : timeState.isDueSoon ? (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            {timeState.remainingText}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {timeState.remainingText}
          </span>
        )}
      </div>
    );
  }

  if (detailed) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${timeState.badgeClass}`}
      >
        {timeState.isOverdue ? (
          <>
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-rose-500">
                OVERDUE
              </span>
              <span>{timeState.remainingText}</span>
            </div>
          </>
        ) : timeState.isDueSoon ? (
          <>
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 animate-bounce" />
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-600">
                WARNING &bull; DUE SOON
              </span>
              <span>{timeState.remainingText}</span>
            </div>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                ON TRACK
              </span>
              <span>{timeState.remainingText}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${timeState.badgeClass}`}
    >
      {timeState.isOverdue ? (
        <AlertCircle className="w-3 h-3 text-rose-600" />
      ) : timeState.isDueSoon ? (
        <AlertTriangle className="w-3 h-3 text-amber-600" />
      ) : (
        <Clock className="w-3 h-3 text-emerald-600" />
      )}
      <span>{timeState.remainingText}</span>
    </span>
  );
};
