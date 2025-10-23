import { Metadata } from 'next';
import { ChampionshipForm } from '@/components/races/ChampionshipForm';

export const metadata: Metadata = {
  title: 'Nuovo Campionato | ComUniMo',
  description: 'Crea un nuovo campionato',
};

export default function NewChampionshipPage() {
  return (
    <div className="container mx-auto py-6">
      <ChampionshipForm mode="create" />
    </div>
  );
}

