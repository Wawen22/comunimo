'use client';

import { ArrowUpRight, LayoutDashboard, ShieldCheck, UsersRound } from 'lucide-react';

const benefits = [
  {
    title: 'Iscrizioni centralizzate',
    description:
      'Gestisci la squadra da un’unica interfaccia, con conferme immediate e storico completo delle richieste.',
    icon: LayoutDashboard,
  },
  {
    title: 'Dati sempre aggiornati',
    description:
      'Consulta orari, regolamenti e materiali ufficiali senza dover inseguire mail o file sparsi.',
    icon: UsersRound,
  },
  {
    title: 'Sicurezza e trasparenza',
    description:
      'Accesso autenticato, tracciamento delle modifiche e informazioni condivise con tutto lo staff.',
    icon: ShieldCheck,
  },
];

export function EngagementSection() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-100 py-24 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">Pensata per società e atleti</h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Tutto ciò che serve per coordinare il campionato provinciale: iscrizioni, comunicazioni e risultati in un’unica piattaforma.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
            <ArrowUpRight className="h-4 w-4 text-brand-blue" />
            Tutto in un unico posto
          </span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-red/10 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-6 text-xl font-semibold text-slate-900">{benefit.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
