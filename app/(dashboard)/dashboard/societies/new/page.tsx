import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SocietyForm } from '@/components/societies/SocietyForm';
import { RequireRole } from '@/components/auth/RequireRole';

export const metadata: Metadata = {
  title: 'Nuova Società | ComUniMo',
  description: 'Crea una nuova società sportiva',
};

export default function NewSocietyPage() {
  return (
    <RequireRole role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/societies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla lista
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuova Società</h1>
          <p className="mt-2 text-gray-600">
            Inserisci i dati della nuova società sportiva
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SocietyForm />
        </div>
      </div>
    </RequireRole>
  );
}

