import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { formatTimeOnly, formatDateOnly } from '../utils/helpers';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { tasks, setSelectedTaskId } = useTasks();

  // Selected view month/year (defaulting to September 2026 based on seed dates)
  const [currentDate, setCurrentDate] = useState(() => {
    // Check if there are tasks with deadlines in 2026
    const sample = tasks[0]?.deadline;
    if (sample) {
      return new Date(sample);
    }
    return new Date();
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const sample = tasks[0]?.deadline;
    if (sample) return new Date(sample).getDate();
    return new Date().getDate();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  // Group tasks by day of current month
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
      tasksByDay[dayNum].push(t);
    }
  });

  // Selected day's tasks
  const activeDayTasks = selectedDay ? tasksByDay[selectedDay] || [] : [];

  return (
    <div className="space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-600" />
            Kalender Jadwal & Deadline Desain
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring deadline distribusi pekerjaan dalam tampilan kalender bulanan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-slate-100 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Day Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Monthly Table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty offset padding */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] p-1.5 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl opacity-40" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = tasksByDay[day] || [];
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  {/* Top Day Number & Task Count Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills on Date */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => {
                      let bg = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (t.status === 'COMPLETED' || t.status === 'APPROVED') {
                        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      } else if (t.status === 'REVISION') {
                        bg = 'bg-amber-50 text-amber-700 border-amber-200';
                      } else if (t.status === 'UNDER_REVIEW') {
                        bg = 'bg-violet-50 text-violet-700 border-violet-200';
                      }

                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskId(t.id);
                          }}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${bg}`}
                          title={`${t.taskCode} - ${t.title}`}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 pl-1 block">
                        +{dayTasks.length - 2} task lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Detail Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              AGENDA DEADLINE
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {selectedDay} {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">
              {activeDayTasks.length} task memiliki batas waktu di tanggal ini
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {activeDayTasks.length > 0 ? (
              activeDayTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-orange-600">
                      {t.taskCode}
                    </span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {t.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    <span>PIC: {t.assignedUserName}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatTimeOnly(t.deadline)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Tidak ada deadline task pada tanggal ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
