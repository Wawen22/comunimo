import { Metadata } from 'next';
import { RegisterForm } from '@/components/forms/RegisterForm';

export const metadata: Metadata = {
  title: 'Registrazione | ComUniMo',
  description: 'Crea un nuovo account ComUniMo',
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Nuovo accesso società
        </span>
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-[2rem]">Richiedi un account ComUniMo</h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Compila i dati e seleziona le società di tua competenza: il comitato verificherà la richiesta e attiverà i permessi necessari.
          </p>
        </div>
      </div>
      <RegisterForm />
    </div>
  );
}
