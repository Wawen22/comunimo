'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-slate-100 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
                Piattaforma ufficiale
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">ComUniMo – Comitato Unitario Modena</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                Supportiamo società e atleti nella gestione del campionato provinciale di atletica con strumenti digitali, comunicazioni centralizzate e dati aggiornati in tempo reale.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 text-sm text-slate-600">
                <h3 className="text-base font-semibold text-slate-900">Contatti rapidi</h3>
                <p className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-brand-blue" />
                  <a href="mailto:info@comitatounitariomodena.com" className="hover:text-brand-blue">
                    info@comitatounitariomodena.com
                  </a>
                </p>
                <p style={{ display: 'none' }} className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-brand-blue" />
                  <span>+39 059 000000</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-brand-blue" />
                  <span>Modena, Italia</span>
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <h3 className="text-base font-semibold text-slate-900">Link utili</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/dashboard" className="hover:text-brand-blue">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-brand-blue">
                      Accedi
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-brand-blue">
                      Registrati
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Supporto alle società</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Hai bisogno di assistenza per le iscrizioni o di aggiornare i dati della tua società? Scrivici e il team del comitato ti contatterà rapidamente.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>📅 Disponibilità: lun–ven 09:00 → 18:00</p>
              <p>📧 Indirizzo dedicato: <a href="mailto:info@comitatounitariomodena.com" className="font-semibold text-brand-blue">info@comitatounitariomodena.com</a></p>
            </div>
          </aside>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} ComUniMo – Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand-blue">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-blue">
              Termini di servizio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
