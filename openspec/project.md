# Project Context

## Purpose
ComUniMo (Comitato Unitario Modena) è un'applicazione web per la gestione completa di iscrizioni sportive, gare, atleti e società sportive. Il progetto è in fase di refactoring completo da PHP/CodeIgniter a Next.js 14 + Supabase.

**Obiettivi principali:**
- Modernizzare lo stack tecnologico per migliorare performance e manutenibilità
- Migliorare l'esperienza utente con un design system moderno e responsive
- Implementare autenticazione sicura e gestione permessi granulare
- Fornire dashboard intuitive per società sportive e amministratori
- Automatizzare processi di iscrizione, pagamento e gestione classifiche

## Tech Stack

### Frontend
- **Next.js 14.2+** (App Router, React Server Components, Server Actions)
- **React 18.3+** (Concurrent Features, Suspense)
- **TypeScript 5.3+** (strict mode)
- **Tailwind CSS 3.4+** (utility-first styling)
- **shadcn/ui** (Radix UI primitives, accessibili di default)
- **Framer Motion** (animazioni fluide)
- **React Hook Form + Zod** (forms e validazione)
- **TanStack Query v5** (server state management)
- **Recharts** (data visualization)

### Backend
- **Supabase** (Backend as a Service)
  - PostgreSQL 15+ (database relazionale)
  - Auth (JWT, Row Level Security)
  - Storage (file uploads, CDN)
  - Realtime (subscriptions, presence)
  - Edge Functions (Deno runtime)
- **Next.js API Routes** (webhooks, export/import)
- **Server Actions** (form submissions, mutations)

### DevOps & Tools
- **Vercel** (hosting, CI/CD, edge network)
- **GitHub Actions** (workflow automation)
- **ESLint + Prettier** (code quality)
- **Husky** (git hooks)
- **Jest + React Testing Library** (unit tests)
- **Playwright** (E2E tests)

## Project Conventions

### Code Style
- **TypeScript strict mode** obbligatorio
- **ESLint** con configurazione Next.js + TypeScript
- **Prettier** per formatting automatico
- **Naming conventions:**
  - Components: PascalCase (es. `AtletaForm.tsx`)
  - Files: kebab-case (es. `use-atleti.ts`)
  - Functions: camelCase (es. `getAtleti()`)
  - Constants: UPPER_SNAKE_CASE (es. `MAX_FILE_SIZE`)
  - Types/Interfaces: PascalCase (es. `Atleta`, `IscrizioneData`)

### Architecture Patterns
- **App Router** di Next.js 14 con route groups
- **Server Components** di default, Client Components solo quando necessario
- **Server Actions** per mutazioni server-side
- **React Query** per caching e gestione stato server
- **Zod schemas** per validazione runtime e type inference
- **Row Level Security (RLS)** in Supabase per authorization a livello database
- **Middleware** Next.js per protezione routes e RBAC

### Testing Strategy
- **Unit tests** (Jest + React Testing Library): > 80% coverage
- **Integration tests**: API routes, Server Actions, database queries
- **E2E tests** (Playwright): critical user flows
- **Visual regression tests**: componenti UI (opzionale)
- **Performance tests**: Core Web Vitals monitoring

### Git Workflow
- **Branching strategy:**
  - `main` → production
  - `staging` → pre-production
  - `develop` → development
  - `feature/*` → feature branches
- **Commit convention:** Conventional Commits
  - `feat:` nuova funzionalità
  - `fix:` bug fix
  - `docs:` documentazione
  - `style:` formatting
  - `refactor:` code refactoring
  - `test:` aggiungere test
  - `chore:` manutenzione
- **PR process:** code review obbligatorio, CI deve passare

## Domain Context

### Entità Principali
- **Società Sportive**: organizzazioni che gestiscono atleti e iscrizioni
- **Atleti**: persone iscritte tramite società, con certificati medici
- **Gare**: eventi sportivi con specialità e posti limitati
- **Iscrizioni**: registrazioni di atleti a gare specifiche
- **Classifiche**: risultati gare con posizioni e tempi
- **Certificati Medici**: documenti obbligatori per partecipazione

### Ruoli Utente
- **Admin**: super admin con accesso completo
- **Società**: gestione propri atleti, iscrizioni, pagamenti
- **Readonly**: visualizzazione dati (opzionale)

### Business Rules
- Certificato medico valido obbligatorio per iscrizione
- Posti limitati per gara/specialità (gestione concorrenza)
- Pagamenti tramite gateway (Stripe/PayPal)
- Calcolo automatico categoria atleta da data nascita
- Validazione codice fiscale italiano

## Important Constraints

### Technical
- **Performance**: Lighthouse score > 90 tutte le categorie
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: RLS policies rigorose, input validation, rate limiting
- **Browser support**: Chrome, Firefox, Safari, Edge (ultime 2 versioni)
- **Mobile-first**: responsive design obbligatorio

### Business
- **Data privacy**: GDPR compliance per dati personali atleti
- **Uptime**: 99.9% availability target
- **Backup**: backup database giornalieri con retention 30 giorni
- **Migration**: parallel run con sistema legacy per 1 settimana

### Regulatory
- **Dati sensibili**: certificati medici, dati anagrafici atleti
- **Pagamenti**: PCI DSS compliance tramite gateway certificati
- **Email**: CAN-SPAM compliance per comunicazioni massive

## External Dependencies

### Services
- **Supabase Cloud**: database, auth, storage, realtime
- **Vercel**: hosting, edge network, serverless functions
- **Stripe/PayPal**: payment processing
- **Resend/SendGrid**: email transazionale
- **Twilio** (opzionale): SMS notifications

### APIs
- **FIDAL API** (opzionale): sincronizzazione dati federali
- **Google Maps API** (opzionale): geolocalizzazione gare

### Third-party Libraries
- Vedi Tech Stack per lista completa
- Tutte le dipendenze devono essere mantenute aggiornate
- Security audit regolari con `npm audit`
