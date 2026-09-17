import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose }) => {
  const { tasks, metrics, resetToZero, resetDatabase } = useTasks();
  const [clearMasterData, setClearMasterData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmResetZero = () => {
    setIsProcessing(true);
    setTimeout(() => {
      resetToZero({
        clearProjects: clearMasterData,
        clearCategories: clearMasterData,
      });
      setIsProcessing(false);
      onClose();
    }, 200);
  };

  const handleRestoreDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      resetDatabase();
      setIsProcessing(false);
      onClose();
    }, 200);
  };

  return (
    <div
      id="reset-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="reset-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
            <RotateCcw className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reset Data Simulasi Menjadi 0
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kosongkan seluruh data tugas contoh untuk menggunakan sistem dari awal.
            </p>
          </div>
        </div>

        {/* Current State Pill */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
            <span>Status Data Saat Ini:</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50 font-bold">
              {tasks.length} Task Aktif
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[10px] text-slate-400 font-sans font-medium uppercase">Total</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{metrics.total}</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[10px] text-amber-600 font-sans font-medium uppercase">In Progress</span>
              <span className="text-sm font-bold text-amber-600">{metrics.inProgress}</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[10px] text-rose-500 font-sans font-medium uppercase">Overdue</span>
              <span className="text-sm font-bold text-rose-500">{metrics.overdue}</span>
            </div>
          </div>
        </div>

        {/* Explanatory Bullet Points */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Apa yang akan terjadi setelah di-reset ke 0:
          </p>
          <ul className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <li>
              <strong className="text-slate-700 dark:text-slate-200">Semua {tasks.length} task simulasi</strong>, file hasil submit, revisi, dan log audit akan dihapus bersih (menjadi 0).
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-200">Notifikasi simulasi</strong> akan dikosongkan.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-200">Penomoran kode task baru</strong> akan dimulai dari awal (<code className="text-amber-600 font-mono">AT-000001</code>).
            </li>
            <li>
              Kategori pekerjaan dan Project tetap dipertahankan agar Anda dapat langsung membuat penugasan kerja baru.
            </li>
          </ul>
        </div>

        {/* Optional checkbox */}
        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={clearMasterData}
            onChange={(e) => setClearMasterData(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
          />
          <span>Juga kosongkan daftar Project & Kategori kustom (mulai benar-benar kosong)</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={handleConfirmResetZero}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isProcessing ? 'Mereset...' : 'Ya, Reset Menjadi 0 Task'}
          </button>
        </div>

        {/* Demo Restore Alternative */}
        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleRestoreDemo}
            className="text-[11px] font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Ingin mengembalikan data contoh 16 task bawaan? Klik di sini
          </button>
        </div>
      </div>
    </div>
  );
};
