'use client';

import { useEffect, useState, useTransition } from 'react';
import { Megaphone, Trash2, CalendarClock, Mail, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RequireRole } from '@/components/auth/RequireRole';
import { CommunicationComposer } from '@/components/notifications/CommunicationComposer';
import { supabase } from '@/lib/api/supabase';
import { deleteNotification } from '@/actions/notifications';
import { useToast } from '@/components/ui/toast';
import type { NotificationEmailStatus } from '@/lib/types/database';

interface NotificationRecipientSummary {
  id: string;
  read_at: string | null;
  email_status: NotificationEmailStatus;
}

interface NotificationWithStats {
  id: string;
  title: string;
  published_at: string;
  body_html?: string | null;
  body_text?: string | null;
  recipients: NotificationRecipientSummary[];
}

type NotificationRow = {
  id: string;
  title: string;
  published_at: string;
  body_html: string | null;
  body_text: string | null;
  notification_recipients: {
    id: string;
    read_at: string | null;
    email_status: NotificationEmailStatus;
  }[];
};

export default function CommunicationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [previewNotification, setPreviewNotification] = useState<NotificationWithStats | null>(null);
  const previewPublishedAt = previewNotification
    ? new Date(previewNotification.published_at).toLocaleString('it-IT')
    : '';

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, published_at, body_html, body_text, notification_recipients ( id, read_at, email_status )')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[communications] failed to load notifications', error);
      setNotifications([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as NotificationRow[];

    const normalized: NotificationWithStats[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      published_at: row.published_at,
      recipients: row.notification_recipients ?? [],
      body_html: row.body_html,
      body_text: row.body_text,
    }));

    setNotifications(normalized);
    setLoading(false);
  }

  async function handleDeleteNotification(notificationId: string, title: string) {
    if (!confirm(`Sei sicuro di voler eliminare la notifica "${title}"? Questa azione non può essere annullata e la notifica verrà rimossa per tutti gli utenti.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteNotification(notificationId);

      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error ?? 'Impossibile eliminare la notifica',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Notifica eliminata',
        description: 'La notifica è stata eliminata con successo per tutti gli utenti.',
        variant: 'success',
      });

      // Refresh the list
      fetchNotifications();
    });
  }

  return (
    <RequireRole role="admin">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Megaphone className="h-8 w-8" />
            Comunicazioni
          </h1>
          <p className="text-sm text-gray-600">
            Invia comunicazioni a tutti gli utenti e monitora lo stato di recapito.
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Nuova comunicazione</h2>
          <p className="mt-1 text-sm text-gray-500">
            Il messaggio verrà pubblicato nel centro notifiche e inviato via e-mail a tutti gli utenti attivi.
          </p>
          <div className="mt-6">
            <CommunicationComposer onSubmitted={fetchNotifications} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ultime notifiche</h2>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={fetchNotifications}
            >
              Aggiorna
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
              Nessuna comunicazione inviata al momento.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Titolo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Inviata il
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email inviate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Da leggere
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {notifications.map(notification => {
                      const totalRecipients = notification.recipients.length;
                      const emailsSent = notification.recipients.filter(r => r.email_status === 'sent').length;
                      const unreadCount = notification.recipients.filter(r => !r.read_at).length;
                      const publishedAt = new Date(notification.published_at).toLocaleString('it-IT');

                      return (
                        <tr key={notification.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {notification.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {publishedAt}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {emailsSent} / {totalRecipients}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {unreadCount}
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewNotification(notification)}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Visualizza anteprima contenuto"
                              >
                                <Eye className="h-4 w-4" />
                                Apri
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNotification(notification.id, notification.title)}
                                disabled={isPending}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Elimina notifica per tutti gli utenti"
                              >
                                <Trash2 className="h-4 w-4" />
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-200">
                {notifications.map(notification => {
                  const totalRecipients = notification.recipients.length;
                  const emailsSent = notification.recipients.filter(r => r.email_status === 'sent').length;
                  const unreadCount = notification.recipients.filter(r => !r.read_at).length;
                  const publishedAt = new Date(notification.published_at).toLocaleString('it-IT');

                  return (
                    <div key={notification.id} className="p-4 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {publishedAt}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                            <Mail className="h-3.5 w-3.5" />
                            Email inviate
                          </div>
                          <div className="mt-1 text-lg font-semibold text-blue-900">
                            {emailsSent} / {totalRecipients}
                          </div>
                        </div>
                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                            <EyeOff className="h-3.5 w-3.5" />
                            Da leggere
                          </div>
                          <div className="mt-1 text-lg font-semibold text-amber-900">
                            {unreadCount}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Totale destinatari: <span className="font-medium text-gray-700">{totalRecipients}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewNotification(notification)}
                          className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                          title="Visualizza anteprima contenuto"
                        >
                          <Eye className="h-4 w-4" />
                          Apri
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(notification.id, notification.title)}
                          disabled={isPending}
                          className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Elimina notifica per tutti gli utenti"
                        >
                          <Trash2 className="h-4 w-4" />
                          Elimina
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <Dialog
          open={Boolean(previewNotification)}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewNotification(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            {previewNotification && (
              <>
                <DialogHeader className="space-y-2">
                  <DialogTitle>{previewNotification.title}</DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {previewPublishedAt}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />
                      {previewNotification.recipients.filter(r => r.email_status === 'sent').length} / {previewNotification.recipients.length} email inviate
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                      {previewNotification.recipients.filter(r => !r.read_at).length} da leggere
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 text-sm text-gray-700">
                  {previewNotification.body_html ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewNotification.body_html }}
                    />
                  ) : previewNotification.body_text ? (
                    <p className="whitespace-pre-wrap">{previewNotification.body_text}</p>
                  ) : (
                    <p className="text-gray-500">Nessun contenuto disponibile per questa notifica.</p>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setPreviewNotification(null)}>
                    Chiudi
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RequireRole>
  );
}
