/**
 * Image validation utilities for photo uploads
 */

export const IMAGE_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxWidth: 2000,
  maxHeight: 2000,
};

export interface ImageValidationError {
  type: 'size' | 'format' | 'dimensions' | 'unknown';
  message: string;
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns null if valid, error object if invalid
 */
export function validateImageFile(file: File): ImageValidationError | null {
  // Check file size
  if (file.size > IMAGE_CONFIG.maxSizeBytes) {
    return {
      type: 'size',
      message: `Il file è troppo grande. Dimensione massima: ${IMAGE_CONFIG.maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return {
      type: 'format',
      message: 'Formato non supportato. Usa JPG, PNG o WEBP',
    };
  }

  return null;
}

/**
 * Validate image dimensions
 * @param file - Image file to validate
 * @returns Promise that resolves to null if valid, error object if invalid
 */
export async function validateImageDimensions(
  file: File
): Promise<ImageValidationError | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (
        img.width > IMAGE_CONFIG.maxWidth ||
        img.height > IMAGE_CONFIG.maxHeight
      ) {
        resolve({
          type: 'dimensions',
          message: `Dimensioni troppo grandi. Massimo: ${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}px`,
        });
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        type: 'unknown',
        message: 'Impossibile leggere l\'immagine',
      });
    };

    img.src = url;
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create a preview URL for an image file
 * @param file - Image file
 * @returns Object URL for preview (remember to revoke when done)
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Compress image if needed
 * @param file - Image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 500KB)
 * @returns Promise that resolves to compressed file
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (maintain aspect ratio)
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under maxSizeKB
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > maxSizeKB * 1024 && quality > 0.5) {
                quality -= 0.1;
                tryCompress();
              } else {
                // Create new file from blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

