import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useNotifications } from '../../context/NotificationContext';
import { ActivePage } from './Sidebar';
import { getStepColor, NeumorphicDisc } from '../common/StepInfographicNode';
import {
  Search,
  Plus,
  Bell,
  Menu,
  Check,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
  Home,
  TrendingUp,
  Lightbulb,
  Presentation,
  Settings,
  UserCheck,
  Calendar,
  FolderKanban,
  BarChart3,
} from 'lucide-react';

import { ResetDataModal } from '../common/ResetDataModal';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenMobileMenu: () => void;
  activePage?: ActivePage;
}

const PAGE_CONFIG_MAP: Record<
  ActivePage,
  { step: string; label: string; icon: React.ReactNode }
> = {
  dashboard: {
    step: '01',
    label: 'DASHBOARD',
    icon: <Home className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  tasks: {
    step: '02',
    label: 'ALL TASKS',
    icon: <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  kanban: {
    step: '03',
    label: 'KANBAN BOARD',
    icon: <Lightbulb className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  team: {
    step: '04',
    label: 'TEAM WORKLOAD',
    icon: <Presentation className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  settings: {
    step: '05',
    label: 'SETTINGS',
    icon: <Settings className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  'my-tasks': {
    step: '06',
    label: 'MY TASKS',
    icon: <UserCheck className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  calendar: {
    step: '07',
    label: 'DESIGN CALENDAR',
    icon: <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  projects: {
    step: '08',
    label: 'PROJECTS',
    icon: <FolderKanban className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  reports: {
    step: '09',
    label: 'REPORTS & EXPORT',
    icon: <BarChart3 className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
  notifications: {
    step: '10',
    label: 'NOTIFICATIONS',
    icon: <Bell className="w-3.5 h-3.5 stroke-[2.2]" />,
  },
};

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateTask,
  onOpenMobileMenu,
  activePage = 'dashboard',
}) => {
  const { currentUser, allUsers, switchUser, isManager } = useAuth();
  const { filters, setFilters, setSelectedTaskId } = useTasks();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentConfig = PAGE_CONFIG_MAP[activePage] || PAGE_CONFIG_MAP.dashboard;
  const currentStepColor = getStepColor(currentConfig.step);

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Mobile Hamburger & Title */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-slate-900 dark:text-white">
          <span className="text-amber-500 font-black">AT</span>
          <span className="text-slate-300 font-bold">-</span>
          <span>Task System Control</span>
        </div>
      </div>

      {/* Active Page Indicator */}
      <div className="hidden lg:flex items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-800/80 shadow-2xs">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
            style={{
              background: `linear-gradient(135deg, ${currentStepColor.gradientFrom}, ${currentStepColor.gradientTo})`,
            }}
          >
            {currentConfig.step}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {currentConfig.label}
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            {currentStepColor.tag.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Global Live Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari task ID (AT-...), brief, kampanye, atau desainer..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full text-xs bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 md:gap-3 ml-auto">
        {/* Role switch pill for quick demonstration */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Peran:</span>
          <select
            value={currentUser.id}
            onChange={(e) => switchUser(e.target.value)}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors duration-150"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifikasi ({notifications.length})
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-amber-600 hover:underline font-semibold"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.taskId) {
                          setSelectedTaskId(n.taskId);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 text-slate-500'
                          : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-slate-400 text-xs">
                    Tidak ada notifikasi baru.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Simulation Data to 0 Button */}
        <button
          onClick={() => setIsResetModalOpen(true)}
          title="Reset Data Simulasi menjadi 0 (Mulai Dari Awal)"
          className="h-9 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-bold transition-all duration-150 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Reset ke 0</span>
        </button>

        {/* Enterprise "Buat Task Baru" Button */}
        {isManager && (
          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xs hover:shadow-sm flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Buat Task Baru</span>
            <span className="sm:hidden">Task</span>
          </button>
        )}
      </div>

      {/* Reset Simulation Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </header>
  );
};
