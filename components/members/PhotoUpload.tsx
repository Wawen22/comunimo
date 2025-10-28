'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/api/supabase';
import { useToast } from '@/components/ui/toast';
import {
  validateImageFile,
  validateImageDimensions,
  createImagePreview,
  formatFileSize,
  IMAGE_CONFIG,
} from '@/lib/utils/imageValidation';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  memberId?: string;
  societyCode?: string;
  onPhotoChange?: (photoUrl: string | null) => void;
  disabled?: boolean;
}

export function PhotoUpload({
  currentPhotoUrl,
  memberId,
  societyCode,
  onPhotoChange,
  disabled = false,
}: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const fileError = validateImageFile(file);
    if (fileError) {
      toast({
        title: 'Errore',
        description: fileError.message,
        variant: 'destructive',
      });
      return;
    }

    // Validate dimensions
    const dimensionsError = await validateImageDimensions(file);
    if (dimensionsError) {
      toast({
        title: 'Errore',
        description: dimensionsError.message,
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const previewUrl = createImagePreview(file);
    setPreview(previewUrl);
    setSelectedFile(file);

    // If memberId and societyCode are provided, upload immediately
    if (memberId && societyCode) {
      await uploadPhoto(file);
    } else {
      // Otherwise, just notify parent of the file selection
      onPhotoChange?.(previewUrl);
    }
  }, [memberId, societyCode, onPhotoChange, toast]);

  const uploadPhoto = async (file: File) => {
    if (!memberId || !societyCode) {
      toast({
        title: 'Errore',
        description: 'ID atleta o codice società mancante',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);

      // Generate file path: {society_code}/{member_id}.jpg
      const fileExt = file.name.split('.').pop();
      const filePath = `${societyCode}/${memberId}.${fileExt}`;

      // Delete old photo if exists
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('member-photos').remove([oldPath]);
      }

      // Upload new photo
      const { data, error } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      // Update member record
      const { error: updateError } = await supabase
        .from('members')
        // @ts-expect-error - Supabase type inference issue
        .update({ photo_url: publicUrl })
        .eq('id', memberId);

      if (updateError) throw updateError;

      toast({
        title: 'Successo',
        description: 'Foto caricata con successo',
        variant: 'default',
      });

      onPhotoChange?.(publicUrl);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare la foto',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!memberId || !currentPhotoUrl) return;

    try {
      setIsUploading(true);

      // Delete from storage
      const filePath = currentPhotoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('member-photos').remove([filePath]);

      // Update member record
      const { error } = await supabase
        .from('members')
        // @ts-expect-error - Supabase type inference issue
        .update({ photo_url: null })
        .eq('id', memberId);

      if (error) throw error;

      setPreview(null);
      setSelectedFile(null);
      onPhotoChange?.(null);

      toast({
        title: 'Successo',
        description: 'Foto rimossa con successo',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile rimuovere la foto',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : preview
            ? 'border-gray-200'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_CONFIG.allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            ) : (
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? 'Caricamento...' : 'Carica foto atleta'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Trascina un'immagine o clicca per selezionare
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG o WEBP - Max {IMAGE_CONFIG.maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="text-xs text-gray-500">
          <p>
            <span className="font-medium">File:</span> {selectedFile.name}
          </p>
          <p>
            <span className="font-medium">Dimensione:</span>{' '}
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
      )}
    </div>
  );
}

