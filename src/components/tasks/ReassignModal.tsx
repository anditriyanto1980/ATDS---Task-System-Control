import React, { useState } from 'react';
import { Task, User } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { X, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface ReassignModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { reassignPic } = useTasks();
  const { allUsers } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter out the current PIC and managers (assign to designers/content creators)
  const assignableUsers = allUsers.filter(
    (u) => u.id !== task.assignedUserId && u.role !== 'ADMIN'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Pilih Designer pengganti terlebih dahulu.');
      return;
    }
    if (!reason.trim()) {
      alert('Alasan pengalihan PIC wajib diisi!');
      return;
    }

    const newPic = allUsers.find((u) => u.id === selectedUserId);
    if (!newPic) return;

    setIsSubmitting(true);
    setTimeout(() => {
      reassignPic(task.id, newPic, reason.trim());
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-orange-600">
                {task.taskCode}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Alihkan PIC (Reassign Task)
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
          {/* Transfer visual preview */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current PIC
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {task.assignedUserName}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-500" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                New PIC
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {allUsers.find((u) => u.id === selectedUserId)?.name || 'Pilih Designer...'}
              </span>
            </div>
          </div>

          {/* New PIC Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Pilih Designer / Creator Pengganti <span className="text-rose-500">*</span>:
            </label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Pilih PIC Baru --</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.specialization || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Alasan Pengalihan Tugas (Wajib disimpan dalam audit trail) <span className="text-rose-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Havidh fokus menyelesaikan Key Visual Campaign, dialihkan ke Dara spesialis kemasan die-cut."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 text-xs text-sky-800 dark:text-sky-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
            <span>
              Catatan: Riwayat pekerjaan, versi file, dan submission sebelumnya oleh {task.assignedUserName} akan tetap tersimpan utuh dan tidak terhapus.
            </span>
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
              disabled={isSubmitting || !selectedUserId || !reason.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Memindahkan...' : 'Konfirmasi Alihkan PIC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
