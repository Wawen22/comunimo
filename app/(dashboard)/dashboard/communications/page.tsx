'use client';

import { useEffect, useState, useTransition } from 'react';
import { Megaphone, Trash2 } from 'lucide-react';
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
  recipients: NotificationRecipientSummary[];
}

type NotificationRow = {
  id: string;
  title: string;
  published_at: string;
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, published_at, notification_recipients ( id, read_at, email_status )')
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

                    return (
                      <tr key={notification.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {notification.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(notification.published_at).toLocaleString('it-IT')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {emailsSent} / {totalRecipients}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {unreadCount}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </RequireRole>
  );
}
