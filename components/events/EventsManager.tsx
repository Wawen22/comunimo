'use client';

import { useState, useMemo } from 'react';
import { Trophy, CalendarDays } from 'lucide-react';
import { useEventsData, type EventsFilters } from '@/lib/hooks/useEventsData';
import { useUser } from '@/lib/hooks/useUser';
import type { Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventsGrid } from '@/components/landing/EventsGrid';
import { CreateEventDialog } from './CreateEventDialog';
import { EventDetailDialog } from './EventDetailDialog';
import { EditCustomEventDialog } from './EditCustomEventDialog';

type EventTypeFilter = 'all' | 'race' | 'custom';

export function EventsManager() {
  const { profile } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');

  const {
    filteredEvents,
    filters,
    setFilters,
    loading,
    error,
    stats,
    pastYears,
    refresh,
  } = useEventsData({ scope: 'dashboard' });

  const canCreateEvents = profile?.role === 'super_admin' || profile?.role === 'admin';

  const eventsFilteredByType = useMemo(() => {
    if (eventTypeFilter === 'all') {
      return filteredEvents;
    }

    return filteredEvents.filter((event) =>
      eventTypeFilter === 'race' ? Boolean(event.championship_id) : !event.championship_id,
    );
  }, [filteredEvents, eventTypeFilter]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleEditRequest = (event: Event) => {
    setEventToEdit(event);
    setShowEventDetail(false);
    setShowEditDialog(true);
  };

  const handleEventCreated = () => {
    refresh();
    setShowCreateDialog(false);
  };

  const handleEventUpdated = () => {
    refresh();
    setShowEventDetail(false);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      setEventToEdit(null);
    }
  };

  const handleEventEdited = (updatedEvent: Event) => {
    refresh();
    setEventToEdit(null);
    setShowEditDialog(false);
    setSelectedEvent(updatedEvent);
    setShowEventDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 p-6 shadow-lg sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
            Gestione Eventi
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Eventi Comitato Unitario Modena</h1>
            <p className="max-w-2xl text-sm text-gray-700 md:text-base">
              Visualizza e gestisci eventi, tappe e gare con una panoramica a schede focalizzata sui prossimi appuntamenti.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-600">In Arrivo</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{stats.upcoming}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-pink-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-600">Questo Mese</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{stats.thisMonth}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className={
              eventTypeFilter === 'all'
                ? 'rounded-full border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'rounded-full border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
            }
            onClick={() => setEventTypeFilter('all')}
          >
            Tutti
          </Button>
          <Button
            variant="outline"
            className={
              eventTypeFilter === 'race'
                ? 'rounded-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                : 'rounded-full border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
            }
            onClick={() => setEventTypeFilter('race')}
          >
            <Trophy className="mr-1 h-3 w-3" />
            Gare/Tappe
          </Button>
          <Button
            variant="outline"
            className={
              eventTypeFilter === 'custom'
                ? 'rounded-full border-0 bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600'
                : 'rounded-full border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
            }
            onClick={() => setEventTypeFilter('custom')}
          >
            <CalendarDays className="mr-1 h-3 w-3" />
            Eventi
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value as EventsFilters['sortBy'] })}
          >
            <SelectTrigger className="w-48 border-2 border-slate-200">
              <SelectValue placeholder="Ordinamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Data (prima i più vicini)</SelectItem>
              <SelectItem value="date-desc">Data (prima i più lontani)</SelectItem>
              <SelectItem value="title">Titolo (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : (
        <EventsGrid
          events={eventsFilteredByType}
          pastYears={pastYears}
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
          onEventClick={handleEventClick}
          onCreateClick={canCreateEvents ? () => setShowCreateDialog(true) : undefined}
        />
      )}

      {showCreateDialog && (
        <CreateEventDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleEventCreated}
        />
      )}

      {showEventDetail && selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          open={showEventDetail}
          onOpenChange={setShowEventDetail}
          onUpdate={handleEventUpdated}
          onEdit={handleEditRequest}
        />
      )}

      {showEditDialog && eventToEdit && (
        <EditCustomEventDialog
          event={eventToEdit}
          open={showEditDialog}
          onOpenChange={handleEditDialogOpenChange}
          onSuccess={handleEventEdited}
        />
      )}
    </div>
  );
}
