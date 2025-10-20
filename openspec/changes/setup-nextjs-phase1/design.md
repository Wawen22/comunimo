# Design Document - Setup Next.js Phase 1

## Context

ComUniMo è un'applicazione legacy basata su PHP/CodeIgniter che necessita di un refactoring completo. Questa fase stabilisce le fondamenta tecniche per l'intera migrazione verso Next.js 14 + Supabase.

**Stakeholders:**
- Team di sviluppo (frontend, backend, full-stack)
- Product owner
- Utenti finali (società sportive, amministratori)

**Constraints:**
- Mantenere tutte le funzionalità esistenti
- Garantire performance superiori al sistema legacy
- Rispettare timeline di 12-16 settimane per progetto completo
- Budget limitato per servizi cloud

## Goals / Non-Goals

### Goals
1. ✅ Creare un progetto Next.js 14 production-ready
2. ✅ Stabilire un design system scalabile e manutenibile
3. ✅ Configurare tooling per developer experience ottimale
4. ✅ Garantire type safety completa con TypeScript strict
5. ✅ Implementare best practices moderne (App Router, Server Components)
6. ✅ Preparare base per integrazione Supabase (Fase 2)

### Non-Goals
- ❌ Implementare funzionalità business (Fase 3+)
- ❌ Configurare Supabase (Fase 2)
- ❌ Implementare autenticazione (Fase 2)
- ❌ Migrare dati dal sistema legacy (Fase 3+)
- ❌ Deploy in production (Fase 8)

## Decisions

### Decision 1: Next.js 14 App Router vs Pages Router

**Choice**: App Router (Next.js 14)

**Rationale**:
- App Router è il futuro di Next.js (raccomandato da Vercel)
- React Server Components per performance migliori
- Server Actions per mutazioni server-side senza API routes
- Migliore organizzazione con route groups
- Streaming SSR e Suspense boundaries
- Migliore integrazione con Supabase

**Alternatives considered**:
- Pages Router: più maturo ma deprecato, meno performante
- Remix: ottimo ma meno ecosistema e supporto

**Trade-offs**:
- ✅ Pro: Performance, DX, futuro-proof
- ❌ Con: Learning curve, meno esempi community

### Decision 2: Tailwind CSS vs CSS-in-JS

**Choice**: Tailwind CSS 3.4+

**Rationale**:
- Utility-first approach per sviluppo rapido
- Zero runtime overhead (vs styled-components)
- Ottima integrazione con shadcn/ui
- Design tokens facilmente configurabili
- Purge CSS automatico per bundle size ridotto
- Ampia adozione e community

**Alternatives considered**:
- styled-components: runtime overhead, bundle size maggiore
- CSS Modules: meno flessibile, più verboso
- Vanilla CSS: difficile da scalare

**Trade-offs**:
- ✅ Pro: Performance, DX, scalabilità
- ❌ Con: HTML più verboso, learning curve iniziale

### Decision 3: shadcn/ui vs Material-UI vs Chakra UI

**Choice**: shadcn/ui (Radix UI primitives)

**Rationale**:
- Componenti copiati nel progetto (no dipendenza esterna)
- Completamente customizzabili con Tailwind
- Accessibilità built-in (Radix UI)
- Headless components flessibili
- Nessun bundle size overhead
- Perfetta integrazione con design system custom

**Alternatives considered**:
- Material-UI: troppo opinionated, bundle size grande
- Chakra UI: buono ma meno flessibile di shadcn/ui
- Ant Design: design troppo specifico, difficile customizzare

**Trade-offs**:
- ✅ Pro: Flessibilità, performance, accessibilità
- ❌ Con: Meno componenti out-of-the-box, setup iniziale

### Decision 4: TypeScript Strict Mode

**Choice**: TypeScript strict mode abilitato

**Rationale**:
- Catch errori a compile-time
- Migliore autocomplete e IntelliSense
- Refactoring più sicuro
- Documentazione implicita tramite types
- Integrazione con Zod per runtime validation

**Alternatives considered**:
- TypeScript non-strict: più permissivo ma meno sicuro
- JavaScript: no type safety

**Trade-offs**:
- ✅ Pro: Type safety, DX, manutenibilità
- ❌ Con: Più verboso, learning curve

### Decision 5: Package Manager (npm vs yarn vs pnpm)

**Choice**: npm (default Next.js)

**Rationale**:
- Default in Next.js create-next-app
- Ampia compatibilità
- Lockfile standard (package-lock.json)
- Nessuna configurazione extra necessaria

**Alternatives considered**:
- yarn: più veloce ma meno standard
- pnpm: più efficiente ma meno adottato

**Trade-offs**:
- ✅ Pro: Semplicità, compatibilità
- ❌ Con: Leggermente più lento di pnpm

## Technical Architecture

### Folder Structure

```
comunimo-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: authentication
│   ├── (dashboard)/       # Route group: protected dashboard
│   ├── (admin)/           # Route group: admin area
│   ├── (public)/          # Route group: public pages
│   ├── api/               # API routes (webhooks, exports)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Global error
│   └── globals.css        # Global styles
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   ├── dashboard/         # Dashboard widgets
│   ├── tables/            # Data tables
│   └── shared/            # Shared components
│
├── lib/
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── api/               # API clients
│   └── constants/         # Constants
│
├── types/                 # TypeScript types
├── actions/               # Server Actions
├── public/                # Static assets
└── [config files]
```

### Design Tokens

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          'blue-dark': '#223f4a',
          'blue': '#1e88e5',
          'red': '#ff5252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // 4px base scale
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        // ...
      },
      screens: {
        'mobile': '640px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
    },
  },
}
```

## Risks / Trade-offs

### Risk 1: Next.js 14 App Router Stability
**Impact**: Medium
**Probability**: Low
**Mitigation**: 
- Usare versione stabile (14.2+)
- Seguire best practices documentate
- Testare approfonditamente

### Risk 2: Learning Curve per Team
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Documentazione dettagliata
- Pair programming
- Code review rigorosi
- Training sessions

### Risk 3: Incompatibilità Dipendenze
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Usare versioni specifiche testate
- Lockfile committato
- Dependency audit regolari

### Risk 4: Performance Regression
**Impact**: High
**Probability**: Low
**Mitigation**:
- Lighthouse audit continui
- Performance budgets
- Monitoring Core Web Vitals

## Migration Plan

### Phase 1: Setup (Current)
1. Creare nuovo progetto Next.js
2. Configurare tooling e design system
3. Stabilire struttura cartelle
4. Documentare setup

### Phase 2: Supabase Integration (Next)
1. Setup Supabase client
2. Configurare autenticazione
3. Implementare RLS policies
4. Testare connessione database

### Phase 3+: Feature Implementation
1. Implementare features incrementalmente
2. Parallel run con sistema legacy
3. Migrazione dati graduale
4. Cutover finale

### Rollback Plan
Non applicabile per Fase 1 (nuovo progetto). Per fasi successive:
- Mantenere sistema legacy attivo
- Feature flags per gradual rollout
- Database backup prima di ogni migrazione
- Possibilità di rollback a sistema legacy

## Open Questions

1. **Q**: Quale versione di Node.js targetizzare?
   **A**: Node.js 18+ LTS (compatibile con Vercel)

2. **Q**: Supportare dark mode da subito?
   **A**: Sì, configurare in Tailwind (nice-to-have per MVP)

3. **Q**: Usare Turbopack o Webpack?
   **A**: Webpack (default Next.js 14, più stabile)

4. **Q**: Configurare i18n da subito?
   **A**: No, solo italiano per MVP (future enhancement)

5. **Q**: Quale strategia di caching per React Query?
   **A**: Configurare in Fase 2 con Supabase integration

## Success Metrics

### Technical Metrics
- ✅ Build time < 2 minuti
- ✅ Zero errori TypeScript
- ✅ Zero warning ESLint
- ✅ Lighthouse score > 80 (tutte le categorie)
- ✅ Bundle size < 500KB (initial load)

### Developer Experience Metrics
- ✅ Setup time < 30 minuti (da zero a dev server)
- ✅ Hot reload < 1 secondo
- ✅ Documentazione completa e chiara

### Quality Metrics
- ✅ Code coverage > 80% (fasi successive)
- ✅ Accessibility score > 95
- ✅ SEO score > 90

