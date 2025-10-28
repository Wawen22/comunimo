import { Metadata } from 'next';
import { MemberDetail } from '@/components/members/MemberDetail';

export const metadata: Metadata = {
  title: 'Dettaglio Atleta | ComUniMo',
  description: 'Visualizza i dettagli dell\'atleta',
};

interface MemberPageProps {
  params: {
    id: string;
  };
}

export default function MemberPage({ params }: MemberPageProps) {
  return (
    <div className="space-y-6">
      <MemberDetail memberId={params.id} />
    </div>
  );
}

