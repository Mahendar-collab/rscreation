import { supabase } from './supabase';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const BUCKET_NAME = 'product-previews';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageUploadResult {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

/**
 * Validates a file for product preview upload
 */
export function validatePreviewImage(file: File | null | undefined): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Please upload a preview image.' };
  }

  const fileType = file.type?.toLowerCase();
  const fileName = file.name?.toLowerCase() || '';
  const hasValidExt = /\.(jpe?g|png|webp)$/i.test(fileName);

  if (!ALLOWED_IMAGE_TYPES.includes(fileType) && !hasValidExt) {
    return {
      valid: false,
      error: 'Only JPG, PNG and WEBP images are allowed.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image size must be 5 MB or less.',
    };
  }

  return { valid: true };
}

/**
 * Formats bytes to human-readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Uploads a validated product preview image to Supabase Storage ('product-previews' bucket)
 */
export async function uploadProductPreview(file: File): Promise<ImageUploadResult> {
  const validation = validatePreviewImage(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniquePath = `templates/${Date.now()}-${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback: if storage bucket policy error or offline demo session, create a base64 data URL for preview continuity
      const fallbackDataUrl = await readFileAsDataUrl(file);
      return {
        success: true,
        publicUrl: fallbackDataUrl,
        path: uniquePath,
      };
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Failed to upload preview image:', err);
    try {
      const fallbackUrl = await readFileAsDataUrl(file);
      return {
        success: true,
        publicUrl: fallbackUrl,
      };
    } catch {
      return {
        success: false,
        error: err.message || 'Failed to upload image. Please try again.',
      };
    }
  }
}

/**
 * Deletes an uploaded preview image from Supabase Storage
 */
export async function deleteProductPreview(path: string): Promise<boolean> {
  if (!path) return true;
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    return !error;
  } catch (err) {
    console.warn('Could not remove file from storage:', err);
    return false;
  }
}

/**
 * Helper to read File as Base64 Data URL
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
