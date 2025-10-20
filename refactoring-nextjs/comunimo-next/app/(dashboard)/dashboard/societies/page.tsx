import { Metadata } from 'next';
import { SocietiesList } from '@/components/societies/SocietiesList';

export const metadata: Metadata = {
  title: 'Società | ComUniMo',
  description: 'Gestione società sportive',
};

export default function SocietiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Società</h1>
          <p className="mt-2 text-gray-600">
            Gestisci le società sportive del Comitato Unitario Modena
          </p>
        </div>
      </div>

      <SocietiesList />
    </div>
  );
}

