import React, { useState, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Database,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Category } from '../types';
import { ResetDataModal } from '../components/common/ResetDataModal';

export const SettingsPage: React.FC = () => {
  const { categories, projects, tasks, createCategory, deleteCategory, resetDatabase, refreshData } = useTasks();
  const { isManager } = useAuth();

  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetZeroModalOpen, setIsResetZeroModalOpen] = useState(false);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  // New Category State
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('Graphic Design');
  const [catError, setCatError] = useState('');

  // Backup & Restore
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isSupabaseConfigured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

  const handleReset = () => {
    resetDatabase();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!catName.trim()) {
      setCatError('Nama kategori wajib diisi.');
      return;
    }

    createCategory({
      name: catName.trim(),
      type: catType.trim(),
    });

    setCatName('');
    setCatType('Graphic Design');
    setIsAddCatModalOpen(false);
  };

  const handleDeleteCategory = () => {
    if (!catToDelete) return;
    deleteCategory(catToDelete.id);
    setCatToDelete(null);
  };

  // Export JSON
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      system: 'AT - DESIGN TASK MANAGEMENT SYSTEM',
      tasks,
      projects,
      categories,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `at-design-task-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && Array.isArray(json.tasks)) {
          localStorage.setItem('at_tasks_data', JSON.stringify(json.tasks));
        }
        if (json.projects && Array.isArray(json.projects)) {
          localStorage.setItem('at_projects_data', JSON.stringify(json.projects));
        }
        if (json.categories && Array.isArray(json.categories)) {
          localStorage.setItem('at_categories_data', JSON.stringify(json.categories));
        }
        refreshData();
        setImportStatus('Data backup berhasil di-restore!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus('Format file JSON tidak valid.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-600" />
          Pengaturan Sistem & Manajemen Data
        </h2>
        <p className="text-xs text-slate-500">
          Kelola master kategori desain, backup/restore data sistem, dan arsitektur database Supabase
        </p>
      </div>

      {/* Category Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Kategori Pekerjaan Desain ({categories.length})
            </h3>
          </div>

          {isManager && (
            <button
              onClick={() => setIsAddCatModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Kategori
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  {c.name}
                </span>
                <span className="text-[10px] text-slate-400">{c.type}</span>
              </div>

              {isManager && (
                <button
                  onClick={() => setCatToDelete(c)}
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Database className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold">Cadangan & Pemulihan Data (Backup & Restore)</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Ekspor seluruh data tugas, project, kategori, dan riwayat aktivitas ke file JSON offline, atau pulihkan kembali kapan saja.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            Ekspor Backup (.json)
          </button>

          {isManager && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                Impor Data Backup (.json)
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </>
          )}

          {importStatus && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {importStatus}
            </span>
          )}
        </div>
      </div>

      {/* Supabase Integration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Supabase PostgreSQL Backend
              </h3>
              <p className="text-xs text-slate-500">
                Skema tabel relasional lengkap dan Row Level Security (RLS)
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isSupabaseConfigured
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Supabase Cloud Connected
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Local Persistence Mode (Ready for Supabase)
              </>
            )}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Sistem saat ini berjalan dengan database lokal browser yang persisten (offline-first) dan memiliki arsitektur <code>DatabaseService</code> terisolasi yang 100% siap dihubungkan ke Supabase.
          </p>
          <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <div>
              &bull; File SQL DDL: <code>/src/supabase/schema.sql</code> (Termasuk tabel tasks, submissions, revisions, reassignments, activity_logs, dan RLS)
            </div>
            <div>
              &bull; Environment Variables: <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> (diatur via <code>.env</code>)
            </div>
          </div>
        </div>
      </div>

      {/* Reset Simulation Data Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/90 dark:border-rose-900/50 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Manajemen Reset Data Simulasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status saat ini: <strong className="font-mono text-amber-600">{tasks.length} task</strong> tersimpan di sistem.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
            KONTROL DATA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* OPTION 1: RESET TO 0 (USER STARTS FROM SCRATCH) */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Reset Menjadi 0 Task (Mulai dari Awal)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Kosongkan seluruh data task simulasi, riwayat revisi, dan log notifikasi menjadi <strong>0</strong>. Sangat cocok jika Anda siap menggunakan sistem untuk mengelola tugas tim nyata Anda.
              </p>
            </div>
            <button
              onClick={() => setIsResetZeroModalOpen(true)}
              className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Data Simulasi ke 0
            </button>
          </div>

          {/* OPTION 2: RESTORE DEMO DATASET (16 SAMPLE TASKS) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Muat Ulang Demo Dataset (16 Task)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Kembalikan seluruh 16 data sampel tugas default beserta seluruh skenario workflow (brief, in-progress, review, revision, dan completed) untuk simulasi.
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Kembalikan ke Demo Awal
            </button>
          </div>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Data simulasi berhasil diperbarui!
          </div>
        )}
      </div>

      {/* ADD CATEGORY MODAL */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tambah Kategori Desain Baru
              </h3>
              <button
                onClick={() => setIsAddCatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {catError && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-xs font-semibold">
                {catError}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Banner Promo Marketplace"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kelompok / Tipe Kategori
                </label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Social Media Content">Social Media Content</option>
                  <option value="Motion & Video">Motion & Video</option>
                  <option value="Branding & Packaging">Branding & Packaging</option>
                  <option value="UI/UX & Web Asset">UI/UX & Web Asset</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CATEGORY MODAL */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Hapus Kategori?
                </h3>
                <p className="text-xs text-slate-500">{catToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori ini? Kategori tidak akan muncul lagi di formulir pembuatan task baru.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setCatToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET DATABASE MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Konfirmasi Reset Database
                </h3>
                <p className="text-xs text-slate-500">Kembalikan ke Demo Awal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Seluruh task, riwayat revisi, dan aktivitas yang telah dibuat akan dihapus dan digantikan kembali dengan data demo default awal. Lanjutkan?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset to 0 Modal */}
      <ResetDataModal
        isOpen={isResetZeroModalOpen}
        onClose={() => setIsResetZeroModalOpen(false)}
      />
    </div>
  );
};
