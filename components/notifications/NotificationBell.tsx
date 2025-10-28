'use client';

import { useState } from 'react';
import { Bell, Loader2, ChevronRight, MousePointerClick, X, RefreshCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuClose,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotifications, type NotificationFeedItem } from '@/lib/hooks/useNotifications';
import { markNotificationAsRead } from '@/actions/notifications';
import { useToast } from '@/components/ui/toast';
import { useUser } from '@/lib/hooks/useUser';

function formatRelative(date: string) {
  const formatter = new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  return formatter.format(new Date(date));
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markLocalAsRead, refresh } = useNotifications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationFeedItem | null>(null);
  const { toast } = useToast();
  const { profile } = useUser();

  const handleOpen = async (recipientId: string) => {
    const notification = notifications.find(item => item.recipientId === recipientId);
    if (!notification) return;

    setSelectedNotification(notification);
    setDialogOpen(true);

    if (!notification.readAt) {
      const result = await markNotificationAsRead(notification.recipientId);
      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error ?? 'Impossibile aggiornare la notifica',
          variant: 'destructive',
        });
        return;
      }
      markLocalAsRead(notification.recipientId);
    }
  };

  const showAdminLink = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/60 hover:scale-105 transition-all duration-200 rounded-xl group"
          >
            <Bell className={`h-5 w-5 text-slate-600 transition-all duration-200 ${unreadCount > 0 ? 'text-blue-600' : 'group-hover:rotate-12'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 animate-bounce">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[calc(100vw-2rem)] max-w-sm sm:w-80 border-blue-100/50 shadow-xl shadow-blue-500/10"
        >
          <DropdownMenuLabel className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50/30 rounded-t-lg">
            <span className="font-semibold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
              Notifiche
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:scale-[1.03] transition-all duration-200 px-2 py-1 rounded-md hover:bg-white/60"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Aggiorna
              </button>
              <DropdownMenuClose
                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 hover:bg-white/60 hover:text-blue-700 transition-colors"
                aria-label="Chiudi notifiche"
              >
                <X className="h-5 w-5" />
              </DropdownMenuClose>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nessuna notifica disponibile.
            </div>
          ) : (
            notifications.map(notification => {
              const preview = notification.bodyText
                ? notification.bodyText.trim().slice(0, 120) + (notification.bodyText.length > 120 ? '…' : '')
                : 'Nessun contenuto';

              return (
                <DropdownMenuItem
                  key={notification.recipientId}
                  className={`group flex flex-col items-start space-y-1 px-3 py-2.5 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50/30 border-l-2 ${
                    !notification.readAt
                      ? 'bg-blue-50/30 border-blue-500 hover:border-blue-600'
                      : 'border-transparent hover:border-blue-300'
                  }`}
                  onSelect={() => handleOpen(notification.recipientId)}
                >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${!notification.readAt ? 'text-blue-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                  </div>
                  {!notification.readAt && (
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] px-1.5 py-0 shadow-sm flex-shrink-0 animate-pulse"
                    >
                      Nuova
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 w-full">{preview}</p>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-400">{formatRelative(notification.publishedAt)}</span>
                  <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5">
                    Leggi
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </DropdownMenuItem>
              );
            })
          )}

          {showAdminLink && (
            <>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />
              <DropdownMenuItem
                className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 cursor-pointer"
                onSelect={() => {
                  window.location.href = '/dashboard/communications';
                }}
              >
                Gestisci comunicazioni →
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="mb-5">
            <DialogTitle>{selectedNotification?.title ?? 'Comunicazione'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {selectedNotification?.bodyHtml ? (
              <div
                className="prose-notification text-sm"
                dangerouslySetInnerHTML={{ __html: selectedNotification.bodyHtml }}
              />
            ) : selectedNotification?.bodyText ? (
              <p className="whitespace-pre-wrap leading-6 text-gray-700">{selectedNotification.bodyText}</p>
            ) : (
              <p className="italic text-gray-500">Nessun contenuto disponibile.</p>
            )}
            {selectedNotification && (
              <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
                Inviata il {formatRelative(selectedNotification.publishedAt)}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
