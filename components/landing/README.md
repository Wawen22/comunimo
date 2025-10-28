# Landing Page Components

Modern, data-driven landing page for la piattaforma ComUniMo.

## 🎯 Overview

La landing comunica in modo immediato lo stato del campionato, la prossima tappa e il valore della piattaforma grazie a cinque sezioni principali:
- **Hero Overview**: riassume il campionato attivo, lo stato delle iscrizioni e le metriche chiave.
- **Next Event Spotlight**: mette in evidenza la prossima gara con countdown, logistica e materiali.
- **Championship Timeline**: timeline verticale con progress bar e badge di stato per ogni tappa.
- **Insights & Strategy**: statistiche aggregate e indicazioni operative per staff e società.
- **Engagement Layer**: benefit principali del portale e invito all'azione.
- **Footer**: contatti, link utili e informazioni di supporto (nessuna newsletter).

## 📁 Component Structure

```
components/landing/
├── HeroSection.tsx            # Hero con CTA e quick stats
├── NextEventSection.tsx       # Spotlight prossima tappa + countdown
├── CalendarSection.tsx        # Timeline verticale con progress track
├── InsightsSection.tsx        # Metriche aggregate e side info
├── EngagementSection.tsx      # Benefit cards per società e atleti
├── LandingFooter.tsx          # Footer con contatti e supporto
├── CountdownTimer.tsx         # Timer riutilizzabile
├── PDFViewerModal.tsx         # Visualizzazione locandine PDF
├── ScrollProgress.tsx         # Indicatore di avanzamento pagina
├── ScrollToTop.tsx            # Bottone per tornare in cima
├── index.ts                   # Barrel export
└── README.md                  # Questo file
```

## 🔧 Data Layer

### Hooks (`lib/hooks/useLandingData.ts`)

- **`useActiveChampionship()`**: recupera il campionato attivo.
- **`useChampionshipStages(championshipId)`**: elenca le tappe per il campionato.
- **`useRegistrationStatus(events)`**: calcola se le iscrizioni sono aperte.
- **`useLandingData()`**: combinazione degli hook precedenti per la landing.

### Utilities (`lib/utils/registrationUtils.ts`)

- **`isRegistrationOpen(events)`**: verifica l’apertura iscrizioni.
- **`getNextEvent(events)`**: restituisce la prossima tappa futura.
- **`calculateTimeRemaining(targetDate)`**: tempo rimanente per il timer.
- **`isPastEvent(event)`**: classifica una tappa come passata/futura.

## 🎨 Design Principles

- **Informazione gerarchica**: hero riassuntivo, seguito da dettagli e insight.
- **Layout modulare**: sezioni autonome per facili iterazioni future.
- **Modern UI**: gradienti morbidi, card arrotondate, tipografia leggibile in tema chiaro.
- **Accessibilità**: contrasto AA, focus visibile, rispetto `prefers-reduced-motion` (timer e animazioni decorative).
- **Responsive first**: layout ottimizzato per 360px → desktop wide.

## 📱 Responsive Behaviour

- **Mobile (<768px)**: sezioni impilate, CTA full width, timeline in stack verticale.
- **Tablet (768–1024px)**: griglie a due colonne per insight e timeline.
- **Desktop (>1024px)**: layout split hero + pannello iscrizioni, timeline verticale con indicatori e badge.

## 🚀 Usage

### Landing Composition

```tsx
import { useLandingData } from '@/lib/hooks/useLandingData';
import {
  HeroSection,
  NextEventSection,
  CalendarSection,
  InsightsSection,
  EngagementSection,
  LandingFooter,
  ScrollProgress,
  ScrollToTop,
} from '@/components/landing';

export default function LandingPage() {
  const { championship, stages, registrationStatus, loading } = useLandingData();

  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <main>
        <HeroSection
          championship={championship}
          stages={stages}
          registrationStatus={registrationStatus}
          loading={loading}
        />
        <NextEventSection events={stages} loading={loading} />
        <CalendarSection stages={stages} loading={loading} />
        <InsightsSection championship={championship} events={stages} />
        <EngagementSection />
        <LandingFooter />
      </main>
    </>
  );
}
```

## 🔮 Next Iterations

- Collegare la futura sezione classifiche quando il dato sarà disponibile.
- Integrare CTA per newsletter reale o automazioni (eventuale evoluzione futura).
- Espandere l’engagement layer con contenuti social/live update.

## 🧪 Testing Checklist

- [ ] Skeleton visibile in stato di caricamento.
- [ ] Hero mostra quick stats coerenti con i dati.
- [ ] Countdown aggiorna ogni minuto e rispetta `prefers-reduced-motion`.
- [ ] Spotlight gestisce assenza poster e location.
- [ ] Timeline distingue correttamente tappe future/passate.
- [ ] Insights mostra valori attesi con fallback `—`.
- [ ] CTA e link (dashboard/login/register) funzionano.
- [ ] Footer mostra solo contatti e supporto (nessuna newsletter).
- [ ] Layout responsive testato a 360px, 768px, 1280px.
- [ ] Tema chiaro coerente tra sezioni e stato focus visibile.
- [ ] Focus outline visibile sugli elementi interattivi.

## 📚 Related Documentation

- `openspec/changes/refactor-landing-experience/proposal.md`
- `openspec/changes/refactor-landing-experience/specs/landing-experience/spec.md`
