import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  NeumorphicDisc,
  NeumorphicPillCard,
  getStepColor,
} from '../common/StepInfographicNode';
import {
  Home,
  TrendingUp,
  Lightbulb,
  Presentation,
  Settings,
  UserCheck,
  Calendar,
  FolderKanban,
  BarChart3,
  Bell,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { ResetDataModal } from '../common/ResetDataModal';

export type ActivePage =
  | 'dashboard'
  | 'tasks'
  | 'my-tasks'
  | 'kanban'
  | 'calendar'
  | 'projects'
  | 'team'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { metrics } = useTasks();
  const { unreadCount } = useNotifications();

  // Mode: 'featured' shows 5 main options (1:1 with uploaded image), 'all' shows all 10 modules
  const [filterMode, setFilterMode] = useState<'featured' | 'all'>('all');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // The 5 Core Options matching the uploaded image exactly:
  // 1: Yellow (House/Home) -> Dashboard
  // 2: Orange (Trending/Tasks) -> All Tasks
  // 3: Pink/Magenta (Lightbulb) -> Kanban Board
  // 4: Purple (Presentation/Team) -> Team Workload
  // 5: Cyan (Gears/Settings) -> Settings
  const allNavItems = [
    {
      id: 'dashboard' as ActivePage,
      step: '01',
      title: 'DASHBOARD',
      subtitle: 'RINGKASAN & METRIK',
      description: 'Pantau metrik real-time, KPI efisiensi & kesehatan tim desain.',
      icon: <Home className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: true,
    },
    {
      id: 'tasks' as ActivePage,
      step: '02',
      title: 'ALL TASKS',
      subtitle: 'DAFTAR SELURUH TUGAS',
      description: 'Kelola alur penugasan, deadline darurat & antrean produksi.',
      badge: metrics.total,
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
      icon: <TrendingUp className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: true,
    },
    {
      id: 'kanban' as ActivePage,
      step: '03',
      title: 'KANBAN BOARD',
      subtitle: 'PAPAN ALUR VISUAL',
      description: 'Drag & drop status kartu dari brief hingga persetujuan akhir.',
      icon: <Lightbulb className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: true,
    },
    {
      id: 'team' as ActivePage,
      step: '04',
      title: 'TEAM WORKLOAD',
      subtitle: 'KAPASITAS DESAINER',
      description: 'Distribusi beban kerja kreatif & monitoring kapasitas desainer.',
      icon: <Presentation className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: true,
    },
    {
      id: 'settings' as ActivePage,
      step: '05',
      title: 'SETTINGS',
      subtitle: 'PENGATURAN SISTEM',
      description: 'Konfigurasi master kategori brief, template & pencadangan data.',
      icon: <Settings className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: true,
    },
    // Extended modules maintaining the same 3D pill capsule styling
    {
      id: 'my-tasks' as ActivePage,
      step: '06',
      title: 'MY TASKS',
      subtitle: 'TUGAS PRIORITAS SAYA',
      description: 'Fokus pada tugas aktif yang didelegasikan langsung ke Anda.',
      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: false,
    },
    {
      id: 'calendar' as ActivePage,
      step: '07',
      title: 'DESIGN CALENDAR',
      subtitle: 'JADWAL & DEADLINE',
      description: 'Kalender timeline produksi konten visual & tenggat waktu.',
      icon: <Calendar className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: false,
    },
    {
      id: 'projects' as ActivePage,
      step: '08',
      title: 'PROJECTS',
      subtitle: 'KAMPANYE & BRAND',
      description: 'Katalog kampanye kreatif, brand asset & kode proyek.',
      icon: <FolderKanban className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: false,
    },
    {
      id: 'reports' as ActivePage,
      step: '09',
      title: 'REPORTS & EXPORT',
      subtitle: 'ANALITIK & EKSPOR',
      description: 'Laporan performa, review revisi & unduh rekap data CSV.',
      icon: <BarChart3 className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: false,
    },
    {
      id: 'notifications' as ActivePage,
      step: '10',
      title: 'NOTIFICATIONS',
      subtitle: 'PEMBERITAHUAN AKTIVITAS',
      description: 'Pemberitahuan perubahan status, feedback art director & review.',
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold',
      icon: <Bell className="w-5 h-5 stroke-[2.2]" />,
      isFeatured: false,
    },
  ];

  const visibleNavItems = filterMode === 'featured'
    ? allNavItems.filter((item) => item.isFeatured)
    : allNavItems;

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-80 sm:w-[340px] bg-slate-100/90 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800/90 flex flex-col transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-white dark:bg-slate-900/95 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Refined AT Logo Emblem */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white font-black text-xs shadow-xs">
            AT
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="font-black text-sm tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5 leading-none">
              <span className="font-black text-amber-500">
                AT
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                Task System Control
              </span>
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-900/60 shrink-0 ml-0.5"
                title="System Online"
              />
            </h1>
          </div>
        </div>

        {/* Filter Toggle: 5 Utama vs Semua */}
        <button
          onClick={() => setFilterMode((m) => (m === 'featured' ? 'all' : 'featured'))}
          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-600 text-[10px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors duration-150"
          title="Beralih antara 5 Menu Gambar atau Semua Menu"
        >
          <Filter className="w-3 h-3 text-amber-500" />
          <span>{filterMode === 'featured' ? '5 Menu' : 'Semua (10)'}</span>
        </button>
      </div>

      {/* Quick Executive Status Watchlist */}
      <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-0.5">
          <span className="tracking-wider uppercase">STATUS KONTROL TIM</span>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold">LIVE SYNC</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* Waiting Review (Purple) */}
          <div
            onClick={() => setActivePage('tasks')}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 cursor-pointer transition-all duration-150 shadow-2xs group"
          >
            <span className="block text-xs font-bold text-purple-600 dark:text-purple-400">
              {metrics.waitingReview}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase">Review</span>
          </div>

          {/* Revision (Orange) */}
          <div
            onClick={() => setActivePage('tasks')}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 cursor-pointer transition-all duration-150 shadow-2xs group"
          >
            <span className="block text-xs font-bold text-orange-600 dark:text-orange-400">
              {metrics.revision}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase">Revisi</span>
          </div>

          {/* Overdue (Red) */}
          <div
            onClick={() => setActivePage('tasks')}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 cursor-pointer transition-all duration-150 shadow-2xs group"
          >
            <span className="block text-xs font-bold text-rose-600 dark:text-rose-400">
              {metrics.overdue}
            </span>
            <span className="text-[9px] text-rose-500 font-medium uppercase">Overdue</span>
          </div>
        </div>
      </div>

      {/* 3D NEUMORPHIC DISC + COLORFUL PILL CAPSULES */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
        {visibleNavItems.map((item) => {
          const isActive = activePage === item.id;

          return (
            <NeumorphicPillCard
              key={item.id}
              step={item.step}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              icon={item.icon}
              active={isActive}
              badge={item.badge}
              badgeColor={item.badgeColor}
              onClick={() => {
                setActivePage(item.id);
                if (onMobileClose) onMobileClose();
              }}
            />
          );
        })}
      </nav>

      {/* User Switcher / Profile Footer */}
      <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 px-1">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/80 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">
              {currentUser.role} &bull; {currentUser.specialization || 'Creative'}
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Dropdown */}
        <select
          value={currentUser.id}
          onChange={(e) => switchUser(e.target.value)}
          className="w-full text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer transition-colors"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              Simulasi: {u.name} ({u.role})
            </option>
          ))}
        </select>

        {/* Reset Simulation Data Button */}
        <button
          onClick={() => setIsResetModalOpen(true)}
          title="Reset data simulasi menjadi 0 untuk memulai dari awal"
          className="w-full mt-2 py-1.5 px-2 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-rose-200/60 dark:hover:border-rose-900/40"
        >
          <RotateCcw className="w-3 h-3 text-rose-500" />
          <span>Reset Data Simulasi (0)</span>
        </button>
      </div>

      {/* Reset Data Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </aside>
  );
};
