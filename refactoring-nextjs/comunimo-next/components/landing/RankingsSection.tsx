'use client';

import { Trophy, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';

/**
 * Rankings section - Currently a placeholder
 * Will be implemented when rankings database is ready
 */
export function RankingsSection() {
  // TODO: Replace with real data when rankings database is implemented
  const mockRankings = [
    {
      id: '1',
      name: 'Classifica Generale Maschile',
      category: 'Uomini',
      available: false,
    },
    {
      id: '2',
      name: 'Classifica Generale Femminile',
      category: 'Donne',
      available: false,
    },
    {
      id: '3',
      name: 'Classifica per Società',
      category: 'Società',
      available: false,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-bold uppercase tracking-wider text-yellow-600">Classifiche</span>
            </div>
            <h2 className="bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl lg:text-6xl">
              Classifiche del Campionato
            </h2>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Consulta i risultati e le classifiche
            </p>
          </div>
        </ScrollReveal>

        {/* Rankings Grid */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockRankings.map((ranking, index) => (
              <div
                key={ranking.id}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all duration-300 hover:border-brand-blue/50 hover:shadow-2xl hover:-translate-y-2"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1 + 0.3}s both`,
                }}
              >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/0 to-brand-red/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

              {/* Category Badge */}
              <div className="relative z-10 mb-3">
                <span className="inline-block rounded-full bg-gradient-to-r from-brand-blue/10 to-brand-red/10 px-3 py-1 text-xs font-bold text-brand-blue">
                  {ranking.category}
                </span>
              </div>

              {/* Ranking Name */}
              <h3 className="relative z-10 text-lg font-bold text-brand-blue-dark transition-colors group-hover:text-brand-blue">
                {ranking.name}
              </h3>

              {/* Status */}
              {ranking.available ? (
                <Button className="relative z-10 mt-4 w-full border-brand-blue/30 transition-all hover:border-brand-blue hover:bg-brand-blue/5" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Scarica Classifica
                </Button>
              ) : (
                <div className="relative z-10 mt-4 flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 py-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Disponibile a breve</span>
                </div>
              )}
            </div>
          ))}
          </div>
        </ScrollReveal>

        {/* Coming Soon Message */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue/5 to-brand-red/5 p-8 text-center shadow-lg">
            <Clock className="mx-auto h-12 w-12 text-brand-blue animate-pulse" />
            <h3 className="mt-4 text-xl font-bold text-brand-blue-dark md:text-2xl">
              Classifiche in Arrivo
            </h3>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Le classifiche saranno pubblicate al termine di ogni tappa del campionato.
              <br />
              Torna a visitare questa pagina per gli aggiornamenti.
            </p>
          </div>
        </ScrollReveal>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-6">
          <h4 className="font-semibold text-brand-blue-dark">
            Come funzionano le classifiche?
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
              <span>
                Le classifiche vengono aggiornate dopo ogni tappa del campionato
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
              <span>
                Sono disponibili classifiche per categoria, genere e società
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
              <span>
                I risultati sono consultabili in formato PDF scaricabile
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

