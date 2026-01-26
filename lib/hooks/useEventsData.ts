'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/api/supabase';
import type { Event } from '@/types/database';

export interface EventsFilters {
  search: string;
  dateFilter: 'all' | 'upcoming' | 'past';
  sortBy: 'date-asc' | 'date-desc' | 'title';
  pastYear: 'all' | string;
}

interface UseEventsDataOptions {
  scope?: 'public' | 'dashboard';
}

export interface UseEventsDataReturn {
  events: Event[];
  filteredEvents: Event[];
  upcomingEvents: Event[];
  nextEvent: Event | null;
  loading: boolean;
  error: string | null;
  filters: EventsFilters;
  setFilters: (filters: EventsFilters) => void;
  stats: {
    total: number;
    upcoming: number;
    past: number;
    thisMonth: number;
  };
  pastYears: number[];
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage events data
 * Provides filtering, sorting, and statistics
 */
export function useEventsData(options: UseEventsDataOptions = {}): UseEventsDataReturn {
  const scope = options.scope ?? 'public';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventsFilters>({
    search: '',
    dateFilter: 'upcoming',
    sortBy: 'date-asc',
    pastYear: 'all',
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (scope === 'public') {
        query = query.eq('is_public', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Impossibile caricare gli eventi');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter and sort events
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredEvents = events
    .filter((event) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date filter
      const eventDate = new Date(event.event_date);

      if (filters.dateFilter === 'upcoming') {
        return eventDate >= now;
      } else if (filters.dateFilter === 'past') {
        if (eventDate >= now) return false;
        if (filters.pastYear !== 'all') {
          const parsedYear = Number.parseInt(filters.pastYear, 10);
          if (!Number.isNaN(parsedYear) && eventDate.getFullYear() !== parsedYear) {
            return false;
          }
        }
        return true;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);

      switch (filters.sortBy) {
        case 'date-asc':
          return dateA.getTime() - dateB.getTime();
        case 'date-desc':
          return dateB.getTime() - dateA.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const upcomingEvents = events
    .filter((event) => new Date(event.event_date) >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const nextEvent = upcomingEvents[0] ?? null;

  // Calculate statistics
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.event_date) >= now).length,
    past: events.filter((e) => new Date(e.event_date) < now).length,
    thisMonth: events.filter((e) => {
      const eventDate = new Date(e.event_date);
      return eventDate >= thisMonthStart && eventDate <= thisMonthEnd;
    }).length,
  };

  const pastYears = Array.from(
    new Set(
      events
        .map((event) => new Date(event.event_date))
        .filter((eventDate) => eventDate < now)
        .map((eventDate) => eventDate.getFullYear()),
    ),
  ).sort((a, b) => b - a);

  return {
    events,
    filteredEvents,
    upcomingEvents,
    nextEvent,
    loading,
    error,
    filters,
    setFilters,
    stats,
    pastYears,
    refresh: fetchEvents,
  };
}
