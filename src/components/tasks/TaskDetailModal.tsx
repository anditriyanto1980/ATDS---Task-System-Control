import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { CountdownTimer } from '../common/CountdownTimer';
import { StepCircleNode, getStepColor } from '../common/StepInfographicNode';
import { SubmitWorkModal } from './SubmitWorkModal';
import { RevisionModal } from './RevisionModal';
import { ReassignModal } from './ReassignModal';
import { formatDateTime, formatDateOnly, formatTimeOnly } from '../../utils/helpers';
import {
  X,
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  UserCheck,
  Calendar,
  FileText,
  History,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Download,
  Eye,
  Check,
  Layers,
  ArrowRight,
  GitCommit,
  Share2,
  Edit3,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTask?: (task: Task) => void;
}

const TIMELINE_STEPS = [
  { key: 'CREATED', label: 'Created' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Review' },
  { key: 'REVISION', label: 'Revision' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'COMPLETED', label: 'Completed' },
];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditTask,
}) => {
  const { updateStatus, approveTask, addComment, updateDeadline, deleteTask } = useTasks();
  const { currentUser, isManager, canSubmitWork, canReviewTask, canReassignTask } = useAuth();

  const [activeTab, setActiveTab] = useState<'brief' | 'submissions' | 'revisions' | 'reassignments' | 'logs' | 'comments'>('brief');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadlineVal, setNewDeadlineVal] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !task) return null;

  const isDone = task.status === 'COMPLETED' || task.status === 'APPROVED';

  // Determine active step index for progress bar
  const getStepStatus = (stepKey: string) => {
    const statusOrder: Record<TaskStatus, number> = {
      DRAFT: 0,
      ASSIGNED: 1,
      IN_PROGRESS: 2,
      SUBMITTED: 3,
      UNDER_REVIEW: 4,
      REVISION: 5,
      APPROVED: 6,
      COMPLETED: 7,
      ON_HOLD: 2,
      CANCELLED: 0,
    };

    const currentScore = statusOrder[task.status] ?? 0;
    const stepScores: Record<string, number> = {
      CREATED: 0,
      ASSIGNED: 1,
      IN_PROGRESS: 2,
      SUBMITTED: 3,
      UNDER_REVIEW: 4,
      REVISION: 5,
      APPROVED: 6,
      COMPLETED: 7,
    };

    const targetScore = stepScores[stepKey] ?? 0;

    if (task.status === 'REVISION' && stepKey === 'REVISION') return 'active-revision';
    if (currentScore > targetScore) return 'completed';
    if (currentScore === targetScore) return 'active';
    return 'pending';
  };

  const handleApprove = () => {
    if (window.confirm(`Approve task "${task.title}" sekarang? Status akan otomatis diset ke COMPLETED.`)) {
      approveTask(task.id, 'Pekerjaan disetujui langsung oleh Manager.');
    }
  };

  const handleStartWork = () => {
    updateStatus(task.id, 'IN_PROGRESS', 'Pekerjaan mulai dikerjakan oleh Designer.');
  };

  const handleSaveDeadline = () => {
    if (!newDeadlineVal) return;
    updateDeadline(task.id, new Date(newDeadlineVal).toISOString(), 'Penyesuaian jadwal oleh Manager');
    setIsEditingDeadline(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
          {/* HEADER SECTION */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                {/* Task ID, Project, Priority, Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-md border border-orange-200 dark:border-orange-800">
                    {task.taskCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {task.projectName}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                    {task.categoryName}
                  </span>
                  <PriorityBadge priority={task.priority} size="md" />
                  <StatusBadge status={task.status} size="md" />
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {task.title}
                </h2>

                {/* PIC and Deadline bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">PIC:</span>
                    {task.assignedUserAvatar ? (
                      <img
                        src={task.assignedUserAvatar}
                        alt={task.assignedUserName}
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {task.assignedUserName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Deadline:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDateTime(task.deadline)}
                    </span>
                    {isManager && (
                      <button
                        onClick={() => {
                          setNewDeadlineVal(task.deadline.slice(0, 16));
                          setIsEditingDeadline(!isEditingDeadline);
                        }}
                        className="text-[11px] text-orange-600 hover:underline font-medium ml-1"
                      >
                        {isEditingDeadline ? 'Batal' : 'Ubah'}
                      </button>
                    )}
                  </div>

                  {/* Realtime Countdown Timer */}
                  <div className="ml-auto">
                    <CountdownTimer deadline={task.deadline} isCompleted={isDone} detailed />
                  </div>
                </div>

                {/* Edit Deadline Inline Panel */}
                {isEditingDeadline && (
                  <div className="flex items-center gap-2 pt-2 text-xs">
                    <input
                      type="datetime-local"
                      value={newDeadlineVal}
                      onChange={(e) => setNewDeadlineVal(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <button
                      onClick={handleSaveDeadline}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                    >
                      Simpan Deadline
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ANIMATED PROGRESS TIMELINE WITH STEPPED INFOGRAPHIC NODES */}
            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#FF6A3D] uppercase tracking-wider">
                    WORKFLOW MILESTONE
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Status Saat Ini: <strong className="text-slate-800 dark:text-slate-200">{task.status.replace('_', ' ')}</strong>
                </span>
              </div>

              <div className="relative overflow-x-auto pb-2">
                {/* Connecting Gradient Line */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-gradient-to-r from-[#FF6A3D] via-[#F59E0B] via-[#10B981] via-[#0284C7] to-[#9333EA] opacity-30 -z-0" />

                <div className="flex items-center justify-between min-w-[580px] relative z-10 px-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const status = getStepStatus(step.key);
                    const stepNum = String(idx + 1).padStart(2, '0');
                    const color = getStepColor(stepNum);

                    let stepLabelClass = 'text-slate-400';
                    let isCurrent = false;

                    if (status === 'completed') {
                      stepLabelClass = 'text-emerald-700 dark:text-emerald-400 font-bold';
                    } else if (status === 'active' || status === 'active-revision') {
                      stepLabelClass = 'font-black';
                      isCurrent = true;
                    }

                    return (
                      <div key={step.key} className="flex flex-col items-center group">
                        <div className="relative flex items-center justify-center">
                          <StepCircleNode
                            step={stepNum}
                            size="sm"
                            active={isCurrent || status === 'completed'}
                            orbitPlacement={idx % 2 === 0 ? 'left' : 'right'}
                            icon={
                              status === 'completed' ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              ) : status === 'active-revision' ? (
                                <RotateCcw className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                              ) : undefined
                            }
                          />
                        </div>
                        <span
                          className={`text-[10px] mt-1 whitespace-nowrap text-center ${stepLabelClass}`}
                          style={isCurrent ? { color: color.hex } : undefined}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTION TOOLBAR BASED ON ROLE */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Aksi Cepat:</span>

                {/* Designer start work button */}
                {task.status === 'ASSIGNED' && (
                  <button
                    onClick={handleStartWork}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Mulai Kerjakan (In Progress)
                  </button>
                )}

                {/* Submit Work button (Designer or Manager) */}
                {canSubmitWork(task) && task.status !== 'COMPLETED' && (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Upload & Submit Hasil Desain
                  </button>
                )}

                {/* Manager actions: Request Revision & Approve */}
                {isManager && (task.status === 'UNDER_REVIEW' || task.status === 'SUBMITTED') && (
                  <>
                    <button
                      onClick={() => setIsRevisionModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Request Revision
                    </button>
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Complete
                    </button>
                  </>
                )}

                {/* Manager Approve shortcut even in In Progress or Revision if needed */}
                {isManager && (task.status === 'REVISION' || task.status === 'IN_PROGRESS') && (
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Quick Approve
                  </button>
                )}
              </div>

              {/* Reassignment & Management buttons (Manager only) */}
              <div className="flex items-center gap-2 ml-auto">
                {isManager && onEditTask && (
                  <button
                    onClick={() => {
                      onEditTask(task);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
                    title="Edit Task Details"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                    Edit Task
                  </button>
                )}

                {canReassignTask() && (
                  <button
                    onClick={() => setIsReassignModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    Alihkan PIC
                  </button>
                )}

                {isManager && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-lg transition-colors"
                    title="Hapus Task ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('brief')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'brief'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Design Brief & Clue
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Submissions ({task.submissions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('revisions')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'revisions'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Revisions ({task.revisions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('reassignments')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'reassignments'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Reassignment History ({task.reassignments?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Activity Timeline ({task.activityLogs?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Comments ({task.comments?.length || 0})
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
            {/* TAB 1: BRIEF & DESIGN CLUE */}
            {activeTab === 'brief' && (
              <div className="space-y-6">
                {/* Design Clue Highlight Box */}
                {task.designClue && (
                  <div className="p-4 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      Design Clue (Petunjuk Desain dari Manager)
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {task.designClue}
                    </p>
                  </div>
                )}

                {/* Core Brief */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    Design Brief
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                    {task.designBrief}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.objective && (
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Objective (Tujuan)
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{task.objective}</p>
                    </div>
                  )}

                  {task.targetAudience && (
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Target Audience
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{task.targetAudience}</p>
                    </div>
                  )}

                  {task.designConcept && (
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Design Concept / Tone & Manner
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{task.designConcept}</p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Platform & Ukuran / Dimensi
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {task.platform || 'General'} &bull; <span className="font-mono">{task.dimension || 'Standard'}</span>
                    </p>
                  </div>
                </div>

                {/* Text & CTA */}
                {(task.requiredText || task.cta) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.requiredText && (
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Required Text (Wording Wajib)
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-mono font-medium">
                          {task.requiredText}
                        </p>
                      </div>
                    )}

                    {task.cta && (
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Call to Action (CTA)
                        </span>
                        <p className="text-orange-600 dark:text-orange-400 font-bold">{task.cta}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* References */}
                {task.reference && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Referensi Visual / Moodboard
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href={task.reference}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-orange-600 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Tautan Referensi
                      </a>
                    </div>
                    {task.reference.includes('unsplash') && (
                      <img
                        src={task.reference}
                        alt="reference"
                        className="w-full max-h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700 mt-2"
                      />
                    )}
                  </div>
                )}

                {/* Additional Notes */}
                {task.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Catatan Tambahan
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{task.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SUBMISSIONS */}
            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Riwayat Deliverables & Versi Desain
                  </h4>
                  {canSubmitWork(task) && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold"
                    >
                      + Upload Versi Baru
                    </button>
                  )}
                </div>

                {task.submissions && task.submissions.length > 0 ? (
                  <div className="space-y-4">
                    {task.submissions.map((sub, i) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-bold text-xs">
                              {sub.version}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {sub.fileName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.status === 'REVISION_REQUESTED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {sub.status === 'APPROVED'
                              ? 'Approved'
                              : sub.status === 'REVISION_REQUESTED'
                              ? 'Revision Requested'
                              : 'Pending Review'}
                          </span>
                        </div>

                        {/* File preview */}
                        {sub.previewUrl && (
                          <div
                            onClick={() => setLightboxImage(sub.previewUrl)}
                            className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-72 flex items-center justify-center cursor-pointer"
                          >
                            <img
                              src={sub.previewUrl}
                              alt={sub.fileName}
                              className="w-full h-auto max-h-72 object-contain transition-transform group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                              <ZoomIn className="w-4 h-4" />
                              <span>Klik untuk Memperbesar</span>
                            </div>
                          </div>
                        )}

                        {sub.notes && (
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-100">Catatan PIC: </span>
                            {sub.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>
                            Diupload oleh <strong className="text-slate-700 dark:text-slate-300">{sub.uploaderName}</strong> &bull; {formatDateTime(sub.uploadedAt)}
                          </span>
                          <span className="font-mono">{sub.fileType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <p className="text-slate-500 font-medium">Belum ada hasil desain yang di-submit.</p>
                    {canSubmitWork(task) && (
                      <button
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold"
                      >
                        Submit V1 Sekarang
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: REVISIONS */}
            {activeTab === 'revisions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Riwayat Permintaan Revisi
                  </h4>
                  {isManager && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setIsRevisionModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                    >
                      + Request Revisi Baru
                    </button>
                  )}
                </div>

                {task.revisions && task.revisions.length > 0 ? (
                  <div className="space-y-3">
                    {task.revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded text-xs">
                            Revisi #{rev.revisionNumber} ({rev.submissionVersion})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {formatDateTime(rev.requestedAt)}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                          &ldquo;{rev.feedback}&rdquo;
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-200/50">
                          Diminta oleh: <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.requestedByName}</span>
                          {rev.resolvedAt && (
                            <span className="ml-3 text-emerald-600 font-semibold">
                              &bull; Terselesaikan pada {formatDateTime(rev.resolvedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-500">Tidak ada permintaan revisi pada task ini.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: REASSIGNMENT AUDIT */}
            {activeTab === 'reassignments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Riwayat Pengalihan Tugas (Reassignment)
                  </h4>
                  {canReassignTask() && (
                    <button
                      onClick={() => setIsReassignModalOpen(true)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold"
                    >
                      Alihkan PIC
                    </button>
                  )}
                </div>

                {task.reassignments && task.reassignments.length > 0 ? (
                  <div className="space-y-3">
                    {task.reassignments.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {r.previousPicName}
                          </span>
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-orange-600 dark:text-orange-400">
                            {r.newPicName}
                          </span>
                          <span className="ml-auto text-[11px] text-slate-500">
                            {formatDateTime(r.changedAt)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-semibold text-slate-500 text-[11px] block">Alasan Pengalihan:</span>
                          <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">{r.reason}</p>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Diubah oleh: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.changedByName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-500">
                      Task ini belum pernah dialihkan. PIC saat ini: <strong>{task.assignedUserName}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ACTIVITY TIMELINE / AUDIT TRAIL */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Activity Timeline & Audit Trail Lengkap
                </h4>
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                  {task.activityLogs?.map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-orange-600 ring-4 ring-orange-100 dark:ring-orange-950/40" />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {log.userName} ({log.userRole})
                          </span>
                          <span className="ml-auto text-[11px] text-slate-400">
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>

                        {log.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            {log.details}
                          </p>
                        )}

                        {log.oldValue && log.newValue && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <span className="line-through">{log.oldValue}</span>
                            <span>&rarr;</span>
                            <span className="text-orange-600 font-bold">{log.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: COMMENTS */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Diskusi & Catatan Internal Task
                </h4>

                <div className="space-y-3">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {c.userName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDateTime(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-6">Belum ada komentar.</p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Tulis pesan atau feedback diskusi..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <SubmitWorkModal
        task={task}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      <RevisionModal
        task={task}
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
      />

      <ReassignModal
        task={task}
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
      />

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noreferrer"
                download="deliverable-artwork.jpg"
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Buka / Unduh Gambar"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxImage}
              alt="Deliverable High Resolution Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Hapus Task Ini?
                </h3>
                <p className="text-xs text-slate-500">
                  {task.taskCode} &bull; {task.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Task beserta seluruh riwayat deliverables, submission, revisi, dan log aktivitasnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteTask(task.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
