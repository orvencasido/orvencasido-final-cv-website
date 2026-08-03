import React, { useState } from 'react';
import { FileUp, RefreshCw, X } from 'lucide-react';
import { FileUploadFolder, uploadPortfolioFile } from '../../lib/storage';

interface FileUploadFieldProps {
  label: string;
  value?: string;
  folder: FileUploadFolder;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  folder,
  onChange,
  onError,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadPortfolioFile(file, folder);
      onChange(publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'File upload failed.';
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition">
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload PDF'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>

        {value && (value.startsWith('http') || value.startsWith('data:')) && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            View current file
          </a>
        )}
        {value && !value.startsWith('http') && !value.startsWith('data:') && (
          <span className="inline-flex w-fit items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            File uploaded
          </span>
        )}
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        PDF only, up to 15 MB. Supabase files are private and downloaded through the rate-limited Edge Function.
      </p>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded file URL appears here"
        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono text-xs"
      />
    </div>
  );
};
