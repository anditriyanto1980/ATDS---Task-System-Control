import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  Users,
  FolderKanban,
  Tag,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { tasks, metrics, projects, categories } = useTasks();
  const { allUsers } = useAuth();

  // Average completion time calculation (for completed tasks)
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const avgHours =
    completedTasks.length > 0
      ? Math.round(
          completedTasks.reduce((acc, t) => {
            const start = new Date(t.createdAt).getTime();
            const end = t.completedAt ? new Date(t.completedAt).getTime() : Date.now();
            return acc + (end - start) / (1000 * 60 * 60);
          }, 0) / completedTasks.length
        )
      : 8;

  // Breakdown by Designer
  const designers = allUsers.filter((u) => u.role !== 'MANAGER');
  const designerStats = designers.map((d) => {
    const userTasks = tasks.filter((t) => t.assignedUserId === d.id);
    const done = userTasks.filter((t) => t.status === 'COMPLETED').length;
    const revs = userTasks.reduce((acc, t) => acc + t.revisionCount, 0);
    return {
      name: d.name,
      role: d.role,
      total: userTasks.length,
      completed: done,
      revisions: revs,
      completionRate: userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0,
    };
  });

  // Breakdown by Category
  const categoryStats = categories.map((c) => {
    const catTasks = tasks.filter((t) => t.categoryId === c.id);
    const done = catTasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      name: c.name,
      type: c.type,
      total: catTasks.length,
      completed: done,
    };
  });

  // Breakdown by Project
  const projectStats = projects.map((p) => {
    const projTasks = tasks.filter((t) => t.projectId === p.id);
    const done = projTasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      name: p.name,
      total: projTasks.length,
      completed: done,
      rate: projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0,
    };
  });

  // Export CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Project',
      'Category',
      'PIC',
      'Priority',
      'Status',
      'Deadline',
      'Revisions',
      'Version',
      'Created At',
      'Completed At',
    ];

    const rows = tasks.map((t) => [
      `"${t.taskCode}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.projectName}"`,
      `"${t.categoryName}"`,
      `"${t.assignedUserName}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.deadline}"`,
      t.revisionCount,
      `"${t.currentVersion || ''}"`,
      `"${t.createdAt}"`,
      `"${t.completedAt || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `at-design-task-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Laporan Kinerja & Analytics Desain
          </h2>
          <p className="text-xs text-slate-500">
            Evaluasi produktivitas, rasio revisi, dan ekspor dataset lengkap
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV / Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Task</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {metrics.total}
          </p>
          <span className="text-[10px] text-slate-400">Semua request</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Completed Task</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.completed}
          </p>
          <span className="text-[10px] text-slate-400">
            {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}% rasio selesai
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-amber-600">Total Revisi</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {tasks.reduce((acc, t) => acc + t.revisionCount, 0)}
          </p>
          <span className="text-[10px] text-slate-400">Permintaan feedback</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-rose-600">Overdue Task</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {metrics.overdue}
          </p>
          <span className="text-[10px] text-rose-500">Terlambat deadline</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-blue-600">Rata-rata Durasi</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {avgHours} Jam
          </p>
          <span className="text-[10px] text-slate-400">Waktu penyelesaian</span>
        </div>
      </div>

      {/* Breakdown Grid: By Designer & By Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task by Designer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Kinerja per Anggota Tim (Task by Designer)
            </h3>
          </div>

          <div className="space-y-3">
            {designerStats.map((d) => (
              <div
                key={d.name}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{d.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({d.role})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {d.completed} / {d.total} Selesai ({d.completionRate}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 rounded-full"
                    style={{ width: `${d.completionRate}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Revisi yang ditangani: {d.revisions}</span>
                  <span>Rasio efisiensi: {d.revisions === 0 ? 'Tinggi (Tanpa Revisi)' : 'Normal'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task by Category & Project */}
        <div className="space-y-6">
          {/* By Category */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Tag className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Distribusi per Kategori Desain
              </h3>
            </div>

            <div className="space-y-2.5">
              {categoryStats.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{c.type}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 w-12 text-right">
                      {c.total} task
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Project */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FolderKanban className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Penyelesaian per Campaign Project
              </h3>
            </div>

            <div className="space-y-2.5">
              {projectStats.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {p.name}
                  </span>
                  <span className="font-bold text-orange-600 font-mono">
                    {p.completed} / {p.total} ({p.rate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
