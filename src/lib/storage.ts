import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from './supabaseClient';

const IMAGE_BUCKET = 'portfolio-images';
const FILE_BUCKET = 'portfolio-files';
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export type ImageUploadFolder = 'profiles' | 'blogs' | 'projects' | 'certifications' | 'misc';
export type FileUploadFolder = 'resumes' | 'documents';

function sanitizeFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);

  return `${baseName || 'image'}-${Date.now()}.${extension}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadPortfolioImage(file: File, folder: ImageUploadFolder): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image must be 10 MB or smaller.');
  }

  if (!isSupabaseConfigured || !supabase) {
    return fileToDataUrl(file);
  }

  const path = `${folder}/${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPortfolioFile(file: File, folder: FileUploadFolder): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Please select a PDF file.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File must be 15 MB or smaller.');
  }

  if (!isSupabaseConfigured || !supabase) {
    return fileToDataUrl(file);
  }

  const path = `${folder}/${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(FILE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

function extractResumePath(value: string): string {
  if (!value.startsWith('http')) return value;

  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/public/${FILE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return value;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return value;
  }
}

export async function getRateLimitedResumeDownloadUrl(resumePathOrUrl: string): Promise<string> {
  if (!resumePathOrUrl) {
    throw new Error('Resume is not configured.');
  }

  if (!isSupabaseConfigured) {
    return resumePathOrUrl;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured.');
  }

  const resumePath = extractResumePath(resumePathOrUrl);
  const endpoint = `${supabaseUrl}/functions/v1/resume-download?path=${encodeURIComponent(resumePath)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const resetText = payload.resetAt ? ` Try again after ${new Date(payload.resetAt).toLocaleString()}.` : '';
    throw new Error(`${payload.error || 'Resume download failed.'}${resetText}`);
  }

  if (!payload.signedUrl) {
    throw new Error('Resume download URL was not returned.');
  }

  return payload.signedUrl;
}
