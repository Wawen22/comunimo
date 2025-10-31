'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { useNotifications, type NotificationFeedItem } from '@/lib/hooks/useNotifications';
import { supabase } from '@/lib/api/supabase';
import { markNotificationAsRead } from '@/actions/notifications';
import { Building2, Users, Calendar, Bell, TrendingUp, ArrowRight, Clock, ChevronRight, MousePointerClick, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { GuidedRegistrationLauncher } from '@/components/dashboard/guided-registration/GuidedRegistrationLauncher';

export default function DashboardPage() {
  const { profile } = useUser();
  const { notifications, unreadCount, loading: notificationsLoading, refresh: refreshNotifications, markLocalAsRead } = useNotifications(5);
  const [stats, setStats] = useState({
    societies: 0,
    members: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationFeedItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Count societies (RLS will filter based on user role)
      const { count: societiesCount } = await supabase
        .from('societies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count members (RLS will filter based on user role)
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count events (RLS will filter based on user role)
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        societies: societiesCount || 0,
        members: membersCount || 0,
        events: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (recipientId: string) => {
    await markNotificationAsRead(recipientId);
    refreshNotifications();
  };

  const handleOpenNotification = async (recipientId: string) => {
    const notification = notifications.find(item => item.recipientId === recipientId);
    if (!notification) return;

    setSelectedNotification(notification);
    setDialogOpen(true);

    // Mark as read if not already read
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

  const formatRelative = (date: string) => {
    const formatter = new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return formatter.format(new Date(date));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Benvenuto, {profile?.full_name || 'Utente'}
            {profile?.role === 'society_admin' && ' - Amministratore Società'}
            {profile?.role === 'admin' && ' - Amministratore'}
            {profile?.role === 'super_admin' && ' - Super Amministratore'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <GuidedRegistrationLauncher className="md:hidden" />
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border border-blue-200">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Tutto aggiornato</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Societies Card */}
        <Link href="/dashboard/societies" className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {profile?.role === 'society_admin' ? 'Società Gestite' : 'Società'}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                ) : (
                  stats.societies
                )}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 transition-transform group-hover:scale-110">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <span className="font-medium">Visualizza tutte</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Members Card */}
        <Link href="/dashboard/members" className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-green-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atleti Attivi</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                ) : (
                  stats.members
                )}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 transition-transform group-hover:scale-110">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <span className="font-medium">Gestisci atleti</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Events Card */}
        <Link href="/dashboard/events" className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-purple-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventi</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                ) : (
                  stats.events
                )}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 transition-transform group-hover:scale-110">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <span className="font-medium">Vedi calendario</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Notifications Card */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notifiche</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {notificationsLoading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                ) : (
                  unreadCount
                )}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3 transition-transform group-hover:scale-110">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <span className="font-medium">
              {unreadCount > 0 ? 'Da leggere' : 'Tutto letto'}
            </span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ultime Comunicazioni</h2>
                    <p className="text-sm text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} non lette` : 'Nessuna notifica non letta'}
                    </p>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={refreshNotifications}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    aria-label="Aggiorna notifiche"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Nessuna comunicazione</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Le nuove comunicazioni appariranno qui
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.recipientId}
                    onClick={() => handleOpenNotification(notification.recipientId)}
                    className={`group px-4 py-3 sm:px-6 sm:py-4 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50/30 cursor-pointer border-l-4 ${
                      !notification.readAt
                        ? 'bg-blue-50/50 border-blue-500 hover:border-blue-600'
                        : 'border-transparent hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`mt-1 rounded-full p-1.5 sm:p-2 transition-all duration-200 ${
                        !notification.readAt ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <Bell className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-200 ${
                          !notification.readAt ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                            <h3 className={`font-semibold text-sm sm:text-base ${
                              !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <MousePointerClick className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                          </div>
                          {!notification.readAt && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-2 animate-pulse" />
                          )}
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {notification.bodyText || 'Nessun contenuto'}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.publishedAt), {
                              addSuffix: true,
                              locale: it,
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {!notification.readAt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.recipientId);
                                }}
                                className="text-[11px] sm:text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                Segna come letta
                              </button>
                            )}
                            <span className="text-[11px] sm:text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                              Clicca per leggere
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && ['admin', 'super_admin'].includes(profile?.role || '') && (
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                <Link
                  href="/dashboard/communications"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Vedi tutte le comunicazioni
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Rapido</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Società Attive</span>
                <span className="text-lg font-bold text-gray-900">{stats.societies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Atleti Totali</span>
                <span className="text-lg font-bold text-gray-900">{stats.members}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eventi Programmati</span>
                <span className="text-lg font-bold text-gray-900">{stats.events}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Notifiche Non Lette</span>
                <span className="text-lg font-bold text-orange-600">{unreadCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/societies"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                Gestisci Società
              </Link>
              <Link
                href="/dashboard/members"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Users className="h-4 w-4 text-green-600" />
                Gestisci Atleti
              </Link>
              <Link
                href="/dashboard/events"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Calendar className="h-4 w-4 text-purple-600" />
                Vedi Eventi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Detail Dialog */}
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
    </div>
  );
}
