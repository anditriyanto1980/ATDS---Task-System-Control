import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { StatusBadge } from '../components/common/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import {
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  UserCheck,
  Search,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface TeamPageProps {
  onFilterByUser: (userId: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const TeamPage: React.FC<TeamPageProps> = ({ onFilterByUser }) => {
  const { allUsers, currentUser, isManager, addUser, deleteUser } = useAuth();
  const { tasks, setSelectedTaskId } = useTasks();

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CREATIVE' | 'MANAGER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DESIGNER');
  const [specialization, setSpecialization] = useState('Senior Graphic Designer');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [formError, setFormError] = useState('');

  const filteredUsers = allUsers.filter((u) => {
    // Role filter
    if (roleFilter === 'CREATIVE' && (u.role === 'ADMIN' || u.role === 'MANAGER')) {
      return false;
    }
    if (roleFilter === 'MANAGER' && u.role !== 'ADMIN' && u.role !== 'MANAGER') {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchSpec = (u.specialization || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSpec) return false;
    }

    return true;
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Nama dan email wajib diisi.');
      return;
    }

    const avatarUrl = customAvatar.trim() || selectedAvatar;

    addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: avatarUrl,
      specialization: specialization.trim(),
    });

    setName('');
    setEmail('');
    setRole('DESIGNER');
    setSpecialization('Senior Graphic Designer');
    setCustomAvatar('');
    setIsAddUserModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Beban Kerja & Tim Kreatif
          </h2>
          <p className="text-xs text-slate-500">
            Pantau kapasitas tugas, histori revisi, dan kecepatan penyelesaian masing-masing Graphic Designer dan Content Creator
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama / keahlian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 w-44 sm:w-56"
            />
          </div>

          {/* Add Member Button (Manager) */}
          {isManager && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Tambah Anggota Tim
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            roleFilter === 'ALL'
              ? 'bg-orange-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua ({allUsers.length})
        </button>
        <button
          onClick={() => setRoleFilter('CREATIVE')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            roleFilter === 'CREATIVE'
              ? 'bg-orange-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tim Kreatif / Desainer ({allUsers.filter((u) => u.role !== 'ADMIN' && u.role !== 'MANAGER').length})
        </button>
        <button
          onClick={() => setRoleFilter('MANAGER')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            roleFilter === 'MANAGER'
              ? 'bg-orange-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manager / Admin ({allUsers.filter((u) => u.role === 'ADMIN' || u.role === 'MANAGER').length})
        </button>
      </div>

      {/* Designer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUsers.map((member) => {
          const userTasks = tasks.filter((t) => t.assignedUserId === member.id);
          const activeTasks = userTasks.filter(
            (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
          );
          const completedTasks = userTasks.filter((t) => t.status === 'COMPLETED');
          const revisionTasks = userTasks.filter((t) => t.status === 'REVISION');
          const totalRevisions = userTasks.reduce((acc, t) => acc + (t.revisionCount || 0), 0);

          // Workload capacity percentage (benchmark 5 concurrent tasks = 100%)
          const maxCapacity = 5;
          const capacityPercent = Math.min(100, Math.round((activeTasks.length / maxCapacity) * 100));

          let capacityBadge = 'Aman (Optimal)';
          let capacityBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';

          if (capacityPercent >= 100) {
            capacityBadge = 'Kapasitas Penuh (Overloaded)';
            capacityBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
          } else if (capacityPercent >= 60) {
            capacityBadge = 'Beban Cukup Padat';
            capacityBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
          }

          const canDeleteThisUser = isManager && member.id !== currentUser.id && member.role !== 'ADMIN';

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5"
            >
              {/* Profile Bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/30 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {member.name}
                      </h3>
                      {member.id === currentUser.id && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/50 text-orange-600">
                          Anda
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {member.specialization || 'Creative Specialist'}
                    </p>
                    <p className="text-[11px] text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${capacityBadgeColor}`}>
                    {capacityBadge}
                  </span>
                  {canDeleteThisUser && (
                    <button
                      onClick={() => setUserToDelete(member)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Workload Metric Stats */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-lg font-black text-slate-900 dark:text-slate-100">
                    {activeTasks.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Aktif</span>
                </div>
                <div>
                  <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {completedTasks.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Selesai</span>
                </div>
                <div>
                  <span className="block text-lg font-black text-amber-600 dark:text-amber-400">
                    {totalRevisions}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Revisi</span>
                </div>
                <div>
                  <span className="block text-lg font-black text-blue-600 dark:text-blue-400">
                    {userTasks.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Kapasitas Kerja Saat Ini</span>
                  <span className="font-mono">{capacityPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capacityPercent >= 100
                        ? 'bg-rose-500'
                        : capacityPercent >= 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* Ongoing tasks list */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Pekerjaan Sedang Berjalan ({activeTasks.length}):
                  </span>
                  <button
                    onClick={() => onFilterByUser(member.id)}
                    className="text-orange-600 hover:underline text-[11px] font-semibold flex items-center gap-0.5"
                  >
                    Buka Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {activeTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-400 bg-slate-50/60 dark:bg-slate-800/30 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-orange-600">
                            {t.taskCode}
                          </span>
                          <StatusBadge status={t.status} size="sm" />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                          {t.title}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <CountdownTimer deadline={t.deadline} compact />
                      </div>
                    </div>
                  ))}

                  {activeTasks.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      Saat ini tidak ada task aktif yang ditugaskan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Tidak ada anggota tim yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ganti filter role.
          </p>
        </div>
      )}

      {/* ADD TEAM MEMBER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-orange-600">
                <Users className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tambah Anggota Tim Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Kantor *
                </label>
                <input
                  type="email"
                  placeholder="rian.design@at-management.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Akun
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="DESIGNER">Graphic Designer</option>
                    <option value="CONTENT_CREATOR">Content Creator</option>
                    <option value="MANAGER">Manager / Art Director</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Spesialisasi
                  </label>
                  <input
                    type="text"
                    placeholder="Motion Graphic, 3D, Banner"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Avatar Foto Profil
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((avUrl, idx) => (
                    <img
                      key={idx}
                      src={avUrl}
                      alt="preset avatar"
                      onClick={() => {
                        setSelectedAvatar(avUrl);
                        setCustomAvatar('');
                      }}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition-all ${
                        selectedAvatar === avUrl && !customAvatar
                          ? 'ring-2 ring-orange-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Atau masukkan custom URL foto avatar..."
                  value={customAvatar}
                  onChange={(e) => setCustomAvatar(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Hapus Anggota Tim?
                </h3>
                <p className="text-xs text-slate-500">{userToDelete.name} ({userToDelete.role})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus user ini dari sistem? User ini tidak akan lagi muncul dalam opsi penugasan (Assign PIC).
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Ya, Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
