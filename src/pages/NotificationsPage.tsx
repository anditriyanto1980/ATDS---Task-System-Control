import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTasks } from '../context/TaskContext';
import { formatDateTime } from '../utils/helpers';
import {
  Bell,
  CheckCheck,
  RotateCcw,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const { setSelectedTaskId } = useTasks();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'REVISION_REQUESTED':
        return <RotateCcw className="w-4 h-4 text-amber-500" />;
      case 'WORK_SUBMITTED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'TASK_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'DEADLINE_WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'PIC_REASSIGNED':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Pusat Notifikasi & Aktivitas
          </h2>
          <p className="text-xs text-slate-500">
            Pemberitahuan real-time untuk penugasan, submission baru, revisi, dan peringatan deadline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
          <button
            onClick={clearNotifications}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            title="Bersihkan Semua"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-orange-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-orange-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Belum Dibaca ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.taskId) {
                  setSelectedTaskId(n.taskId);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                  : 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${!n.read ? 'text-slate-900 dark:text-slate-100' : ''}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              Tidak ada notifikasi dalam kategori ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
