'use client';

import { useState, useMemo } from 'react';
import type { Event } from '@/types/database';
import { CalendarDays, Search, X, Filter, MapPin, Clock, FileText, Trophy, ExternalLink } from 'lucide-react';
import { format, isPast, isFuture, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PDFViewerModal } from '@/components/landing/PDFViewerModal';

interface CalendarSectionProps {
  stages: Event[];
  loading: boolean;
  sectionId?: string;
}

type DateFilter = 'all' | 'upcoming' | 'past';
type SortBy = 'date-asc' | 'date-desc' | 'title';

interface Filters {
  search: string;
  dateFilter: DateFilter;
  sortBy: SortBy;
}

function safeFormat(date: Date | null, pattern: string) {
  if (!date) return 'Data da definire';
  return format(date, pattern, { locale: it });
}

export function CalendarSection({ stages, loading, sectionId }: CalendarSectionProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    dateFilter: 'all',
    sortBy: 'date-desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  // Filter and sort events
  const filteredStages = useMemo(() => {
    if (!stages) return [];

    let filtered = [...stages];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower)
      );
    }

    // Date filter
    if (filters.dateFilter === 'upcoming') {
      filtered = filtered.filter((event) => {
        const eventDate = event.event_date ? new Date(event.event_date) : null;
        return eventDate && isFuture(eventDate);
      });
    } else if (filters.dateFilter === 'past') {
      filtered = filtered.filter((event) => {
        const eventDate = event.event_date ? new Date(event.event_date) : null;
        return eventDate && isPast(eventDate);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date-asc') {
        const aDate = a.event_date ? new Date(a.event_date).getTime() : 0;
        const bDate = b.event_date ? new Date(b.event_date).getTime() : 0;
        return aDate - bDate;
      } else if (filters.sortBy === 'date-desc') {
        const aDate = a.event_date ? new Date(a.event_date).getTime() : 0;
        const bDate = b.event_date ? new Date(b.event_date).getTime() : 0;
        return bDate - aDate;
      } else {
        return (a.title || '').localeCompare(b.title || '');
      }
    });

    return filtered;
  }, [stages, filters]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      dateFilter: 'all',
      sortBy: 'date-desc',
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateFilter !== 'all') count++;
    if (filters.sortBy !== 'date-desc') count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <section id={sectionId} className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-96 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <section id={sectionId} className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-6 text-3xl font-semibold">Il calendario sarà pubblicato a breve</h2>
            <p className="mt-4 text-base text-slate-600">
              Stiamo lavorando alla definizione delle tappe. Riceverai una notifica appena il calendario sarà online.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className="relative overflow-hidden bg-slate-100 py-24 text-slate-900"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.35),_transparent_70%)]" />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
            Timeline del campionato
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Visualizza l'andamento delle gare e pianifica le prossime tappe del tuo team.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cerca per titolo, descrizione o località..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-12 rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, dateFilter: 'all' })}
                className={
                  filters.dateFilter === 'all'
                    ? 'rounded-full border-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:from-purple-600 hover:to-pink-700'
                    : 'rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:border-purple-500 hover:bg-purple-50'
                }
              >
                Tutte
              </Button>
              <Button
                variant={filters.dateFilter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, dateFilter: 'upcoming' })}
                className={
                  filters.dateFilter === 'upcoming'
                    ? 'rounded-full border-2 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:from-orange-600 hover:to-red-600'
                    : 'rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:bg-orange-50'
                }
              >
                In Arrivo
              </Button>
              <Button
                variant={filters.dateFilter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, dateFilter: 'past' })}
                className={
                  filters.dateFilter === 'past'
                    ? 'rounded-full border-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md hover:from-emerald-600 hover:to-green-600'
                    : 'rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50'
                }
              >
                Passate
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:border-purple-500 hover:bg-purple-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtri
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full bg-purple-500 p-0 text-xs text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="mr-2 h-4 w-4" />
                Cancella filtri
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Ordina per</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: SortBy) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger className="rounded-xl border-2 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Data (più recente)</SelectItem>
                      <SelectItem value="date-asc">Data (meno recente)</SelectItem>
                      <SelectItem value="title">Titolo (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredStages.length}</span> di{' '}
          <span className="font-semibold text-slate-900">{stages.length}</span> tappe
        </div>

        {/* Events Grid */}
        {filteredStages.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-6 text-xl font-semibold text-slate-900">Nessuna tappa trovata</h3>
            <p className="mt-2 text-sm text-slate-600">
              Prova a modificare i filtri di ricerca per trovare altre tappe.
            </p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={handleClearFilters}
                className="mt-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              >
                Cancella tutti i filtri
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStages.map((stage) => {
              const eventDate = stage.event_date ? new Date(stage.event_date) : null;
              const isEventPast = eventDate && isPast(eventDate);
              const isEventUpcoming = eventDate && isFuture(eventDate);
              const daysUntil = eventDate ? differenceInDays(eventDate, new Date()) : null;
              const isImminent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

              // Registration status
              const registrationStart = stage.registration_start_date ? new Date(stage.registration_start_date) : null;
              const registrationEnd = stage.registration_end_date ? new Date(stage.registration_end_date) : null;
              const now = new Date();
              const registrationOpen = registrationStart && registrationEnd && now >= registrationStart && now <= registrationEnd;
              const registrationClosed = registrationEnd && now > registrationEnd;

              return (
                <div
                  key={stage.id}
                  className="group relative overflow-hidden rounded-[24px] border-2 border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                      isEventPast
                        ? 'bg-gradient-to-br from-slate-500/10 to-transparent'
                        : isImminent
                        ? 'bg-gradient-to-br from-orange-500/15 via-red-500/10 to-transparent'
                        : 'bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent'
                    }`}
                  />

                  <div className="relative p-6">
                    {/* Header with Status Badge */}
                    <div className="mb-4 flex items-start justify-between">
                      {/* Event Number */}
                      {stage.event_number && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-lg font-bold text-white shadow-lg">
                          {stage.event_number}
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2">
                        {isEventPast ? (
                          <Badge className="rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Completato
                          </Badge>
                        ) : isImminent && daysUntil !== null ? (
                          <Badge className="rounded-full border-2 border-transparent bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                            Tra {daysUntil} {daysUntil === 1 ? 'giorno' : 'giorni'}
                          </Badge>
                        ) : (
                          <Badge className="rounded-full border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                            In Programma
                          </Badge>
                        )}

                        {/* Registration Status */}
                        {!isEventPast && registrationOpen && (
                          <Badge className="rounded-full border-2 border-transparent bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                            Iscrizioni Aperte
                          </Badge>
                        )}
                        {!isEventPast && registrationClosed && (
                          <Badge className="rounded-full border-2 border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                            Iscrizioni Chiuse
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Event Title */}
                    <h3 className="mb-3 text-xl font-semibold text-slate-900 line-clamp-2">{stage.title}</h3>

                    {/* Event Details */}
                    <div className="mb-4 space-y-2 text-sm text-slate-600">
                      {/* Date and Time */}
                      {eventDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-purple-500" />
                          <span>
                            {safeFormat(eventDate, "EEEE d MMMM yyyy")}
                            {stage.event_time && ` • ${stage.event_time}`}
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      {stage.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="line-clamp-1">{stage.location}</span>
                        </div>
                      )}

                      {/* Registration Deadline */}
                      {!isEventPast && registrationEnd && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-xs">
                            Scadenza: {safeFormat(registrationEnd, "d MMM yyyy 'alle' HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {stage.description && (
                      <p className="mb-4 text-sm text-slate-600 line-clamp-2">{stage.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {stage.poster_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPoster(stage.poster_url!)}
                          className="flex-1 rounded-full border-2 border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-500 hover:bg-purple-100"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Locandina
                        </Button>
                      )}
                      {stage.results_url && isEventPast && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 rounded-full border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100"
                        >
                          <a href={stage.results_url} target="_blank" rel="noopener noreferrer">
                            <Trophy className="mr-2 h-4 w-4" />
                            Classifiche
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPoster && (
        <PDFViewerModal
          pdfUrl={selectedPoster}
          isOpen={!!selectedPoster}
          onClose={() => setSelectedPoster(null)}
          title="Locandina evento"
        />
      )}
    </section>
  );
}

