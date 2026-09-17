import React, { useState } from 'react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { X, Upload, FileText, Image as ImageIcon, Check } from 'lucide-react';

interface SubmitWorkModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { submitWork } = useTasks();
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const nextVersion = `V${(task.submissions?.length || 0) + 1}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type || 'image/jpeg');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
    }
  };

  const handleQuickPreset = (presetType: 'sample_jpg' | 'sample_png' | 'sample_pdf') => {
    if (presetType === 'sample_jpg') {
      setFileName(`${task.taskCode.toLowerCase()}-${nextVersion.toLowerCase()}-final.jpg`);
      setFileType('image/jpeg');
      setPreviewUrl('https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80');
      setNotes('Desain telah disesuaikan dengan brief terbaru dan ukuran resolusi tinggi.');
    } else if (presetType === 'sample_png') {
      setFileName(`${task.taskCode.toLowerCase()}-${nextVersion.toLowerCase()}-transparent.png`);
      setFileType('image/png');
      setPreviewUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80');
      setNotes('File PNG transparan siap pakai untuk media marketplace.');
    } else {
      setFileName(`${task.taskCode.toLowerCase()}-${nextVersion.toLowerCase()}-print.pdf`);
      setFileType('application/pdf');
      setPreviewUrl('');
      setNotes('File PDF siap cetak dengan bleed 3mm dan color profile CMYK.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert('Silakan pilih atau upload file hasil desain terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      submitWork(task.id, {
        fileName,
        fileType,
        fileUrl: previewUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
        previewUrl,
        notes: notes || `Submission ${nextVersion}`,
      });
      setIsUploading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                {task.taskCode}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Submit Version: {nextVersion}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              Submit Hasil Desain / Konten
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Quick preset selector for instant testing */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Pilihan Cepat Sample File (atau upload manual di bawah):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('sample_jpg')}
                className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-xs font-medium transition-all"
              >
                <span className="block font-bold text-slate-800 dark:text-slate-200">Sample JPG</span>
                <span className="text-[10px] text-slate-500">Preview siap</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('sample_png')}
                className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-xs font-medium transition-all"
              >
                <span className="block font-bold text-slate-800 dark:text-slate-200">Sample PNG</span>
                <span className="text-[10px] text-slate-500">Banner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('sample_pdf')}
                className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-xs font-medium transition-all"
              >
                <span className="block font-bold text-slate-800 dark:text-slate-200">Sample PDF</span>
                <span className="text-[10px] text-slate-500">Dokumen Cetak</span>
              </button>
            </div>
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Upload File (JPG, PNG, PDF, MP4, ZIP, PSD, AI):
            </label>
            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-orange-500 hover:bg-orange-50/20 cursor-pointer transition-all">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.mp4,.zip,.psd,.ai"
                className="hidden"
              />
              <Upload className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Klik untuk upload atau drag & drop file di sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Maksimal ukuran file 100 MB
              </p>
            </label>
          </div>

          {/* File Details preview */}
          {fileName && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-12 h-12 rounded object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {fileName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Version: <span className="font-semibold text-orange-600">{nextVersion}</span> &bull; {fileType}
                </p>
              </div>
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
          )}

          {/* Submission Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Catatan Penjelasan untuk Manager (Opsional):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan perubahan yang dibuat, referensi yang diterapkan, atau catatan penting..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Footer buttons */}
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
              disabled={isUploading}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengunggah...
                </>
              ) : (
                `Submit ${nextVersion} for Review`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
