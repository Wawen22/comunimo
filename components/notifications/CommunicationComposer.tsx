'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/notifications/RichTextEditor';
import { useToast } from '@/components/ui/toast';
import { publishCommunication } from '@/actions/notifications';

const composerSchema = z.object({
  title: z.string().min(3, 'Il titolo deve avere almeno 3 caratteri'),
  bodyHtml: z.string().min(1, 'Il messaggio non può essere vuoto'),
});

type ComposerFormValues = z.infer<typeof composerSchema>;

interface CommunicationComposerProps {
  onSubmitted?: () => void;
}

export function CommunicationComposer({ onSubmitted }: CommunicationComposerProps) {
  const { register, handleSubmit, setValue, watch, formState, reset } = useForm<ComposerFormValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      title: '',
      bodyHtml: '',
    },
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const bodyHtml = watch('bodyHtml');

  const onSubmit = handleSubmit(formData => {
    startTransition(async () => {
      const result = await publishCommunication({
        title: formData.title,
        bodyHtml: formData.bodyHtml,
      });

      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error ?? 'Impossibile inviare la comunicazione',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Comunicazione inviata',
        description: `Notifica inviata a ${result.recipients ?? 0} utenti. Email inviate: ${result.emailsSent ?? 0}, errori: ${result.emailsFailed ?? 0}.`,
        variant: 'success',
      });

      reset();
      onSubmitted?.();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titolo</Label>
        <Input
          id="title"
          placeholder="Nuova comunicazione"
          {...register('title')}
          disabled={isPending}
        />
        {formState.errors.title && (
          <p className="text-sm text-red-600">{formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Messaggio</Label>
        <RichTextEditor
          value={bodyHtml}
          onChange={value => setValue('bodyHtml', value, { shouldDirty: true })}
          placeholder="Scrivi il contenuto della comunicazione..."
        />
        {formState.errors.bodyHtml && (
          <p className="text-sm text-red-600">{formState.errors.bodyHtml.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Tutti gli utenti attivi riceveranno una notifica in-app e una e-mail.
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Invio in corso...' : 'Invia comunicazione'}
        </Button>
      </div>
    </form>
  );
}
