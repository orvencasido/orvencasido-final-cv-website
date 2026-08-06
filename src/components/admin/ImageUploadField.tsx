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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-36 aspect-video rounded-2xl border border-beige-300 bg-beige-200 overflow-hidden flex items-center justify-center shadow-2xs">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-matcha-600" />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-2xs">
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
          <p className="text-[11px] text-matcha-700 font-medium">
            JPG, PNG, WebP, GIF, or SVG up to 10 MB.
          </p>
        </div>
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded image URL appears here"
        className="w-full px-4 py-2.5 bg-beige-100 border border-beige-300 rounded-2xl text-xs font-mono text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
      />
    </div>
  );
};
