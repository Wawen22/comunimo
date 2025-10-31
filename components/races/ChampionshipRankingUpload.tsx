'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/api/supabase';
import { Loader2, Upload, Trash2, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHAMPIONSHIP_RANKINGS_BUCKET = 'championship-rankings';
const ALLOWED_MIME_TYPE = 'application/pdf';

type RankingKind = 'society' | 'individual';

const LABELS: Record<RankingKind, { title: string; description: string; storageSuffix: string }> = {
  society: {
    title: 'Classifica Società',
    description: 'Carica o aggiorna la classifica a squadre del campionato.',
    storageSuffix: 'society.pdf',
  },
  individual: {
    title: 'Classifica Individuale',
    description: 'Carica o aggiorna la classifica individuale degli atleti.',
    storageSuffix: 'individual.pdf',
  },
};

const FIELD_MAP: Record<RankingKind, 'society_ranking_url' | 'individual_ranking_url'> = {
  society: 'society_ranking_url',
  individual: 'individual_ranking_url',
};

interface ChampionshipRankingUploadProps {
  championshipId: string;
  kind: RankingKind;
  currentUrl: string | null;
  onChange?: (url: string | null) => void;
  showHeading?: boolean;
  className?: string;
}

function getStoragePath(championshipId: string, kind: RankingKind) {
  const suffix = LABELS[kind].storageSuffix;
  return `${championshipId}/${suffix}`;
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

export function ChampionshipRankingUpload({
  championshipId,
  kind,
  currentUrl,
  onChange,
  showHeading = true,
  className,
}: ChampionshipRankingUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl ?? null);

  useEffect(() => {
    setLocalUrl(currentUrl ?? null);
  }, [currentUrl]);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    if (!championshipId) {
      toast({
        title: 'Errore',
        description: 'ID campionato non valido',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);

      const storagePath = getStoragePath(championshipId, kind);
      const { error: uploadError } = await supabase.storage
        .from(CHAMPIONSHIP_RANKINGS_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: ALLOWED_MIME_TYPE,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from(CHAMPIONSHIP_RANKINGS_BUCKET)
        .getPublicUrl(storagePath);

      const versionedUrl = `${publicData.publicUrl}?v=${Date.now()}`;
      const fieldName = FIELD_MAP[kind];

      const { error: updateError } = await supabase
        .from('championships')
        // @ts-expect-error Supabase type inference issue with partial updates
        .update({
          [fieldName]: versionedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', championshipId);

      if (updateError) {
        throw updateError;
      }

      setLocalUrl(versionedUrl);
      onChange?.(versionedUrl);

      toast({
        title: 'Classifica aggiornata',
        description: 'Il file PDF è stato caricato con successo.',
      });
    } catch (error) {
      console.error('Error uploading championship ranking:', error);
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
    if (!championshipId) {
      return;
    }

    try {
      setIsProcessing(true);

      const storagePath = getStoragePath(championshipId, kind);
      if (localUrl && isSupabasePublicUrl(localUrl, CHAMPIONSHIP_RANKINGS_BUCKET)) {
        await supabase.storage.from(CHAMPIONSHIP_RANKINGS_BUCKET).remove([storagePath]);
      }

      const fieldName = FIELD_MAP[kind];
      const { error: updateError } = await supabase
        .from('championships')
        // @ts-expect-error Supabase type inference issue with partial updates
        .update({
          [fieldName]: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', championshipId);

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
      console.error('Error removing championship ranking:', error);
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
  const label = LABELS[kind];

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4',
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
            <p className="text-sm font-semibold text-foreground">{label.title}</p>
            <p className="text-xs text-muted-foreground">{label.description}</p>
          </div>
        ) : (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label.title}
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
          'rounded-md bg-background/60 p-3 text-sm',
          !showHeading && 'bg-slate-50',
        )}
      >
        {localUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={localUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
              >
                {fileName || label.storageSuffix}
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
            Nessun file caricato. Carica un PDF per renderlo disponibile agli utenti.
          </p>
        )}
      </div>
    </div>
  );
}
