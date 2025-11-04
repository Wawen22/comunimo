'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { useNotifications, type NotificationFeedItem } from '@/lib/hooks/useNotifications';
import { markNotificationAsRead } from '@/actions/notifications';
import {
  Building2,
  Users,
  Calendar,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  MousePointerClick,
  RefreshCcw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { GuidedRegistrationLauncher } from '@/components/dashboard/guided-registration/GuidedRegistrationLauncher';
import { useDashboardInsights } from '@/lib/react-query/dashboard';

export default function DashboardPage() {
  const { profile } = useUser();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    refresh: refreshNotifications,
    markLocalAsRead,
  } = useNotifications(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationFeedItem | null>(null);
  const { toast } = useToast();

  const {
    data: insights,
    isLoading: insightsLoading,
    isFetching: insightsFetching,
    error: insightsError,
    refetch: refetchInsights,
  } = useDashboardInsights();

  useEffect(() => {
    if (insightsError) {
      console.error('Error loading dashboard insights:', insightsError);
      toast({
        title: 'Errore',
        description: insightsError.message || 'Impossibile caricare gli insight',
        variant: 'destructive',
      });
    }
  }, [insightsError, toast]);

  const handleMarkAsRead = async (recipientId: string) => {
    await markNotificationAsRead(recipientId);
    refreshNotifications();
  };

  const handleOpenNotification = async (recipientId: string) => {
    const notification = notifications.find((item) => item.recipientId === recipientId);
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

  const formatRelative = (date: string) => {
    const formatter = new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return formatter.format(new Date(date));
  };

  const societyLabel = profile?.role === 'society_admin' ? 'Società Gestite' : 'Società Attive';
  const isInsightsRefreshing = insightsFetching && !insightsLoading;
  const lastUpdatedLabel = insights
    ? formatDistanceToNow(new Date(insights.lastUpdatedAt), { addSuffix: true, locale: it })
    : null;

  const kpiCards = useMemo(
    () => [
      {
        key: 'societies',
        title: societyLabel,
        value: insights?.activeSocieties ?? 0,
        href: '/dashboard/societies',
        icon: Building2,
        accent: 'blue' as const,
        loading: insightsLoading,
      },
      {
        key: 'members',
        title: 'Atleti Attivi',
        value: insights?.activeMembers ?? 0,
        href: '/dashboard/members',
        icon: Users,
        accent: 'green' as const,
        loading: insightsLoading,
      },
      {
        key: 'events',
        title: 'Eventi imminenti (30 giorni)',
        value: insights?.upcomingEventsCount ?? 0,
        href: '/dashboard/events',
        icon: Calendar,
        accent: 'purple' as const,
        loading: insightsLoading,
      },
      {
        key: 'notifications',
        title: 'Notifiche',
        value: unreadCount,
        href: undefined,
        icon: Bell,
        accent: 'orange' as const,
        loading: notificationsLoading,
      },
    ],
    [insights?.activeSocieties, insights?.activeMembers, insights?.upcomingEventsCount, unreadCount, societyLabel, insightsLoading, notificationsLoading],
  );

  const accentStyles: Record<string, { card: string; border: string; icon: string; text: string }> = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50 to-white',
      border: 'hover:border-blue-300',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      card: 'bg-gradient-to-br from-green-50 to-white',
      border: 'hover:border-green-300',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50 to-white',
      border: 'hover:border-purple-300',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
    },
    orange: {
      card: 'bg-gradient-to-br from-orange-50 to-white',
      border: 'hover:border-orange-300',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600',
    },
  };

  const upcomingEvents = insights?.upcomingEvents ?? [];
  const organizationBreakdown = insights?.societiesByOrganization ?? [];

  const quickStats = [
    { label: societyLabel, value: insights?.activeSocieties ?? 0, accent: 'text-blue-600' },
    { label: 'Atleti Attivi', value: insights?.activeMembers ?? 0, accent: 'text-green-600' },
    { label: 'Eventi imminenti (30 giorni)', value: insights?.upcomingEventsCount ?? 0, accent: 'text-purple-600' },
    { label: 'Notifiche non lette', value: unreadCount, accent: 'text-orange-600' },
  ];

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
          {lastUpdatedLabel && (
            <p className="mt-1 text-sm text-gray-500">Aggiornato {lastUpdatedLabel}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <GuidedRegistrationLauncher className="md:hidden" />
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border border-blue-200">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Indicatori aggiornati automaticamente</span>
          </div>
          <button
            type="button"
            onClick={() => refetchInsights()}
            disabled={insightsLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isInsightsRefreshing ? 'animate-spin' : ''}`} />
            {isInsightsRefreshing ? 'Aggiornamento…' : 'Aggiorna'}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const accent = accentStyles[card.accent];
          const content = (
            <div className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-gray-200 ${accent.card} p-6 shadow-sm transition-all hover:shadow-md ${accent.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.loading ? (
                      <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`rounded-lg p-3 transition-transform group-hover:scale-110 ${accent.icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`mt-4 flex items-center text-sm ${accent.text}`}>
                <span className="font-medium">Scopri di più</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.key} href={card.href} className="block h-full">
              {content}
            </Link>
          ) : (
            <div key={card.key} className="h-full">
              {content}
            </div>
          );
        })}
      </div>

      {/* Notifications & Sidebar */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
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
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-600">Nessuna comunicazione</p>
                  <p className="mt-1 text-sm text-gray-500">Le nuove comunicazioni appariranno qui</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.recipientId}
                    onClick={() => handleOpenNotification(notification.recipientId)}
                    className={`group cursor-pointer border-l-4 px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50/30 sm:px-6 sm:py-4 ${
                      !notification.readAt
                        ? 'bg-blue-50/50 border-blue-500 hover:border-blue-600'
                        : 'border-transparent hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`mt-1 rounded-full p-1.5 transition-all duration-200 sm:p-2 ${
                          !notification.readAt ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}
                      >
                        <Bell
                          className={`h-3.5 w-3.5 transition-all duration-200 sm:h-4 sm:w-4 ${
                            !notification.readAt ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-1 items-center gap-1.5 sm:gap-2">
                            <h3
                              className={`font-semibold text-sm sm:text-base ${
                                !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                          </div>
                          {!notification.readAt && (
                            <span className="mt-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                          {notification.bodyText || 'Nessun contenuto'}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 sm:text-xs">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.publishedAt), {
                              addSuffix: true,
                              locale: it,
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {!notification.readAt && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.recipientId);
                                }}
                                className="text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-700 sm:text-xs"
                              >
                                Segna come letta
                              </button>
                            )}
                            <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:text-xs">
                              Dettagli
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
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                <Link
                  href="/dashboard/communications"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Vedi tutte le comunicazioni
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Riepilogo Rapido</h3>
            <div className="space-y-4">
              {quickStats.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {insightsLoading ? (
                    <span className="inline-block h-5 w-10 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <span className={`text-lg font-bold text-gray-900 ${item.accent}`}>{item.value}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-sm text-gray-600">Notifiche Non Lette</span>
                <span className="text-lg font-bold text-orange-600">{unreadCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Azioni Rapide</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/societies"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                Gestisci Società
              </Link>
              <Link
                href="/dashboard/members"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Users className="h-4 w-4 text-green-600" />
                Gestisci Atleti
              </Link>
              <Link
                href="/dashboard/events"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Calendar className="h-4 w-4 text-purple-600" />
                Vedi Eventi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Detail */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Eventi imminenti</h2>
              <p className="text-sm text-gray-500">Prossimi eventi entro 30 giorni</p>
            </div>
            <Link href="/dashboard/events" className="text-sm font-medium text-blue-600 hover:underline">
              Vedi tutto
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {insightsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((ske) => (
                  <div key={ske} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nessun evento programmato nei prossimi 30 giorni.
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const eventDateRelative = formatDistanceToNow(new Date(event.event_date), {
                  addSuffix: true,
                  locale: it,
                });
                return (
                  <div key={event.id} className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{event.location ?? 'Località da definire'}</p>
                      </div>
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span className="font-medium text-blue-600">{eventDateRelative}</span>
                        {event.registration_deadline && (
                          <span>Iscrizioni fino al {new Date(event.registration_deadline).toLocaleDateString('it-IT')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Società per ente</h2>
          <p className="text-sm text-gray-500">Distribuzione delle società attive per organizzazione</p>
          <div className="mt-4 space-y-3">
            {insightsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((ske) => (
                  <div key={ske} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : organizationBreakdown.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nessuna società attiva al momento.
              </div>
            ) : (
              organizationBreakdown.map((item) => (
                <div key={item.organization} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    {item.organization === 'ALTRO' ? 'Altro' : item.organization}
                  </span>
                  <span className="text-base font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            )}
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
              <p className="mt-4 border-t pt-4 text-xs text-gray-400">
                Inviata il {formatRelative(selectedNotification.publishedAt)}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
