import { Metadata } from 'next';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { LoginForm } from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Login | ComUniMo',
  description: 'Accedi al tuo account ComUniMo',
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
          Accesso riservato
        </span>
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-[2rem]">Bentornato in ComUniMo</h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Inserisci le credenziali assegnate dal comitato per gestire iscrizioni, comunicazioni e classifiche della tua società.
          </p>
        </div>
      </div>
      <LoginForm />

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <Link
          href="/registrations"
          className="group flex items-center gap-2 text-sm text-slate-600 transition hover:text-blue-600"
        >
          <UserPlus className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
          <span>
            Devi iscrivere un atleta non presente in lista?{' '}
            <span className="font-medium text-blue-600 underline underline-offset-2 group-hover:text-blue-700">
              Iscrizione libera
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
