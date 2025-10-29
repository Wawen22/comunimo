import { Metadata } from 'next';
import { EventsManager } from '@/components/events/EventsManager';

export const metadata: Metadata = {
  title: 'Eventi | ComUniMo',
  description: 'Gestione eventi, tappe e gare',
};

export default function EventsPage() {
  return (
    <EventsManager />
  );
}
