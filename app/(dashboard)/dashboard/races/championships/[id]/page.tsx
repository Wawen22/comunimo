import { Metadata } from 'next';
import { ChampionshipDetail } from '@/components/races/ChampionshipDetail';

export const metadata: Metadata = {
  title: 'Dettaglio Campionato | ComUniMo',
  description: 'Visualizza i dettagli del campionato e le gare associate',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function ChampionshipDetailPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <ChampionshipDetail championshipId={params.id} />
    </div>
  );
}

