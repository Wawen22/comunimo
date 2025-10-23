import { Metadata } from 'next';
import { ChampionshipsList } from '@/components/races/ChampionshipsList';

export const metadata: Metadata = {
  title: 'Campionati | ComUniMo',
  description: 'Gestione campionati e gare',
};

export default function ChampionshipsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campionati</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i campionati e le relative gare
          </p>
        </div>
      </div>

      {/* Championships List */}
      <ChampionshipsList />
    </div>
  );
}

