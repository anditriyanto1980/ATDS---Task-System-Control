import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { X, Plus, Sparkles, Calendar, Layers, Image as ImageIcon, Edit3 } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { projects, categories, createTask, updateTask } = useTasks();
  const { allUsers, currentUser } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [taskType, setTaskType] = useState('Graphic Design');
  const [requester, setRequester] = useState('Marketing Lead (Sarah)');
  const [assignedUserId, setAssignedUserId] = useState(
    allUsers.find((u) => u.role !== 'MANAGER')?.id || allUsers[1]?.id || ''
  );
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('17:00');
  const [estimatedWorkTime, setEstimatedWorkTime] = useState('4 Jam');

  // Design Brief Fields
  const [designBrief, setDesignBrief] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [designConcept, setDesignConcept] = useState('');
  const [designClue, setDesignClue] = useState('');
  const [reference, setReference] = useState('');
  const [requiredText, setRequiredText] = useState('');
  const [cta, setCta] = useState('');
  const [platform, setPlatform] = useState('Shopee');
  const [dimension, setDimension] = useState('1080 x 1080 px');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Populate form if taskToEdit is present
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setProjectId(taskToEdit.projectId || projects[0]?.id || '');
      setCategoryId(taskToEdit.categoryId || categories[0]?.id || '');
      setTaskType(taskToEdit.taskType || 'Graphic Design');
      setRequester(taskToEdit.requester || 'Marketing Lead (Sarah)');
      setAssignedUserId(taskToEdit.assignedUserId || '');
      setPriority(taskToEdit.priority || 'HIGH');
      if (taskToEdit.deadline) {
        const d = new Date(taskToEdit.deadline);
        setDeadlineDate(d.toISOString().split('T')[0]);
        setDeadlineTime(d.toTimeString().slice(0, 5));
      }
      setEstimatedWorkTime(taskToEdit.estimatedWorkTime || '4 Jam');
      setDesignBrief(taskToEdit.designBrief || '');
      setObjective(taskToEdit.objective || '');
      setTargetAudience(taskToEdit.targetAudience || '');
      setDesignConcept(taskToEdit.designConcept || '');
      setDesignClue(taskToEdit.designClue || '');
      setReference(taskToEdit.reference || '');
      setRequiredText(taskToEdit.requiredText || '');
      setCta(taskToEdit.cta || '');
      setPlatform(taskToEdit.platform || 'Shopee');
      setDimension(taskToEdit.dimension || '1080 x 1080 px');
      setNotes(taskToEdit.notes || '');
    } else if (isOpen) {
      // Reset form when opening to create a new task
      setTitle('');
      setProjectId(projects[0]?.id || '');
      setCategoryId(categories[0]?.id || '');
      setTaskType('Graphic Design');
      setRequester('Marketing Lead (Sarah)');
      setAssignedUserId(allUsers.find((u) => u.role !== 'MANAGER')?.id || allUsers[1]?.id || '');
      setPriority('HIGH');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setDeadlineDate(tomorrow.toISOString().split('T')[0]);
      setDeadlineTime('17:00');
      setEstimatedWorkTime('4 Jam');
      setDesignBrief('');
      setObjective('');
      setTargetAudience('');
      setDesignConcept('');
      setDesignClue('');
      setReference('');
      setRequiredText('');
      setCta('');
      setPlatform('Shopee');
      setDimension('1080 x 1080 px');
      setNotes('');
    }
    setFormError('');
  }, [taskToEdit, projects, categories, allUsers, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = () => {
    setTitle('Poster Promosi Paket Berkah Ramadhan Kurma 1kg');
    setDesignBrief('Buat poster promo bundle hemat 2 box Kurma Premium 1kg dengan sentuhan kaligrafi modern dan golden illumination.');
    setObjective('Mendongkrak penjualan bundle Ramadhan pada minggu pertama campaign.');
    setTargetAudience('Ibu rumah tangga & pembeli parcel lebaran korporat.');
    setDesignConcept('Elegan, Islami modern dengan aksen emas foil dan latar belakang soft cream.');
    setDesignClue('Gunakan visual premium dengan background cream. Produk harus menjadi focal point. Pertahankan kemasan original dan tambahkan badge Garansi Kualitas.');
    setRequiredText('PAKET BERKAH RAMADHAN - DISKON 35% BUNDLE HEMAT 2 BOX');
    setCta('Pesan Sekarang Sebelum Kehabisan');
    setPlatform('Instagram & Shopee');
    setDimension('1080 x 1080 px');
    setReference('https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80');
    setNotes('File master PSD layers rapi dengan smart object untuk kemasan.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !designBrief.trim()) {
      setFormError('Judul Task dan Design Brief wajib diisi!');
      return;
    }

    const assignedUser = allUsers.find((u) => u.id === assignedUserId) || allUsers[1];
    const project = projects.find((p) => p.id === projectId) || projects[0];
    const category = categories.find((c) => c.id === categoryId) || categories[0];
    const deadlineIso = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();

    if (taskToEdit) {
      updateTask(
        taskToEdit.id,
        {
          title: title.trim(),
          projectId: project.id,
          projectName: project.name,
          categoryId: category.id,
          categoryName: category.name,
          taskType,
          requester,
          assignedUserId: assignedUser.id,
          assignedUserName: assignedUser.name,
          assignedUserAvatar: assignedUser.avatar,
          priority,
          deadline: deadlineIso,
          estimatedWorkTime,
          designBrief,
          objective,
          targetAudience,
          designConcept,
          designClue,
          reference,
          requiredText,
          cta,
          platform,
          dimension,
          notes,
        },
        'Memperbarui detail brief & spesifikasi task'
      );
    } else {
      createTask({
        title: title.trim(),
        projectId: project.id,
        projectName: project.name,
        categoryId: category.id,
        categoryName: category.name,
        taskType,
        requester,
        assignedUserId: assignedUser.id,
        assignedUserName: assignedUser.name,
        assignedUserAvatar: assignedUser.avatar,
        priority,
        status: 'ASSIGNED' as TaskStatus,
        deadline: deadlineIso,
        estimatedWorkTime,
        designBrief,
        objective,
        targetAudience,
        designConcept,
        designClue,
        reference,
        requiredText,
        cta,
        platform,
        dimension,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">
              {taskToEdit ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {taskToEdit ? `Edit Task: ${taskToEdit.taskCode}` : 'Buat Task Desain & Konten Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {taskToEdit
                  ? 'Perbarui brief, spesifikasi teknis, deadline, atau PIC task ini'
                  : 'Isi form brief lengkap agar Designer memahami kebutuhan dengan detail'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!taskToEdit && (
              <button
                type="button"
                onClick={handleApplyPreset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/80 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-semibold hover:bg-orange-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Contoh Otomatis
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {formError}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 border-b pb-1.5">
              <Layers className="w-4 h-4" /> Informasi Utama Tugas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Judul Task <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Poster Shopee Kurma Akram 500g"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Requester
                </label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Banner">Banner</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Feed">Instagram Feed</option>
                  <option value="Story">Story / Status</option>
                  <option value="Video">Video / Motion</option>
                  <option value="TikTok">TikTok Short</option>
                  <option value="Product Content">Product Content</option>
                </select>
              </div>
            </div>

            {/* Row 2: Assigned User, Priority, Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Assigned User (PIC) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  {allUsers
                    .filter((u) => u.role !== 'MANAGER')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Deadline Date
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Deadline Jam
                </label>
                <input
                  type="time"
                  required
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Design Brief & Clues */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 border-b pb-1.5">
              <ImageIcon className="w-4 h-4" /> Briefing & Design Clue
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Design Brief <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan kebutuhan desain secara keseluruhan..."
                value={designBrief}
                onChange={(e) => setDesignBrief(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Design Clue (Petunjuk Khusus Desain)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Gunakan visual premium background cream. Produk focal point. Pertahankan kemasan original..."
                  value={designClue}
                  onChange={(e) => setDesignClue(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Design Concept / Style
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Minimalist, Elegant, Premium, Clean Islamic Pattern..."
                  value={designConcept}
                  onChange={(e) => setDesignConcept(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Objective (Tujuan)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Meningkatkan CTR flash sale 9.9"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Keluarga muslim usia 25-45 tahun"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Platform
                </label>
                <input
                  type="text"
                  placeholder="Shopee, IG, TikTok, Cetak"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dimension / Ukuran
                </label>
                <input
                  type="text"
                  placeholder="1080 x 1080 px"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CTA (Call to Action)
                </label>
                <input
                  type="text"
                  placeholder="Beli Sekarang, Cek Keranjang"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Waktu Kerja
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 4 Jam"
                  value={estimatedWorkTime}
                  onChange={(e) => setEstimatedWorkTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Required Text (Teks Wajib di Desain)
              </label>
              <input
                type="text"
                placeholder="Wording baku, judul promo, atau headline..."
                value={requiredText}
                onChange={(e) => setRequiredText(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Referensi Visual / Moodboard (URL)
              </label>
              <input
                type="url"
                placeholder="https://pinterest.com/... atau link drive"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                placeholder="Catatan teknis layer, format ekspor, font guideline..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {taskToEdit ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {taskToEdit ? 'Simpan Perubahan Task' : 'Buat & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
