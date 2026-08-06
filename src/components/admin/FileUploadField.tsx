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
        <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-2xs">
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
            className="inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold text-matcha-950 bg-beige-200 border border-beige-300 rounded-full hover:bg-beige-300 transition"
          >
            View current file
          </a>
        )}
        {value && !value.startsWith('http') && !value.startsWith('data:') && (
          <span className="inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-semibold text-matcha-700 bg-beige-200 rounded-full">
            File uploaded
          </span>
        )}
      </div>

      <p className="text-[11px] text-matcha-700 font-medium">
        PDF only, up to 15 MB. Files are stored securely and downloaded via rate-limited Edge Functions.
      </p>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded file URL appears here"
        className="w-full px-4 py-2.5 text-xs bg-beige-100 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-matcha-950"
      />
    </div>
  );
};
