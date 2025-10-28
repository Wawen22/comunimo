'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/api/supabase';

type NotificationRecipientRow = {
  id: string;
  notification_id: string;
  read_at: string | null;
  delivered_at: string;
  notification: {
    id: string;
    title: string;
    body_text: string | null;
    body_html: string | null;
    published_at: string;
  } | null;
};

export interface NotificationFeedItem {
  recipientId: string;
  notificationId: string;
  title: string;
  bodyText: string;
  bodyHtml: string;
  publishedAt: string;
  readAt: string | null;
}

interface UseNotificationsState {
  notifications: NotificationFeedItem[];
  unreadCount: number;
  loading: boolean;
}

export function useNotifications(limit = 10) {
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: true,
  });

  const fetchNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState({ notifications: [], unreadCount: 0, loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('notification_recipients')
      .select(
        `
          id,
          notification_id,
          read_at,
          delivered_at,
          notification:notifications (
            id,
            title,
            body_text,
            body_html,
            published_at
          )
        `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('[notifications] failed to load feed', error);
      setState({ notifications: [], unreadCount: 0, loading: false });
      return;
    }

    const rows = data as unknown as NotificationRecipientRow[];

    const formatted: NotificationFeedItem[] = rows.map(recipient => {
      const notification = recipient.notification;

      return {
        recipientId: recipient.id,
        notificationId: recipient.notification_id,
        title: notification?.title ?? 'Comunicazione',
        bodyText: notification?.body_text ?? '',
        bodyHtml: notification?.body_html ?? '',
        publishedAt: notification?.published_at ?? recipient.delivered_at,
        readAt: recipient.read_at,
      };
    });

    const unreadCount = formatted.filter(item => !item.readAt).length;

    setState({ notifications: formatted, unreadCount, loading: false });
  }, [limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markLocalAsRead = useCallback((recipientId: string) => {
    setState(prev => {
      const notifications = prev.notifications.map(item =>
        item.recipientId === recipientId
          ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
          : item
      );
      const unreadCount = notifications.filter(item => !item.readAt).length;
      return { ...prev, notifications, unreadCount };
    });
  }, []);

  return {
    ...state,
    refresh: fetchNotifications,
    markLocalAsRead,
  };
}
