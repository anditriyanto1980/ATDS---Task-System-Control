import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { getDeadlineInfo, formatDateTime } from '../utils/helpers';
import { ResetDataModal } from '../components/common/ResetDataModal';
import {
  StepCircleNode,
  NeumorphicDisc,
  NeumorphicPillCard,
  getStepColor,
} from '../components/common/StepInfographicNode';
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Eye,
  CheckSquare,
  Users,
  Flame,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight,
  Home,
  Lightbulb,
  Presentation,
  Settings,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToTasks: (statusFilter?: string) => void;
  onNavigateToTeam: () => void;
  onOpenCreateTask?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToTasks,
  onNavigateToTeam,
  onOpenCreateTask,
}) => {
  const { tasks, metrics, setSelectedTaskId, resetDatabase } = useTasks();
  const { allUsers, isManager, currentUser } = useAuth();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Urgent attention tasks: Overdue and Due Soon
  const urgentTasks = tasks.filter((t) => {
    const isDone = t.status === 'COMPLETED' || t.status === 'APPROVED';
    if (isDone) return false;
    const { isOverdue, isDueSoon } = getDeadlineInfo(t.deadline, false);
    return isOverdue || isDueSoon;
  });

  // Waiting review tasks
  const reviewTasks = tasks.filter(
    (t) => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED'
  );

  // Active revision tasks
  const revisionTasks = tasks.filter((t) => t.status === 'REVISION');

  // Workload per designer
  const designers = allUsers.filter((u) => u.role !== 'MANAGER');
  const workloadData = designers.map((d) => {
    const designerTasks = tasks.filter((t) => t.assignedUserId === d.id);
    const activeTasks = designerTasks.filter(
      (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
    );
    const completedTasks = designerTasks.filter((t) => t.status === 'COMPLETED');
    const revisionCount = designerTasks.reduce((acc, t) => acc + t.revisionCount, 0);

    return {
      user: d,
      total: designerTasks.length,
      active: activeTasks.length,
      completed: completedTasks.length,
      revisions: revisionCount,
    };
  });

  // Recent activity logs aggregated from all tasks
  const allLogs = tasks
    .flatMap((t) =>
      (t.activityLogs || []).map((l) => ({
        ...l,
        taskTitle: t.title,
        taskCode: t.taskCode,
        parentTaskId: t.id,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  // Recent submissions
  const allSubmissions = tasks
    .flatMap((t) =>
      (t.submissions || []).map((s) => ({
        ...s,
        taskTitle: t.title,
        taskCode: t.taskCode,
        parentTaskId: t.id,
      }))
    )
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* EXECUTIVE HEADER & 5-SECOND STATUS SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-950 text-white p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
              EXECUTIVE MONITORING CONSOLE
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            AT - Task System Control
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Ringkasan status seluruh pekerjaan tim desain & content creator dalam satu pandangan. Pantau deadline mendesak, antrean review, dan beban kerja per anggota.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Quick Action: Reset Data Simulasi ke 0 */}
          {metrics.total > 0 ? (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              title="Reset Data Simulasi menjadi 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset ke 0</span>
            </button>
          ) : (
            <button
              onClick={resetDatabase}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              title="Muat Kembali 16 Task Data Demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Muat Data Demo</span>
            </button>
          )}

          {/* 5-10 second Quick Status Indicator */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Kesehatan Tim
              </span>
              <span className="text-xs font-bold text-white">
                {metrics.overdue > 0
                  ? `${metrics.overdue} Task Overdue!`
                  : metrics.dueSoon > 0
                  ? `${metrics.dueSoon} Task Due Soon`
                  : '100% On Track'}
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                metrics.overdue > 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : metrics.dueSoon > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {metrics.overdue > 0 ? (
                <AlertCircle className="w-4 h-4" />
              ) : metrics.dueSoon > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ZERO-STATE BANNER: WHEN SIMULATION IS RESET TO 0 */}
      {metrics.total === 0 && (
        <div className="p-5 rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Sistem Siap Digunakan dari Nol (0 Task)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  DATABASE BERSIH
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Semua data simulasi telah di-reset menjadi 0. Anda dapat mulai menginput brief dan tugas nyata tim desain atau muat data demo untuk latihan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenCreateTask && (
              <button
                onClick={onOpenCreateTask}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                + Buat Task Pertama
              </button>
            )}
            <button
              onClick={resetDatabase}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-xs font-semibold shadow-2xs transition-colors"
            >
              Muat 16 Task Demo
            </button>
          </div>
        </div>
      )}

      {/* 5-STEP DESIGN WORKFLOW ROADMAP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                TASK PIPELINE WORKFLOW
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Alur 5 Langkah Proses Desain Kreatif
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Klik tahap mana pun untuk memfilter tugas terkait secara instan
          </p>
        </div>

        {/* 5 Stepped Cards matching image.png (Yellow, Orange, Pink, Purple, Cyan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {/* STEP 01: FIRST OPTION (Yellow) */}
          <NeumorphicPillCard
            step="01"
            title="FIRST OPTION"
            subtitle="BRIEF & REQUEST"
            description="Task baru masuk, brief lengkap & penugasan desainer."
            icon={<Home className="w-5 h-5 stroke-[2.2]" />}
            badge={`${tasks.filter((t) => t.status === 'DRAFT' || t.status === 'ASSIGNED').length}`}
            onClick={() => onNavigateToTasks('ALL')}
            compact={false}
          />

          {/* STEP 02: SECOND OPTION (Orange) */}
          <NeumorphicPillCard
            step="02"
            title="SECOND OPTION"
            subtitle="IN PROGRESS"
            description="Pengerjaan visual desain, layout & eksplorasi kreatif."
            icon={<TrendingUp className="w-5 h-5 stroke-[2.2]" />}
            badge={`${metrics.inProgress}`}
            onClick={() => onNavigateToTasks('IN_PROGRESS')}
            compact={false}
          />

          {/* STEP 03: THIRD OPTION (Berry Pink) */}
          <NeumorphicPillCard
            step="03"
            title="THIRD OPTION"
            subtitle="WORK SUBMISSION"
            description="Upload render mockup JPG/PNG & tautan file master."
            icon={<Lightbulb className="w-5 h-5 stroke-[2.2]" />}
            badge={`${tasks.filter((t) => t.status === 'SUBMITTED').length}`}
            onClick={() => onNavigateToTasks('SUBMITTED')}
            compact={false}
          />

          {/* STEP 04: FOURTH OPTION (Purple) */}
          <NeumorphicPillCard
            step="04"
            title="FOURTH OPTION"
            subtitle="ART DIRECTION & REVIEW"
            description="Review kualitas visual, catatan revisi & evaluasi manajer."
            icon={<Presentation className="w-5 h-5 stroke-[2.2]" />}
            badge={`${metrics.waitingReview + metrics.revision}`}
            onClick={() => onNavigateToTasks('WAITING_REVIEW')}
            compact={false}
          />

          {/* STEP 05: FIFTH OPTION (Ocean Cyan) */}
          <NeumorphicPillCard
            step="05"
            title="FIFTH OPTION"
            subtitle="APPROVED & RELEASE"
            description="Aset disetujui, siap publikasi campaign & arsip final."
            icon={<Settings className="w-5 h-5 stroke-[2.2]" />}
            badge={`${metrics.completed}`}
            onClick={() => onNavigateToTasks('COMPLETED')}
            compact={false}
          />
        </div>
      </div>

      {/* 6 KEY KPI CARDS WITH HIGH-CONTRAST TYPOGRAPHY & CONSISTENT ICONS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* TOTAL TASK (Yellow / Amber) */}
        <div
          onClick={() => onNavigateToTasks('ALL')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-400/80 dark:hover:border-amber-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">TOTAL TASK</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.total}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Seluruh campaign</p>
        </div>

        {/* IN PROGRESS (Orange) */}
        <div
          onClick={() => onNavigateToTasks('IN_PROGRESS')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-orange-400/80 dark:hover:border-orange-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">IN PROGRESS</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
            {metrics.inProgress}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Sedang dikerjakan</p>
        </div>

        {/* WAITING REVIEW (Purple) */}
        <div
          onClick={() => onNavigateToTasks('WAITING_REVIEW')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-purple-400/80 dark:hover:border-purple-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">REVIEW</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40 group-hover:scale-105 transition-transform">
              <Eye className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            {metrics.waitingReview}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Perlu evaluasi</p>
        </div>

        {/* REVISION (Berry Pink) */}
        <div
          onClick={() => onNavigateToTasks('REVISION')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-pink-400/80 dark:hover:border-pink-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">REVISI</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-pink-50 text-pink-600 border border-pink-200/60 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/40 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-pink-600 dark:text-pink-400 tracking-tight">
            {metrics.revision}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Perlu perbaikan</p>
        </div>

        {/* COMPLETED (Cyan) */}
        <div
          onClick={() => onNavigateToTasks('COMPLETED')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-cyan-400/80 dark:hover:border-cyan-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">COMPLETED</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-50 text-cyan-600 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/40 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
            {metrics.completed}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Disetujui & rilis</p>
        </div>

        {/* OVERDUE (Rose Red) */}
        <div
          onClick={() => onNavigateToTasks('OVERDUE')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-400/80 dark:hover:border-rose-500/60 hover:shadow-xs cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">OVERDUE</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {metrics.overdue}
          </div>
          <p className="text-[11px] text-rose-500/80 mt-1 font-medium">Lewat batas waktu</p>
        </div>
      </div>

      {/* TOP PRIORITY ROW: URGENT / DEADLINE ALERTS & WAITING REVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* 1. URGENT & OVERDUE WATCHLIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shadow-2xs">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Prioritas Deadline & Overdue ({urgentTasks.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Task terlambat atau kurang dari 2 jam menuju deadline
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTasks('OVERDUE')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40 px-1.5 py-0.5 rounded">
                        {task.taskCode}
                      </span>
                      <PriorityBadge priority={task.priority} size="sm" />
                      <span className="text-[11px] text-slate-500 truncate">
                        {task.projectName}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PIC: <strong className="text-slate-700 dark:text-slate-300">{task.assignedUserName}</strong>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <CountdownTimer deadline={task.deadline} compact />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
              Tidak ada task yang overdue saat ini. Semua berjalan sesuai jadwal!
            </div>
          )}
        </div>

        {/* 2. WAITING REVIEW & APPROVAL NEEDED */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Menunggu Review & Approval ({reviewTasks.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Desain yang telah di-submit oleh Designer dan siap direview
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTasks('WAITING_REVIEW')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {reviewTasks.length > 0 ? (
            <div className="space-y-2">
              {reviewTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded">
                        {task.taskCode}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                        {task.currentVersion || 'V1'}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {task.categoryName}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Submitted by: <strong className="text-slate-700 dark:text-slate-300">{task.assignedUserName}</strong>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-2xs">
                      Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Semua submission telah direview. Tidak ada antrean review baru.
            </div>
          )}
        </div>
      </div>

      {/* SECOND ROW: TEAM WORKLOAD & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* TEAM WORKLOAD MONITOR */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Beban Kerja Tim (Team Workload)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Distribusi tugas aktif dan histori revisi per anggota tim
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToTeam}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              Kelola Tim <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {workloadData.map((item) => {
              const maxLoad = 6;
              const loadPercent = Math.min(100, Math.round((item.active / maxLoad) * 100));

              return (
                <div
                  key={item.user.id}
                  className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 hover:bg-white dark:hover:bg-slate-800 transition-all duration-150 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {item.user.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                            {item.user.role === 'CONTENT_CREATOR' ? 'Creator' : 'Designer'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.user.specialization || 'Creative Specialist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.active} Task Aktif
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.completed} Selesai &bull; {item.revisions} Revisi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar of Workload */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200/70 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPercent > 80
                            ? 'bg-rose-500'
                            : loadPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY LOG / AUDIT STREAM */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Aktivitas Terkini (Audit Trail)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Realtime</span>
          </div>

          <div className="space-y-2">
            {allLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedTaskId(log.parentTaskId)}
                className="flex items-start gap-2.5 text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-150"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-slate-800 dark:text-slate-200 font-semibold leading-tight text-xs">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{log.userName}</span>{' '}
                    {log.action.toLowerCase()}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{log.taskTitle}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Simulation Data Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
