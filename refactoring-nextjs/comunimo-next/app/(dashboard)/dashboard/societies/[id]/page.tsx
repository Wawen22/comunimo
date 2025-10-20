import { Metadata } from 'next';
import { SocietyDetail } from '@/components/societies/SocietyDetail';

export const metadata: Metadata = {
  title: 'Dettaglio Società | ComUniMo',
  description: 'Visualizza i dettagli della società',
};

interface SocietyDetailPageProps {
  params: {
    id: string;
  };
}

export default function SocietyDetailPage({ params }: SocietyDetailPageProps) {
  return <SocietyDetail societyId={params.id} />;
}

