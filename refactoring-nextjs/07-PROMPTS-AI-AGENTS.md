# Prompts per AI Agents - ComUniMo Next.js

## 📖 Come Usare Questi Prompts

Ogni prompt è progettato per essere copiato e incollato direttamente nel tuo AI agent (GitHub Copilot, Cursor, Claude, ChatGPT, ecc.) per ottenere codice funzionante.

**Istruzioni**:
1. Copia il prompt completo
2. Sostituisci `[PLACEHOLDER]` con valori reali
3. Incolla nell'AI agent
4. Rivedi e testa il codice generato

---

## 🚀 FASE 1: Setup Iniziale

### Prompt 1.1: Creare Progetto Next.js

```
Devo creare un nuovo progetto Next.js 14 per un'applicazione di gestione iscrizioni sportive chiamata "ComUniMo".

Requisiti:
- Next.js 14 con App Router
- TypeScript strict mode
- Tailwind CSS con custom config
- ESLint e Prettier configurati
- Husky per pre-commit hooks
- Struttura cartelle enterprise-ready

Crea:
1. Comando setup completo
2. next.config.js ottimizzato
3. tailwind.config.ts con design tokens
4. .eslintrc.json e .prettierrc
5. tsconfig.json con path aliases
6. package.json con tutti gli script
7. Struttura cartelle completa

Design System:
- Colori primari: #223f4a (blue-dark), #1e88e5 (blue), #ff5252 (red)
- Font: Inter per UI, system fonts fallback
- Breakpoints: mobile (640px), tablet (768px), desktop (1024px), wide (1280px)
- Spacing scale: 4px base
```

### Prompt 1.2: Setup Supabase Client

```
Configura Supabase per Next.js 14 App Router con autenticazione.

Crea questi file:

1. lib/supabase/client.ts - Client-side Supabase client
2. lib/supabase/server.ts - Server-side Supabase client (cookies)
3. lib/supabase/middleware.ts - Middleware helpers
4. middleware.ts - Next.js middleware per auth
5. app/auth/callback/route.ts - OAuth callback

Requisiti:
- TypeScript strict
- Cookie-based auth
- Automatic token refresh
- Type-safe database queries
- Error handling

Environment variables necessarie:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
```

### Prompt 1.3: Setup shadcn/ui

```
Setup completo shadcn/ui con Tailwind CSS.

Installa e configura:
1. shadcn/ui init
2. components.json configuration
3. Installa questi componenti:
   - button
   - input
   - select
   - dialog
   - card
   - table
   - form
   - dropdown-menu
   - toast
   - tabs
   - calendar
   - checkbox
   - radio-group
   - label
   - badge
   - avatar
   - separator

Personalizza il tema con:
- Colori brand: primary (#223f4a), accent (#1e88e5), destructive (#ff5252)
- Border radius: 0.5rem
- Font: Inter

Crea anche:
- components/ui/loading.tsx - Loading spinner
- components/ui/error.tsx - Error message component
- components/ui/empty-state.tsx - Empty state component
```

---

## 🔐 FASE 2: Autenticazione

### Prompt 2.1: Pagine Auth

```
Crea il sistema di autenticazione completo con Supabase Auth.

File da creare:

1. app/(auth)/login/page.tsx
   - Form login con email/password
   - React Hook Form + Zod validation
   - Link a "Forgot password" e "Register"
   - Error handling
   - Redirect dopo login

2. app/(auth)/register/page.tsx
   - Form registrazione società
   - Campi: email, password, nome società, codice società
   - Validation robusta
   - Conferma password

3. app/(auth)/reset-password/page.tsx
   - Form per richiedere reset
   - Email di reset con Supabase

4. app/(auth)/layout.tsx
   - Layout centered per pagine auth
   - Hero image laterale
   - Responsive design

5. actions/auth.ts
   - Server Actions per login, register, logout, reset
   - Type-safe con Zod
   - Error handling

Stile:
- Form centered in card
- Blue gradient background
- Mobile responsive
- Loading states
- Error messages visibili
```

### Prompt 2.2: Middleware Protection

```
Implementa middleware Next.js per proteggere le routes.

File da creare:

1. middleware.ts
   - Verifica auth token da cookie
   - Redirect non-autenticati a /login
   - Redirect autenticati da /login a /dashboard
   - Role-based access control (admin vs società)
   - Protected paths:
     * /dashboard/* (società)
     * /admin/* (solo admin)

2. lib/auth/permissions.ts
   - Funzioni per check permessi
   - hasRole(userId, role)
   - canAccessResource(userId, resourceId)
   - isAdmin(userId)

3. lib/auth/session.ts
   - getServerSession() helper
   - getUserProfile() helper
   - requireAuth() helper (throw se non autenticato)

Gestisci:
- Auth token refresh automatico
- Expired token handling
- Invalid token handling
```

### Prompt 2.3: User Context & Hooks

```
Crea context e hooks per gestire lo stato utente globale.

File da creare:

1. lib/contexts/user-context.tsx
   - UserContext con React Context
   - UserProvider component
   - State: user, profile, loading, error

2. lib/hooks/use-user.ts
   - Hook per accedere user context
   - Auto-refresh user data
   - Type-safe

3. lib/hooks/use-auth.ts
   - login(email, password)
   - logout()
   - register(data)
   - resetPassword(email)
   - updateProfile(data)

4. components/auth/require-auth.tsx
   - HOC per proteggere components
   - Loading state mentre verifica auth
   - Redirect se non autenticato

Esempio uso:
```tsx
const { user, profile, loading } = useUser();
const { login, logout } = useAuth();
```
```

---

## 👥 FASE 3: Gestione Società

### Prompt 3.1: CRUD Società (Admin)

```
Implementa il sistema CRUD completo per società sportive (area admin).

File da creare:

1. app/admin/societa/page.tsx
   - Data table con tutte le società
   - Colonne: cod_societa, denominazione, email, telefono, status, actions
   - Search e filters
   - Pagination
   - Actions: Edit, Delete, View Details

2. app/admin/societa/nuova/page.tsx
   - Form creazione società
   - Campi completi (vedi database schema)
   - Upload logo (Supabase Storage)
   - Validation con Zod

3. app/admin/societa/[id]/page.tsx
   - Dettaglio società
   - Tabs: Info, Atleti, Iscrizioni, Pagamenti
   - Stats cards
   - Recent activity

4. app/admin/societa/[id]/modifica/page.tsx
   - Form modifica società
   - Pre-filled con dati esistenti
   - Update logo

5. lib/api/societa.ts
   - getSocieta(id)
   - getAllSocieta(filters)
   - createSocieta(data)
   - updateSocieta(id, data)
   - deleteSocieta(id)
   - React Query hooks

6. components/societa/societa-form.tsx
   - Reusable form component
   - React Hook Form + Zod
   - Field validations

7. types/societa.ts
   - TypeScript interfaces
   - Zod schemas
   - Form types

Stile:
- Tabella con shadcn/ui
- Form con sezioni collapsibili
- Mobile responsive
- Loading skeletons
```

### Prompt 3.2: Dashboard Società

```
Crea la dashboard per le società sportive.

File da creare:

1. app/(dashboard)/page.tsx
   - Homepage dashboard società
   - Stats cards: totale atleti, iscrizioni attive, prossime gare, pagamenti
   - Grafici: iscrizioni trend, atleti per categoria
   - Recent activity feed
   - Quick actions: Aggiungi atleta, Nuova iscrizione

2. app/(dashboard)/layout.tsx
   - Layout con sidebar sinistra
   - Top navbar con user menu
   - Breadcrumbs
   - Mobile: hamburger menu

3. components/dashboard/stats-card.tsx
   - Card riutilizzabile per stats
   - Icon, title, value, change %
   - Color variants

4. components/dashboard/charts/iscrizioni-chart.tsx
   - Line chart iscrizioni mensili (Recharts)
   - Filtri per anno
   - Responsive

5. components/dashboard/activity-feed.tsx
   - Lista ultime attività
   - Icone per tipo attività
   - Timestamp relativo

6. components/layout/sidebar.tsx
   - Navigation menu
   - Icons (lucide-react)
   - Active state
   - Collapsible on mobile

7. components/layout/navbar.tsx
   - User avatar + dropdown
   - Notifications icon
   - Breadcrumbs
   - Mobile menu toggle

Colori:
- Stats cards con gradient sottile
- Charts con colori brand
- Sidebar dark (#223f4a)
```

---

## 🏃 FASE 4: Gestione Atleti

### Prompt 4.1: CRUD Atleti

```
Implementa gestione completa atleti.

File da creare:

1. app/(dashboard)/atleti/page.tsx
   - Data table atleti società
   - Colonne: nome, cognome, codice fiscale, data nascita, categoria, status
   - Search full-text
   - Filters: categoria, status, anno
   - Bulk actions: Export, Delete
   - Button "Nuovo Atleta"

2. app/(dashboard)/atleti/nuovo/page.tsx
   - Form creazione atleta completo
   - Auto-calcolo categoria da data nascita
   - Validation codice fiscale
   - Upload foto (opzionale)

3. app/(dashboard)/atleti/[id]/page.tsx
   - Dettaglio atleta
   - Tabs: Anagrafica, Certificati, Iscrizioni, Storico
   - Edit button
   - Timeline attività

4. app/(dashboard)/atleti/[id]/modifica/page.tsx
   - Form modifica atleta
   - Pre-filled data

5. lib/api/atleti.ts
   - getAtleti(filters, pagination)
   - getAtleta(id)
   - createAtleta(data)
   - updateAtleta(id, data)
   - deleteAtleta(id)
   - calcolaCategoria(dataNascita)
   - validateCodiceFiscale(cf)
   - React Query hooks con optimistic updates

6. components/atleti/atleta-form.tsx
   - Form completo con sezioni
   - Anagrafica, Contatti, Documenti
   - Calcolo automatico categoria
   - Validation real-time

7. components/atleti/atleti-table.tsx
   - Data table riutilizzabile
   - Sorting multi-column
   - Filters UI
   - Pagination
   - Export CSV

8. types/atleta.ts
   - Interfaces TypeScript
   - Zod schemas
   - Enums (Categoria, Status, Sesso)

Validazioni:
- Codice fiscale: algoritmo italiano
- Email: format validation
- Telefono: format validation
- Data nascita: range valido (3-100 anni)
```

### Prompt 4.2: Import/Export Atleti

```
Implementa import CSV e export Excel atleti.

File da creare:

1. app/(dashboard)/atleti/import/page.tsx
   - Upload CSV file
   - Drag & drop zone
   - Preview dati importati
   - Validation errors highlighting
   - Conferma import

2. app/api/atleti/import/route.ts
   - POST endpoint
   - Parse CSV (Papa Parse)
   - Validate ogni riga
   - Bulk insert con transaction
   - Return summary (success, errors)

3. app/api/atleti/export/route.ts
   - GET endpoint con filters
   - Generate Excel (exceljs)
   - Headers personalizzabili
   - Return file stream

4. lib/utils/csv-parser.ts
   - parseAtletiCSV(file)
   - validateAtletaRow(row)
   - mapCSVToAtleta(row)

5. lib/utils/excel-generator.ts
   - generateAtletiExcel(atleti, options)
   - Custom formatting
   - Multiple sheets se necessario

6. components/atleti/import-wizard.tsx
   - Step 1: Upload
   - Step 2: Map columns
   - Step 3: Preview & validate
   - Step 4: Confirm & import
   - Progress indicator

CSV Format atteso:
- Headers: cognome, nome, codice_fiscale, data_nascita, sesso, email, telefono
- Encoding: UTF-8
- Delimiter: comma o semicolon

Excel Output:
- Formattato con headers bold
- Filtri attivi
- Freeze first row
```

### Prompt 4.3: Certificati Medici

```
Gestione certificati medici atleti.

File da creare:

1. app/(dashboard)/atleti/[id]/certificati/page.tsx
   - Lista certificati atleta
   - Badge scadenza (valido/scaduto/in_scadenza)
   - Upload nuovo certificato
   - Download certificato

2. app/(dashboard)/certificati/page.tsx
   - Vista completa certificati società
   - Filters: scadenza, tipo, atleta
   - Alert certificati in scadenza

3. components/certificati/upload-certificato.tsx
   - Upload PDF
   - Form metadata: tipo, numero, date
   - Validation file (PDF, max 5MB)

4. lib/api/certificati.ts
   - getCertificati(idAtleta)
   - uploadCertificato(idAtleta, file, metadata)
   - deleteCertificato(id)
   - getCertificatiInScadenza(giorni)

5. lib/utils/certificati-validator.ts
   - checkScadenza(dataScadenza)
   - isValid(certificato)
   - daysUntilExpiry(certificato)

Storage:
- Supabase Storage bucket: 'certificati'
- Path: /societa/{cod_soc}/atleti/{id_atleta}/{filename}
- RLS policies per privacy

Notifiche:
- Email automatica 30 giorni prima scadenza
- Badge dashboard per certificati scaduti
```

---

## 🏆 FASE 5: Gare e Iscrizioni

### Prompt 5.1: CRUD Gare (Admin)

```
Gestione completa gare (area admin).

File da creare:

1. app/admin/gare/page.tsx
   - Lista tutte le gare
   - Filters: data, tipo, status
   - Cards view con immagine
   - Quick actions: Edit, Duplicate, Publish

2. app/admin/gare/nuova/page.tsx
   - Form creazione gara multi-step
   - Step 1: Info base (nome, data, luogo)
   - Step 2: Dettagli (descrizione, regolamento)
   - Step 3: Specialità (aggiungi multiple)
   - Step 4: Iscrizioni (date, quote, posti)
   - Step 5: Review & Publish

3. app/admin/gare/[id]/page.tsx
   - Dettaglio gara completo
   - Tabs: Info, Specialità, Iscrizioni, Classifiche
   - Stats: totale iscritti, incasso, posti disponibili
   - Actions: Edit, Clone, Delete, Publish/Unpublish

4. app/admin/gare/[id]/specialita/page.tsx
   - Gestione specialità gara
   - Add/Remove specialità
   - Set quote e posti per specialità

5. lib/api/gare.ts
   - getGare(filters, pagination)
   - getGara(id)
   - createGara(data)
   - updateGara(id, data)
   - deleteGara(id)
   - publishGara(id)
   - duplicateGara(id)

6. lib/api/specialita.ts
   - getSpecialita(idGara)
   - createSpecialita(idGara, data)
   - updateSpecialita(id, data)
   - deleteSpecialita(id)

7. components/gare/gara-form.tsx
   - Multi-step form
   - Image upload
   - Rich text editor per descrizione
   - Date/time pickers

8. types/gara.ts
   - Interfaces
   - Zod schemas
   - Enums (TipoGara, StatusGara)

UI:
- Calendar view per date gare
- Map per location (Leaflet/Mapbox)
- Image gallery per evento
```

### Prompt 5.2: Calendario Gare Pubblico

```
Calendario gare pubblico con filters.

File da creare:

1. app/(public)/calendario/page.tsx
   - Grid view gare future
   - Card per gara: immagine, nome, data, luogo, CTA "Dettagli"
   - Filters sidebar: data, tipo, luogo, ente
   - Search full-text
   - Sorting: data, nome

2. app/(public)/calendario/[slug]/page.tsx
   - Dettaglio gara pubblico
   - Hero con immagine
   - Info: data, ora, luogo, descrizione
   - Sezione specialità disponibili
   - CTA "Iscriviti" (se loggato) o "Login per iscriverti"
   - Lista iscritti parziale (se pubblicata)
   - Download regolamento PDF
   - Share social buttons

3. components/calendario/gara-card.tsx
   - Card responsive
   - Badge status
   - Countdown se prossima
   - Lazy load image

4. components/calendario/filters-sidebar.tsx
   - Filters UI
   - Range date picker
   - Checkboxes per tipo
   - Location autocomplete
   - Clear filters button

5. lib/api/calendario.ts
   - getGarePubbliche(filters, sort, pagination)
   - getGaraPubblica(slug)
   - searchGare(query)

SEO:
- Meta tags dinamici per ogni gara
- Structured data (JSON-LD Event)
- OG image per social share
- Sitemap.xml con tutte le gare
```

### Prompt 5.3: Sistema Iscrizioni

```
Implementa il sistema di iscrizione gare.

File da creare:

1. app/(dashboard)/iscrizioni/nuova/page.tsx
   - Select gara disponibile
   - Select atleta/i società
   - Select specialità per ogni atleta
   - Review iscrizioni (totale, quote)
   - Button "Procedi al pagamento"

2. app/(dashboard)/iscrizioni/page.tsx
   - Lista tutte le iscrizioni società
   - Filters: gara, atleta, status pagamento
   - Actions: View, Edit, Cancel

3. app/(dashboard)/iscrizioni/[id]/page.tsx
   - Dettaglio iscrizione
   - Info atleta e gara
   - Status iscrizione e pagamento
   - Ricevuta download
   - Annullamento (se consentito)

4. lib/api/iscrizioni.ts
   - createIscrizione(data)
   - getIscrizioni(filters)
   - getIscrizione(id)
   - updateIscrizione(id, data)
   - cancelIscrizione(id)
   - checkPostiDisponibili(idSpecialita)

5. components/iscrizioni/iscrizione-wizard.tsx
   - Step 1: Select gara
   - Step 2: Select atleti
   - Step 3: Select specialità
   - Step 4: Review
   - Step 5: Payment
   - Progress indicator

6. components/iscrizioni/atleta-selector.tsx
   - Lista atleti società
   - Checkboxes multiple selection
   - Info quick: categoria, status certificato
   - Disable se certificato scaduto

7. types/iscrizione.ts
   - Interfaces
   - Zod schemas
   - Enums

Business Logic:
- Verifica posti disponibili before insert
- Verifica date iscrizione aperte
- Verifica certificato medico valido
- Lock posti durante checkout (10 min)
- Automatic release se payment timeout
```

---

## 💳 FASE 6: Pagamenti

### Prompt 6.1: Integrazione Stripe

```
Integra Stripe per pagamenti iscrizioni.

File da creare:

1. app/api/checkout/route.ts
   - POST endpoint
   - Create Stripe Checkout Session
   - Line items da iscrizioni
   - Success/Cancel URLs
   - Metadata: iscrizioni IDs

2. app/api/webhook/stripe/route.ts
   - POST endpoint webhook Stripe
   - Verify signature
   - Handle events:
     * checkout.session.completed
     * payment_intent.succeeded
     * payment_intent.payment_failed
   - Update iscrizioni status
   - Send confirmation email

3. app/(dashboard)/pagamenti/page.tsx
   - Lista pagamenti società
   - Filters: status, date
   - Download ricevute

4. app/(dashboard)/pagamenti/[id]/page.tsx
   - Dettaglio pagamento
   - Iscrizioni associate
   - Transaction details
   - Download ricevuta PDF

5. lib/stripe/client.ts
   - Initialize Stripe
   - createCheckoutSession(iscrizioni)
   - retrieveSession(sessionId)

6. lib/stripe/webhooks.ts
   - handleCheckoutCompleted(event)
   - handlePaymentSucceeded(event)
   - handlePaymentFailed(event)

7. lib/email/payment-confirmation.ts
   - Send confirmation email
   - Include ricevuta PDF
   - List iscrizioni details

8. components/pagamenti/checkout-button.tsx
   - Button "Procedi al pagamento"
   - Loading state
   - Redirect to Stripe Checkout

Environment variables:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Test:
- Use Stripe test mode
- Test cards: 4242424242424242
```

### Prompt 6.2: Ricevute PDF

```
Genera ricevute PDF per pagamenti.

File da creare:

1. app/api/ricevute/[id]/route.ts
   - GET endpoint
   - Retrieve payment data
   - Generate PDF (react-pdf/jsPDF)
   - Return PDF stream

2. lib/pdf/ricevuta-generator.ts
   - generateRicevutaPDF(payment, iscrizioni)
   - Template ricevuta:
     * Header con logo
     * Dati società
     * Dettaglio iscrizioni
     * Totale pagato
     * Footer con dati fiscali

3. components/pagamenti/download-ricevuta.tsx
   - Button download
   - Preview ricevuta
   - Loading state

Template ricevuta:
- Logo organizzazione top-left
- Numero ricevuta univoco
- Data pagamento
- Tabella iscrizioni: atleta, gara, specialità, importo
- Totale in bold
- Note legali in footer
- QR code per verifica (opzionale)
```

---

## 📊 FASE 7: Classifiche

### Prompt 7.1: Gestione Classifiche (Admin)

```
Sistema completo gestione classifiche.

File da creare:

1. app/admin/classifiche/page.tsx
   - Lista gare con classifiche
   - Status: da inserire, in lavorazione, pubblicate
   - Actions: Inserisci risultati, View, Publish

2. app/admin/classifiche/[garaId]/inserisci/page.tsx
   - Form inserimento risultati
   - Lista iscritti gara
   - Input: tempo, posizione, punti
   - Calcolo automatico posizioni
   - Bulk import da CSV
   - Save draft / Publish

3. app/admin/classifiche/[garaId]/page.tsx
   - Preview classifiche per categoria
   - Tabs per ogni specialità
   - Actions: Edit, Export PDF, Export Excel, Publish

4. lib/api/classifiche.ts
   - getClassifiche(garaId, filters)
   - createClassifica(garaId, risultati)
   - updateRisultato(iscrizioneId, data)
   - publishClassifica(garaId)
   - calcolaPosizioniAutomatiche(garaId)

5. components/classifiche/risultati-form.tsx
   - Table con input inline
   - Auto-save on blur
   - Validation tempi (format HH:MM:SS)
   - Calcolo velocità media

6. lib/utils/classifiche-calculator.ts
   - calcolaPosizioneAssoluta(risultati)
   - calcolaPosizioneCategoria(risultati, categoria)
   - calcolaPosizioneGender(risultati, sesso)
   - formatTempo(seconds)
   - parseTempo(string)

Business Logic:
- Ordinamento automatico per tempo
- Gestione ex-aequo
- Punti FIDAL/UISP se applicabili
- Validazione tempi realistici
```

### Prompt 7.2: Classifiche Pubbliche

```
Visualizzazione classifiche pubbliche.

File da creare:

1. app/(public)/classifiche/page.tsx
   - Lista gare con classifiche pubblicate
   - Filters: anno, tipo, ente
   - Cards gare

2. app/(public)/classifiche/[garaSlug]/page.tsx
   - Classifiche gara pubblicate
   - Tabs per specialità
   - Sub-tabs per categoria/sesso
   - Search atleta
   - Export PDF user
   - Share social

3. components/classifiche/classifica-table.tsx
   - Table responsive
   - Colonne: posizione, atleta, società, categoria, tempo, punti
   - Highlight own atleti se loggato
   - Sorting client-side

4. components/classifiche/filters.tsx
   - Filter UI per categoria
   - Filter per sesso
   - Filter per società
   - Search atleta

5. lib/api/classifiche-pubbliche.ts
   - getClassifichePubbliche()
   - getClassifica(garaSlug, filters)
   - searchAtletaInClassifica(garaSlug, query)

SEO:
- Meta tags per ogni classifica
- Structured data (SportsEvent results)
- OG tags per social
```

### Prompt 7.3: Export Classifiche PDF/Excel

```
Export classifiche in PDF e Excel.

File da creare:

1. app/api/classifiche/[garaId]/pdf/route.ts
   - GET endpoint
   - Generate PDF professionale
   - Headers: logo, nome gara, data
   - Table classifiche per categoria
   - Footer: data generazione

2. app/api/classifiche/[garaId]/excel/route.ts
   - GET endpoint
   - Generate Excel multi-sheet
   - Sheet per categoria
   - Formattazione celle
   - Charts se richiesto

3. lib/pdf/classifica-pdf.ts
   - generateClassificaPDF(gara, classifiche)
   - Template professionale
   - Pagination
   - Watermark opzionale

4. lib/excel/classifica-excel.ts
   - generateClassificaExcel(gara, classifiche)
   - Multiple sheets
   - Auto-filter headers
   - Conditional formatting
   - Charts

Features:
- Logo organizzazione in header
- Timestamp generazione
- Filtri applicati in metadata
- Watermark "UFFICIALE" se pubblicata
- QR code per verifica online
```

---

## 🎨 FASE 8: UI/UX Avanzata

### Prompt 8.1: Design System Components

```
Crea libreria componenti design system completa.

File da creare:

1. components/ui/data-table.tsx
   - Generic data table
   - Props: columns, data, pagination, filters, actions
   - Sorting multi-column
   - Column visibility toggle
   - Responsive: scroll horizontal on mobile

2. components/ui/file-upload.tsx
   - Drag & drop zone
   - Multiple files support
   - Progress indicator
   - File preview
   - Validation: type, size

3. components/ui/search-input.tsx
   - Input with search icon
   - Debounced onChange
   - Clear button
   - Loading state
   - Keyboard shortcuts (/)

4. components/ui/date-range-picker.tsx
   - Range selection
   - Presets: oggi, settimana, mese, anno
   - Clear button
   - Validation range

5. components/ui/stats-card.tsx
   - Reusable stats card
   - Props: title, value, icon, trend, color
   - Loading skeleton
   - Animation on mount

6. components/ui/empty-state.tsx
   - Props: icon, title, description, action
   - Consistent styling
   - Illustration opzionale

7. components/ui/confirmation-dialog.tsx
   - Alert dialog for dangerous actions
   - Props: title, description, onConfirm, onCancel
   - Variants: danger, warning, info

8. components/ui/page-header.tsx
   - Page title
   - Breadcrumbs
   - Actions slot
   - Back button
   - Responsive

Stile:
- Consistent spacing (design tokens)
- Smooth animations (Framer Motion)
- Focus states accessibili
- Dark mode support
```

### Prompt 8.2: Dashboard Charts

```
Implementa charts dashboard con Recharts.

File da creare:

1. components/dashboard/charts/iscrizioni-trend.tsx
   - Line chart iscrizioni mensili
   - Props: data, year filter
   - Tooltips custom
   - Responsive
   - Loading skeleton

2. components/dashboard/charts/atleti-categoria.tsx
   - Bar chart atleti per categoria
   - Horizontal bars
   - Colors per categoria
   - Percentuali

3. components/dashboard/charts/revenue-chart.tsx
   - Area chart incassi mensili
   - Gradient fill
   - Comparison anno precedente (opzionale)
   - Tooltips con currency format

4. components/dashboard/charts/gare-participation.tsx
   - Pie/Donut chart partecipazione società
   - Interactive: click per dettagli
   - Legend
   - Percentuali

5. lib/utils/chart-data.ts
   - formatChartData(rawData, type)
   - aggregateByMonth(data)
   - aggregateByCategory(data)
   - calculateTrend(current, previous)

Configurazione Recharts:
- Colors brand coerenti
- Responsive width/height
- Custom tooltips styled
- Animations smooth
- Accessibility (aria-labels)
```

### Prompt 8.3: Notifiche Real-time

```
Implementa sistema notifiche con Supabase Realtime.

File da creare:

1. lib/realtime/notifications.ts
   - Subscribe to notifications channel
   - Listen database changes
   - Emit events to React

2. components/notifications/notification-provider.tsx
   - Context provider
   - WebSocket connection management
   - Queue notifications
   - Auto-dismiss timer

3. components/notifications/notification-bell.tsx
   - Bell icon con badge count
   - Dropdown lista notifiche
   - Mark as read
   - Link to resource

4. components/notifications/toast.tsx
   - Toast notification UI
   - Variants: success, error, warning, info
   - Action button opzionale
   - Auto-dismiss

5. lib/api/notifications.ts
   - getNotifications(userId, filters)
   - markAsRead(notificationId)
   - markAllAsRead(userId)
   - createNotification(data)

6. Database:
   - Table `notifications` con RLS
   - Trigger per auto-create su eventi
   - Real-time subscription

Eventi da notificare:
- Nuova iscrizione confermata
- Pagamento ricevuto
- Certificato in scadenza
- Classifica pubblicata
- Messaggio admin
```

---

## 📱 FASE 9: Mobile & PWA

### Prompt 9.1: Progressive Web App

```
Trasforma l'app in PWA completa.

File da creare:

1. app/manifest.json
   - Nome app
   - Icons (192x192, 512x512)
   - Theme color
   - Background color
   - Display: standalone
   - Start URL

2. app/sw.js (Service Worker)
   - Cache strategies
   - Offline fallback
   - Cache API responses
   - Background sync

3. components/pwa/install-prompt.tsx
   - Banner install app
   - Detect if installable
   - Handle beforeinstallprompt
   - Dismiss option

4. lib/pwa/offline-storage.ts
   - IndexedDB wrapper
   - Store data offline
   - Sync when online

5. app/offline/page.tsx
   - Offline fallback page
   - Cached content view
   - "You're offline" message

Configurazione:
- next.config.js con PWA plugin
- Icons in multiple sizes
- Splash screens iOS
- Apple touch icons
```

### Prompt 9.2: Mobile Navigation

```
Ottimizza navigazione per mobile.

File da creare:

1. components/mobile/bottom-nav.tsx
   - Fixed bottom navigation
   - Icons: Home, Atleti, Gare, Profilo
   - Active state
   - Hide on scroll down, show on scroll up

2. components/mobile/mobile-menu.tsx
   - Hamburger menu
   - Drawer animation
   - Full height overlay
   - Close on route change

3. components/mobile/search-modal.tsx
   - Full-screen search su mobile
   - Quick search: atleti, gare, società
   - Recent searches
   - Keyboard-optimized

4. lib/hooks/use-mobile.ts
   - Detect mobile breakpoint
   - useIsMobile()
   - Responsive hook

5. lib/hooks/use-scroll-direction.ts
   - Detect scroll up/down
   - For hide/show bottom nav

Mobile-specific:
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures per actions
- Pull-to-refresh
- Haptic feedback (vibrate API)
```

---

## 🧪 FASE 10: Testing

### Prompt 10.1: Unit Tests

```
Crea unit tests completi con Jest e React Testing Library.

File da creare:

1. __tests__/lib/utils/validators.test.ts
   - Test validateCodiceFiscale()
   - Test validateEmail()
   - Test validateTelefono()
   - Test calcolaCategoria()

2. __tests__/components/ui/button.test.tsx
   - Test rendering variants
   - Test onClick handler
   - Test disabled state
   - Test loading state

3. __tests__/lib/api/atleti.test.ts
   - Mock Supabase client
   - Test getAtleti()
   - Test createAtleta()
   - Test updateAtleta()
   - Test deleteAtleta()

4. __tests__/components/forms/atleta-form.test.tsx
   - Test form validation
   - Test submit handler
   - Test error messages
   - Test success state

5. jest.config.js
   - Setup file
   - Transform files
   - Module name mapper

6. jest.setup.js
   - Mock Supabase
   - Mock Next.js router
   - Global test utilities

Coverage target: > 80%
```

### Prompt 10.2: E2E Tests

```
Implementa E2E tests con Playwright.

File da creare:

1. e2e/auth.spec.ts
   - Test login flow
   - Test logout
   - Test protected routes redirect
   - Test invalid credentials

2. e2e/atleti.spec.ts
   - Test create atleta
   - Test edit atleta
   - Test delete atleta
   - Test search atleta

3. e2e/iscrizioni.spec.ts
   - Test complete iscrizione flow
   - Test select gara
   - Test select atleti
   - Test payment redirect

4. e2e/admin.spec.ts
   - Test admin dashboard
   - Test gara creation
   - Test classifiche insertion
   - Test publish classifica

5. playwright.config.ts
   - Base URL
   - Browsers: chromium, firefox, webkit
   - Screenshots on failure
   - Video on failure

6. e2e/fixtures/auth.ts
   - Authenticated user fixture
   - Admin user fixture
   - Test data setup

Run:
```bash
npx playwright test
npx playwright test --ui
npx playwright codegen
```
```

---

## 🚀 FASE 11: Deploy & Monitoring

### Prompt 11.1: Vercel Deployment

```
Setup completo deployment Vercel.

File da creare:

1. vercel.json
   - Build command
   - Output directory
   - Environment variables
   - Redirects
   - Headers (security)
   - Regions

2. .github/workflows/vercel-deploy.yml
   - Trigger on push to main
   - Build & test
   - Deploy to Vercel
   - Comment PR with preview URL

3. scripts/pre-deploy.sh
   - Run tests
   - Check TypeScript
   - Check ESLint
   - Build production

4. scripts/post-deploy.sh
   - Run smoke tests
   - Notify team (Slack/Discord)
   - Update status page

Environment variables da configurare:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY (email)

Vercel settings:
- Enable Vercel Analytics
- Enable Speed Insights
- Enable Web Vitals monitoring
- Configure custom domain
- Setup SSL certificate
```

### Prompt 11.2: Monitoring Setup

```
Implementa monitoring completo.

File da creare:

1. lib/monitoring/sentry.ts
   - Initialize Sentry
   - Capture exceptions
   - Capture messages
   - Set user context
   - Breadcrumbs

2. lib/monitoring/analytics.ts
   - Track page views
   - Track events
   - Track conversions
   - User properties

3. lib/monitoring/performance.ts
   - Measure Core Web Vitals
   - Report to analytics
   - Custom metrics

4. app/api/health/route.ts
   - Health check endpoint
   - Check database connection
   - Check external services
   - Return status

5. app/api/metrics/route.ts
   - Expose metrics
   - Format Prometheus (opzionale)

6. components/error-boundary.tsx
   - Catch React errors
   - Send to Sentry
   - Show fallback UI
   - Retry option

Sentry setup:
- Create Sentry project
- Get DSN
- Environment variables
- Source maps upload

Dashboards:
- Errors by route
- Performance by page
- User sessions
- API response times
```

---

## 📚 FASE 12: Documentazione

### Prompt 12.1: Documentazione Utente

```
Crea documentazione completa per utenti.

File da creare (in /docs):

1. docs/user/getting-started.md
   - Come registrarsi
   - Come fare login
   - Primo accesso
   - Setup profilo società

2. docs/user/gestione-atleti.md
   - Come aggiungere atleta
   - Come modificare atleta
   - Come eliminare atleta
   - Import CSV atleti
   - Gestione certificati

3. docs/user/iscrizioni.md
   - Come iscrivere atleta a gara
   - Come pagare iscrizioni
   - Come annullare iscrizione
   - Storico iscrizioni

4. docs/user/classifiche.md
   - Come visualizzare classifiche
   - Come cercare atleta
   - Come scaricare PDF

5. docs/user/faq.md
   - Domande frequenti
   - Troubleshooting comuni
   - Contatti supporto

Formato:
- Markdown con screenshots
- Video tutorial embed
- Step-by-step guides
- Searchable
```

### Prompt 12.2: Documentazione Tecnica

```
Documentazione per sviluppatori.

File da creare:

1. README.md (root)
   - Project overview
   - Tech stack
   - Setup instructions
   - Development workflow
   - Contributing guidelines

2. docs/tech/architecture.md
   - System architecture diagram
   - Database schema
   - API structure
   - Authentication flow

3. docs/tech/api-reference.md
   - All API endpoints
   - Request/Response examples
   - Error codes
   - Rate limiting

4. docs/tech/database.md
   - Database schema detailed
   - Relationships
   - Indexes
   - RLS policies
   - Migrations guide

5. docs/tech/deployment.md
   - Deployment process
   - Environment setup
   - CI/CD pipeline
   - Rollback procedure

6. docs/tech/testing.md
   - Testing strategy
   - How to run tests
   - Writing new tests
   - Coverage reports

Auto-generate:
- API docs from TypeScript types (TypeDoc)
- Database docs from schema
- Component docs (Storybook opzionale)
```

---

## 🎓 Tips per Usare i Prompts

### Best Practices

1. **Contestualizza sempre**
   - Includi info sul progetto
   - Specifica framework e versioni
   - Menziona design system in uso

2. **Sii specifico**
   - Elenca tutti i requisiti
   - Fornisci esempi di input/output
   - Specifica edge cases

3. **Richiedi testing**
   - Chiedi sempre codice testabile
   - Richiedi test unitari
   - Valida edge cases

4. **Iterazione**
   - Parti dal codice generato
   - Chiedi miglioramenti specifici
   - Refactoring incrementale

5. **Documentazione**
   - Chiedi commenti nel codice
   - JSDoc per funzioni
   - README per moduli

### Esempio Prompt Completo

```
Crea il componente AtletaForm per Next.js 14 con TypeScript.

Contesto:
- App di gestione iscrizioni sportive
- Design system: shadcn/ui + Tailwind
- Form library: React Hook Form + Zod
- API: Supabase

Requisiti:
1. Form multi-sezione (Anagrafica, Contatti, Documenti)
2. Campi: [lista completa campi]
3. Validazioni: [lista validazioni]
4. Auto-calcolo categoria da data nascita
5. Upload foto profilo
6. Loading states
7. Error handling
8. Success callback

Features extra:
- Salvataggio draft automatico
- Confirmation dialog se unsaved changes
- Mobile responsive
- Accessibility (ARIA labels)

Stile:
- Card con sezioni collapsibili
- Fields con icons
- Button primary per submit
- Toast per feedback

Output atteso:
1. components/atleti/atleta-form.tsx
2. lib/schemas/atleta-schema.ts (Zod)
3. types/atleta.ts
4. Breve README del componente
```

---

**Fine Prompts AI Agents**

Per ogni fase, segui l'ordine e personalizza i prompts con i tuoi dettagli specifici!
