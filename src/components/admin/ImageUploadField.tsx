import React, { useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import { ImageUploadFolder, uploadPortfolioImage } from '../../lib/storage';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  folder: ImageUploadFolder;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
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
      const publicUrl = await uploadPortfolioImage(file, folder);
      onChange(publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed.';
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
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
        <div className="w-full sm:w-36 aspect-video rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-zinc-400" />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            JPG, PNG, WebP, GIF, or SVG up to 10 MB.
          </p>
        </div>
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded image URL appears here"
        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
      />
    </div>
  );
};
