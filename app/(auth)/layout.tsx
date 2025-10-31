import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ToastProvider } from '@/components/ui/toast';

const highlights = [
  {
    title: 'Iscrizioni centralizzate',
    description: 'Monitora richieste e stati delle società in un unico pannello sempre aggiornato.',
  },
  {
    title: 'Comunicazioni immediate',
    description: 'Invia notifiche mirate alle società con contenuti e allegati già pronti.',
  },
  {
    title: 'Statistiche real-time',
    description: 'Controlla classifiche, eventi e progressi con dati affidabili e visibili a colpo d’occhio.',
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_65%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-[-18%] hidden w-[55%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.18),_transparent_70%)] blur-3xl lg:block" />

        <header className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
          >
            <Sparkles className="h-4 w-4 text-brand-blue" />
            ComUniMo
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition hover:text-brand-blue/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla landing
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6 lg:px-10">
          <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="order-2 space-y-8 rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:order-1">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
                  Piattaforma ufficiale
                </span>
                <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  Gestisci il campionato provinciale con strumenti moderni e condivisi.
                </h2>
                <p className="max-w-xl text-sm text-slate-600 sm:text-base">
                  Un’unica interfaccia per iscrizioni, comunicazioni e controllo dei dati. Accedi con il tuo account o richiedi l’abilitazione della società per iniziare subito.
                </p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80"
                  >
                    <dt className="text-sm font-semibold text-slate-900">{highlight.title}</dt>
                    <dd className="mt-2 text-xs text-slate-600 sm:text-sm">{highlight.description}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="order-1 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-slate-300/60 sm:px-8 sm:py-10 lg:order-2">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
