/**
 * Race Utilities
 * Helper functions for race management
 */

import { Race, RaceStatus } from '@/types/database';

/**
 * Calculate race status based on dates
 */
export function getRaceStatus(race: Race): RaceStatus {
  const now = new Date();
  const raceDate = new Date(race.event_date);
  const regStart = race.registration_start_date ? new Date(race.registration_start_date) : null;
  const regEnd = race.registration_end_date ? new Date(race.registration_end_date) : null;
  
  // Race already happened
  if (raceDate < now) {
    return 'completed';
  }
  
  // Registrations not yet open
  if (regStart && regStart > now) {
    return 'upcoming';
  }
  
  // Registrations closed
  if (regEnd && regEnd < now) {
    return 'closed';
  }
  
  // Registrations open
  if (regStart && regEnd && regStart <= now && regEnd >= now) {
    return 'open';
  }
  
  // Default: upcoming
  return 'upcoming';
}

/**
 * Check if registration is currently open
 */
export function isRegistrationOpen(race: Race): boolean {
  const status = getRaceStatus(race);
  return status === 'open';
}

/**
 * Get status badge color
 */
export function getStatusColor(status: RaceStatus): string {
  switch (status) {
    case 'upcoming':
      return 'bg-gray-100 text-gray-800';
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: RaceStatus): string {
  switch (status) {
    case 'upcoming':
      return 'In Arrivo';
    case 'open':
      return 'Iscrizioni Aperte';
    case 'closed':
      return 'Iscrizioni Chiuse';
    case 'completed':
      return 'Conclusa';
    default:
      return 'Sconosciuto';
  }
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing -
}

/**
 * Format race title with number
 */
export function formatRaceTitle(race: Race): string {
  if (race.event_number) {
    return `${race.event_number}ª Tappa - ${race.title}`;
  }
  return race.title;
}

/**
 * Get days until race
 */
export function getDaysUntilRace(race: Race): number {
  const now = new Date();
  const raceDate = new Date(race.event_date);
  const diffTime = raceDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get days until registration deadline
 */
export function getDaysUntilDeadline(race: Race): number | null {
  if (!race.registration_end_date) return null;
  
  const now = new Date();
  const deadline = new Date(race.registration_end_date);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if race is in the past
 */
export function isRacePast(race: Race): boolean {
  const now = new Date();
  const raceDate = new Date(race.event_date);
  return raceDate < now;
}

/**
 * Check if race is today
 */
export function isRaceToday(race: Race): boolean {
  const now = new Date();
  const raceDate = new Date(race.event_date);
  return (
    raceDate.getDate() === now.getDate() &&
    raceDate.getMonth() === now.getMonth() &&
    raceDate.getFullYear() === now.getFullYear()
  );
}

/**
 * Format race date for display
 */
export function formatRaceDate(race: Race): string {
  const date = new Date(race.event_date);
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format race time for display
 */
export function formatRaceTime(race: Race): string | null {
  if (!race.event_time) return null;
  
  // event_time is in format "HH:MM:SS"
  const [hours, minutes] = race.event_time.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Get registration period text
 */
export function getRegistrationPeriodText(race: Race): string | null {
  if (!race.registration_start_date || !race.registration_end_date) {
    return null;
  }
  
  const start = new Date(race.registration_start_date);
  const end = new Date(race.registration_end_date);
  
  const startStr = start.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  });
  
  const endStr = end.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  return `${startStr} - ${endStr}`;
}

/**
 * Calculate available spots
 */
export function getAvailableSpots(race: Race, registrationCount: number): number | null {
  if (!race.max_participants) return null;
  return Math.max(0, race.max_participants - registrationCount);
}

/**
 * Check if race is full
 */
export function isRaceFull(race: Race, registrationCount: number): boolean {
  if (!race.max_participants) return false;
  return registrationCount >= race.max_participants;
}

/**
 * Get registration progress percentage
 */
export function getRegistrationProgress(race: Race, registrationCount: number): number {
  if (!race.max_participants) return 0;
  return Math.min(100, (registrationCount / race.max_participants) * 100);
}

