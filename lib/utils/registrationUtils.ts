/**
 * Utility functions for championship registration status
 */

import type { Event } from '@/types/database';

/**
 * Check if registrations are currently open for any event
 */
export function isRegistrationOpen(events: Event[]): boolean {
  if (!events || events.length === 0) return false;

  const now = new Date();
  
  return events.some(event => {
    if (!event.registration_start_date || !event.registration_end_date) {
      return false;
    }
    
    const start = new Date(event.registration_start_date);
    const end = new Date(event.registration_end_date);
    
    return now >= start && now <= end;
  });
}

/**
 * Get the next upcoming event (future events only)
 */
export function getNextEvent(events: Event[]): Event | null {
  if (!events || events.length === 0) return null;

  const now = new Date();
  
  // Filter future events and sort by date
  const futureEvents = events
    .filter(event => new Date(event.event_date) >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
  return futureEvents[0] || null;
}

/**
 * Get the registration deadline for the next event
 */
export function getRegistrationDeadline(events: Event[]): Date | null {
  const nextEvent = getNextEvent(events);
  
  if (!nextEvent || !nextEvent.registration_end_date) {
    return null;
  }
  
  return new Date(nextEvent.registration_end_date);
}

/**
 * Calculate time remaining until a target date
 */
export function calculateTimeRemaining(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

/**
 * Check if an event is in the past
 */
export function isPastEvent(event: Event): boolean {
  const now = new Date();
  const eventDate = new Date(event.event_date);
  return eventDate < now;
}

/**
 * Check if an event is the current/next upcoming event
 */
export function isCurrentEvent(event: Event, events: Event[]): boolean {
  const nextEvent = getNextEvent(events);
  return nextEvent?.id === event.id;
}

/**
 * Get registration status text
 */
export function getRegistrationStatusText(isOpen: boolean): string {
  return isOpen ? 'Iscrizioni Aperte' : 'Iscrizioni Chiuse';
}

/**
 * Get registration status color
 */
export function getRegistrationStatusColor(isOpen: boolean): {
  bg: string;
  text: string;
  border: string;
} {
  if (isOpen) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
    };
  }
  
  return {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  };
}

