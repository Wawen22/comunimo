'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

/**
 * Footer component for the landing page
 */
export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue-dark text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold">ComUniMo</h3>
            <p className="mt-4 text-sm text-white/80">
              Comitato Unitario Modena - Organizzazione e gestione campionati di atletica
              leggera nella provincia di Modena.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold">Link Utili</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Accedi
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Registrati
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold">Contatti</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:info@comitatounitariomodena.eu"
                  className="transition-colors hover:text-white"
                >
                  info@comitatounitariomodena.eu
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>+39 XXX XXX XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Modena, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/60 md:flex-row">
            <p>
              © {currentYear} ComUniMo - Comitato Unitario Modena. Tutti i diritti riservati.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white">
                Termini di Servizio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

