'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Loader2, Upload, Trash2, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const RACE_RANKINGS_BUCKET = 'race-rankings';
const ALLOWED_MIME_TYPE = 'application/pdf';

interface StageRankingUploadProps {
  championshipId: string;
  raceId: string;
  currentUrl: string | null;
  onChange?: (url: string | null) => void;
  showHeading?: boolean;
  className?: string;
}

function getStoragePath(championshipId: string, raceId: string) {
  return `${championshipId}/${raceId}.pdf`;
}

function getFileNameFromUrl(url?: string | null) {
  if (!url) return null;
  try {
    const baseUrl = url.split('?')[0];
    const segments = baseUrl.split('/');
    return segments[segments.length - 1] || null;
  } catch (error) {
    console.warn('Unable to parse ranking file name', error);
    return null;
  }
}

function isSupabasePublicUrl(url: string, bucket: string) {
  return url.includes(`/storage/v1/object/public/${bucket}/`);
}

export function StageRankingUpload({
  championshipId,
  raceId,
  currentUrl,
  onChange,
  showHeading = true,
  className,
}: StageRankingUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl ?? null);

  useEffect(() => {
    setLocalUrl(currentUrl ?? null);
  }, [currentUrl]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset input so the same file can be re-selected later if needed
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type !== ALLOWED_MIME_TYPE) {
      toast({
        title: 'Formato non supportato',
        description: 'Carica un file PDF (.pdf).',
        variant: 'destructive',
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!championshipId || !raceId) {
      toast({
        title: 'Errore',
        description: 'ID campionato o gara non valido',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);

      const storagePath = getStoragePath(championshipId, raceId);
      const { error: uploadError } = await supabase.storage
        .from(RACE_RANKINGS_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: ALLOWED_MIME_TYPE,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from(RACE_RANKINGS_BUCKET)
        .getPublicUrl(storagePath);

      const versionedUrl = `${publicData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('events')
        // @ts-expect-error Supabase type inference issue with partial updates
        .update({
          results_url: versionedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', raceId);

      if (updateError) {
        throw updateError;
      }

      setLocalUrl(versionedUrl);
      onChange?.(versionedUrl);

      toast({
        title: 'Classifica salvata',
        description: 'Il file PDF è stato caricato con successo.',
      });
    } catch (error) {
      console.error('Error uploading stage ranking:', error);
      toast({
        title: 'Errore caricamento',
        description: 'Impossibile caricare la classifica. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!championshipId || !raceId) {
      return;
    }

    try {
      setIsProcessing(true);

      const storagePath = getStoragePath(championshipId, raceId);
      if (localUrl && isSupabasePublicUrl(localUrl, RACE_RANKINGS_BUCKET)) {
        await supabase.storage.from(RACE_RANKINGS_BUCKET).remove([storagePath]);
      }

      const { error: updateError } = await supabase
        .from('events')
        // @ts-expect-error Supabase type inference issue with partial updates
        .update({
          results_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', raceId);

      if (updateError) {
        throw updateError;
      }

      setLocalUrl(null);
      onChange?.(null);

      toast({
        title: 'Classifica rimossa',
        description: 'Il file PDF è stato rimosso.',
      });
    } catch (error) {
      console.error('Error removing stage ranking:', error);
      toast({
        title: 'Errore rimozione',
        description: 'Impossibile rimuovere la classifica. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileName = getFileNameFromUrl(localUrl);

  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4',
        !showHeading && 'border border-slate-200 bg-white p-3',
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPE}
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {showHeading ? (
          <div>
            <p className="text-sm font-semibold text-foreground">Classifica PDF della tappa</p>
            <p className="text-xs text-muted-foreground">
              Carica o sostituisci il file di classifica ufficiale. Solo PDF sono consentiti.
            </p>
          </div>
        ) : (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Azioni classifica PDF
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {localUrl ? 'Sostituisci PDF' : 'Carica PDF'}
          </Button>

          {localUrl && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => window.open(localUrl, '_blank', 'noopener,noreferrer')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Apri PDF
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'mt-4 flex flex-col gap-2 rounded-md bg-background/60 p-3 text-sm',
          !showHeading && 'mt-3 bg-slate-50',
        )}
      >
        {localUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={localUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
              >
                {fileName || 'classifica.pdf'}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isProcessing}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Rimuovi
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Nessuna classifica caricata. Carica il PDF ufficiale per renderlo disponibile sul sito pubblico.
          </p>
        )}
      </div>
    </div>
  );
}
