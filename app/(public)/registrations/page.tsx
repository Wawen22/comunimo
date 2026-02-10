import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, UserPlus, ClipboardList } from 'lucide-react';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';

export const metadata: Metadata = {
  title: 'Iscrizione Atleta | ComUniMo',
  description:
    'Iscrivi manualmente un atleta al campionato provinciale. Compila il form con i dati dell\'atleta.',
};

export default function PublicRegistrationPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-18%] hidden w-[55%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.14),_transparent_70%)] blur-3xl lg:block" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
          ComUniMo
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-2xl">
          {/* Info banner */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800">
                  Come funziona?
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Utilizza questo form per iscrivere manualmente un atleta che non è ancora presente
                  nella lista. Compila tutti i campi obbligatori e la categoria verrà calcolata in
                  automatico in base alla data di nascita e al sesso.
                </p>
              </div>
            </div>
          </div>

          {/* Registration card */}
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-slate-300/40 sm:px-8 sm:py-10">
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Iscrizione libera
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Iscrivi un atleta
                </h2>
                <p className="text-sm text-slate-600">
                  Inserisci i dati dell'atleta da iscrivere al campionato provinciale.
                </p>
              </div>
            </div>

            <PublicRegistrationForm />
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Hai un account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Accedi al portale
            </Link>{' '}
            per gestire le iscrizioni dalla dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}
