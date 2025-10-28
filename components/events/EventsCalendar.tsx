'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Event, Championship } from '@/types/database';
import { useUser } from '@/lib/hooks/useUser';
import { Calendar, Plus, Search, Filter, ChevronLeft, ChevronRight, Grid3x3, List, Trophy, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { CreateEventDialog } from './CreateEventDialog';
import { EventDetailDialog } from './EventDetailDialog';
import { cn } from '@/lib/utils';

type ViewMode = 'calendar' | 'list';
type EventType = 'all' | 'race' | 'custom';

interface EventWithChampionship extends Event {
  championship?: Championship | null;
}

export function EventsCalendar() {
  const { profile } = useUser();
  const [events, setEvents] = useState<EventWithChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventWithChampionship | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);

  const canCreateEvents = profile?.role === 'super_admin' || profile?.role === 'admin';

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          championship:championships(*)
        `)
        .eq('is_active', true)
        .gte('event_date', monthStart.toISOString())
        .lte('event_date', monthEnd.toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Event type filter
      if (eventTypeFilter !== 'all') {
        if (eventTypeFilter === 'race' && !event.championship_id) return false;
        if (eventTypeFilter === 'custom' && event.championship_id) return false;
      }

      return true;
    });
  }, [events, searchQuery, eventTypeFilter]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => 
      isSameDay(parseISO(event.event_date), day)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleEventClick = (event: EventWithChampionship) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleEventCreated = () => {
    fetchEvents();
    setShowCreateDialog(false);
  };

  const handleEventUpdated = () => {
    fetchEvents();
    setShowEventDetail(false);
  };

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const races = filteredEvents.filter(e => e.championship_id).length;
    const custom = filteredEvents.filter(e => !e.championship_id).length;
    
    return { total, races, custom };
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      {canCreateEvents && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crea Evento Personalizzato
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Eventi Totali
                  <span className="block text-xs text-purple-600 mt-0.5 font-semibold">
                    {format(currentDate, 'MMMM yyyy', { locale: it })}
                  </span>
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Gare e Tappe
                  <span className="block text-xs text-orange-600 mt-0.5 font-semibold">
                    {format(currentDate, 'MMMM yyyy', { locale: it })}
                  </span>
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.races}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Eventi Personalizzati
                  <span className="block text-xs text-blue-600 mt-0.5 font-semibold">
                    {format(currentDate, 'MMMM yyyy', { locale: it })}
                  </span>
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.custom}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="border-2 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca eventi per titolo, descrizione o località..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-2 focus:border-purple-500"
              />
            </div>

            {/* Event Type Filter */}
            <Select value={eventTypeFilter} onValueChange={(value) => setEventTypeFilter(value as EventType)}>
              <SelectTrigger className="w-full lg:w-[200px] h-11 border-2">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli eventi</SelectItem>
                <SelectItem value="race">Gare e Tappe</SelectItem>
                <SelectItem value="custom">Eventi Personalizzati</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "h-11 w-11",
                  viewMode === 'calendar' && "bg-purple-600 hover:bg-purple-700"
                )}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-11 w-11",
                  viewMode === 'list' && "bg-purple-600 hover:bg-purple-700"
                )}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar/List View */}
      {loading ? (
        <Card className="border-2">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'calendar' ? (
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Calendario</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Month Selector */}
                <Select
                  value={format(currentDate, 'M')}
                  onValueChange={(value) => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(parseInt(value) - 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-10 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Gennaio</SelectItem>
                    <SelectItem value="2">Febbraio</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Aprile</SelectItem>
                    <SelectItem value="5">Maggio</SelectItem>
                    <SelectItem value="6">Giugno</SelectItem>
                    <SelectItem value="7">Luglio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Settembre</SelectItem>
                    <SelectItem value="10">Ottobre</SelectItem>
                    <SelectItem value="11">Novembre</SelectItem>
                    <SelectItem value="12">Dicembre</SelectItem>
                  </SelectContent>
                </Select>

                {/* Year Selector */}
                <Select
                  value={format(currentDate, 'yyyy')}
                  onValueChange={(value) => {
                    const newDate = new Date(currentDate);
                    newDate.setFullYear(parseInt(value));
                    setCurrentDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-[100px] h-10 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 1 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <div className="h-6 w-px bg-gray-300 mx-1" />

                {/* Navigation Buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-10 w-10 border-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                  className="h-10 px-4 border-2"
                >
                  Oggi
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-10 w-10 border-2"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[120px] border-2 rounded-lg p-2 transition-all",
                      isCurrentDay && "border-purple-500 bg-purple-50",
                      !isCurrentDay && isCurrentMonth && "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md",
                      !isCurrentMonth && "border-gray-100 bg-gray-50 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-semibold mb-2",
                      isCurrentDay && "text-purple-700",
                      !isCurrentDay && isCurrentMonth && "text-gray-900",
                      !isCurrentMonth && "text-gray-400"
                    )}>
                      {format(day, 'd')}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-all hover:scale-105",
                            event.championship_id
                              ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          )}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 3} altri
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card className="border-2">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nessun evento trovato
                </h3>
                <p className="text-gray-600">
                  {searchQuery || eventTypeFilter !== 'all'
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Non ci sono eventi in questo mese'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => {
              const eventDate = parseISO(event.event_date);
              const isPastEvent = eventDate < new Date();

              return (
                <Card
                  key={event.id}
                  className={cn(
                    "border-2 hover:shadow-lg transition-all cursor-pointer group",
                    event.championship_id ? "border-orange-100 hover:border-orange-300" : "border-blue-100 hover:border-blue-300",
                    isPastEvent && "opacity-60"
                  )}
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={cn(
                            "font-semibold",
                            event.championship_id
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          )}>
                            {event.championship_id ? (
                              <>
                                <Trophy className="h-3 w-3 mr-1" />
                                Gara/Tappa
                              </>
                            ) : (
                              <>
                                <CalendarDays className="h-3 w-3 mr-1" />
                                Evento
                              </>
                            )}
                          </Badge>
                          {isPastEvent && (
                            <Badge variant="outline" className="text-gray-600">
                              Concluso
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(eventDate, 'dd MMMM yyyy', { locale: it })}</span>
                          </div>
                          {event.event_time && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.event_time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <span>📍 {event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.championship && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
                            <Trophy className="h-3 w-3 text-orange-600" />
                            <span className="text-xs font-medium text-orange-800">
                              {event.championship.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                          <div className="text-2xl font-bold text-purple-700">
                            {format(eventDate, 'd')}
                          </div>
                          <div className="text-xs font-semibold text-purple-600 uppercase">
                            {format(eventDate, 'MMM', { locale: it })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Dialogs */}
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
        />
      )}
    </div>
  );
}

