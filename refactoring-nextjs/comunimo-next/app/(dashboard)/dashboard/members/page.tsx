import { Metadata } from 'next';
import { MembersList } from '@/components/members/MembersList';

export const metadata: Metadata = {
  title: 'Atleti | ComUniMo',
  description: 'Gestione atleti e iscrizioni gare',
};

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <MembersList />
    </div>
  );
}

