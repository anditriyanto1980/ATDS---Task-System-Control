import React, { useState } from 'react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { X, AlertTriangle, Send } from 'lucide-react';

interface RevisionModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { requestRevision } = useTasks();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentRevNumber = task.revisionCount + 1;

  const handleQuickFeedback = (text: string) => {
    setFeedback(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Revision Notes wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      requestRevision(task.id, feedback.trim());
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  {task.taskCode}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-800 dark:text-amber-300">
                  Revisi #{currentRevNumber}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Request Revision kepada {task.assignedUserName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Berikan masukan yang jelas, terukur, dan objektif agar Designer dapat melakukan perbaikan dengan cepat dan tepat sasaran.
          </p>

          {/* Quick feedback buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Template Catatan Populer:
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickFeedback(
                    'Produk terlalu kecil. Perbesar sekitar 15% dan kurangi elemen dekorasi di bagian sudut agar CTA lebih menonjol.'
                  )
                }
                className="text-left text-[11px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 dark:text-slate-300 transition-all"
              >
                &ldquo;Produk terlalu kecil. Perbesar sekitar 15% dan kurangi elemen dekorasi...&rdquo;
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFeedback(
                    'Kontras warna typography pada headline kurang terbaca di layar smartphone. Gunakan warna lebih pekat.'
                  )
                }
                className="text-left text-[11px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 dark:text-slate-300 transition-all"
              >
                &ldquo;Kontras warna typography pada headline kurang terbaca di layar smartphone...&rdquo;
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFeedback(
                    'Tambahkan badge Garansi Resmi dan logo Halal di pojok kanan atas sesuai brief.'
                  )
                }
                className="text-left text-[11px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 dark:text-slate-300 transition-all"
              >
                &ldquo;Tambahkan badge Garansi Resmi dan logo Halal di pojok kanan atas...&rdquo;
              </button>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Revision Notes (Wajib) <span className="text-rose-500">*</span>:
            </label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tuliskan detail perbaikan yang diinginkan (misal: ukuran proporsi, warna font, tata letak)..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Mengirim...' : `Kirim Permintaan Revisi #${currentRevNumber}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
