import { MembersList } from '@/components/members/MembersList';
import { MemberStats } from '@/components/members/MemberStats';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <MemberStats />

      {/* Members List */}
      <MembersList />
    </div>
  );
}

