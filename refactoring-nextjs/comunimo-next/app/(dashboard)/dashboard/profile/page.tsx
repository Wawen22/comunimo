import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Profilo | ComUniMo',
  description: 'Gestisci il tuo profilo',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profilo</h1>
        <p className="mt-2 text-gray-600">
          Visualizza e modifica le tue informazioni personali
        </p>
      </div>

      <ProfileView />
    </div>
  );
}

