# Quick Start Guide - ComUniMo Refactoring

## 🚀 Inizia Subito

### Prerequisiti

Assicurati di avere installato:
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Git** ([download](https://git-scm.com/))
- **Visual Studio Code** (consigliato) o altro editor
- **Account Supabase** (gratuito) - [supabase.com](https://supabase.com)
- **Account Vercel** (gratuito) - [vercel.com](https://vercel.com)
- **Account Stripe** (test mode) - [stripe.com](https://stripe.com)

### Step 1: Setup Progetto (30 minuti)

```bash
# 1. Crea progetto Next.js
npx create-next-app@latest comunimo-next
# Seleziona: TypeScript ✓, ESLint ✓, Tailwind ✓, App Router ✓, src directory ✗

cd comunimo-next

# 2. Installa dipendenze principali
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query react-hook-form zod
npm install date-fns recharts lucide-react

# 3. Installa dipendenze dev
npm install -D @types/node prettier eslint-config-prettier

# 4. Setup shadcn/ui
npx shadcn-ui@latest init

# 5. Installa componenti shadcn/ui base
npx shadcn-ui@latest add button input card table dialog form select toast
```

### Step 2: Configurazione Supabase (20 minuti)

1. **Crea progetto su** [supabase.com](https://supabase.com)
   - Nome: `comunimo-production`
   - Region: Europe (West) - Ireland
   - Database password: (genera sicura)

2. **Ottieni credenziali**
   - Vai su Settings → API
   - Copia: `Project URL` e `anon public key`

3. **Configura environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Applica schema database**
   ```bash
   # Installa Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link progetto
   supabase link --project-ref your-project-ref
   
   # Crea migration
   # Copia lo schema da: 03-DATABASE-MIGRATION.md
   supabase db push
   ```

### Step 3: Configurazione Vercel (15 minuti)

1. **Connetti GitHub**
   - Vai su [vercel.com](https://vercel.com)
   - Import Git Repository
   - Seleziona il tuo repo

2. **Configura environment variables**
   - Aggiungi tutte le variabili da `.env.local`
   - Include anche:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

3. **Deploy**
   - Vercel farà il primo deploy automaticamente
   - Ogni push su `main` trigghera un nuovo deploy

### Step 4: Struttura Iniziale (45 minuti)

Usa il prompt AI per generare la struttura base:

```
Crea la struttura completa del progetto Next.js 14 per ComUniMo.

Requisiti:
- App Router con TypeScript
- Supabase per auth e database
- shadcn/ui per componenti
- Tailwind CSS custom config
- Struttura cartelle enterprise-ready

Crea:
1. Configurazione completa (next.config.js, tailwind.config.ts, tsconfig.json)
2. Struttura cartelle app/ completa
3. lib/ con utility e clients Supabase
4. components/ con layout base
5. types/ con interfaces principali
6. middleware.ts per auth protection

Design tokens:
- Primary: #223f4a
- Accent: #1e88e5  
- Success: #4caf50
- Error: #ff5252

Includi:
- Loading states
- Error boundaries
- Not found pages
```

### Step 5: Prima Feature - Autenticazione (2-3 ore)

Usa i prompts da `07-PROMPTS-AI-AGENTS.md` sezione "FASE 2: Autenticazione":

1. **Crea pagine auth** (Prompt 2.1)
2. **Implementa middleware** (Prompt 2.2)
3. **User context & hooks** (Prompt 2.3)

Test:
```bash
npm run dev
# Vai su http://localhost:3000/login
# Prova registrazione e login
```

### Step 6: Dashboard Base (2-3 ore)

Usa i prompts da "FASE 3: Gestione Società":

1. **Crea layout dashboard** (Prompt 3.2)
2. **Implementa homepage dashboard** (Prompt 3.2)
3. **Aggiungi navigation e sidebar**

### Step 7: Prima Feature Completa - Atleti (1 giorno)

Usa i prompts da "FASE 4: Gestione Atleti":

1. **CRUD atleti** (Prompt 4.1)
2. **Import/Export** (Prompt 4.2)
3. **Test manuale completo**

---

## 📋 Checklist Sviluppo

### Week 1-2: Foundation
- [ ] Progetto Next.js creato
- [ ] Supabase configurato
- [ ] Vercel connesso
- [ ] shadcn/ui setup
- [ ] Struttura cartelle creata
- [ ] Design system configurato
- [ ] CI/CD pipeline attivo

### Week 3-4: Authentication & Layout
- [ ] Sistema login/register
- [ ] Middleware protezione routes
- [ ] User context implementato
- [ ] Layout dashboard responsive
- [ ] Navigation menu funzionante
- [ ] Mobile menu implementato

### Week 5-6: Società & Profili
- [ ] CRUD società (admin)
- [ ] Dashboard società
- [ ] Profilo società editabile
- [ ] Upload logo
- [ ] Stats cards funzionanti

### Week 7-8: Atleti
- [ ] CRUD atleti completo
- [ ] Data table con search/filters
- [ ] Import CSV atleti
- [ ] Export Excel atleti
- [ ] Gestione certificati medici
- [ ] Alert scadenze

### Week 9-10: Gare
- [ ] CRUD gare (admin)
- [ ] Gestione specialità
- [ ] Calendario gare pubblico
- [ ] Dettaglio gara
- [ ] Filters e search

### Week 11-12: Iscrizioni & Pagamenti
- [ ] Wizard iscrizione
- [ ] Selezione atleti multi
- [ ] Verifica posti
- [ ] Integrazione Stripe
- [ ] Webhook handler
- [ ] Ricevute PDF
- [ ] Email conferma

### Week 13-14: Classifiche & Admin
- [ ] Import risultati
- [ ] Calcolo classifiche
- [ ] Pubblicazione classifiche
- [ ] Classifiche pubbliche
- [ ] Export PDF/Excel
- [ ] Dashboard admin avanzata
- [ ] Report e analytics

### Week 15-16: CMS, Testing & Launch
- [ ] CMS contenuti
- [ ] Editor rich text
- [ ] Sistema email
- [ ] Sistema notifiche
- [ ] Unit tests > 80%
- [ ] E2E tests critici
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Security review
- [ ] Deploy production

---

## 🎯 Priorità di Implementazione

### P0 - Critical (Must Have per MVP)
1. ✅ Autenticazione
2. ✅ CRUD Atleti
3. ✅ CRUD Gare
4. ✅ Sistema Iscrizioni
5. ✅ Pagamenti Stripe
6. ✅ Classifiche Base

### P1 - High (Subito dopo MVP)
1. ⭐ Import/Export dati
2. ⭐ Certificati medici
3. ⭐ Email notifications
4. ⭐ Dashboard admin completa

### P2 - Medium (Nice to Have)
1. 🔵 CMS contenuti
2. 🔵 SMS notifications
3. 🔵 Analytics avanzate
4. 🔵 QR code check-in

### P3 - Low (Future)
1. ⚪ Mobile app nativa
2. ⚪ API pubblica
3. ⚪ Multi-tenant
4. ⚪ Chat support

---

## 🛠️ Tools Raccomandati

### VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Browser Extensions
- **React Developer Tools** - Debug React components
- **Redux DevTools** - Debug React Query (se usato)
- **Lighthouse** - Performance audit
- **axe DevTools** - Accessibility testing

### CLI Tools
```bash
# Supabase CLI
npm install -g supabase

# Vercel CLI
npm install -g vercel

# TypeScript
npm install -g typescript

# ESLint
npm install -g eslint
```

---

## 📚 Risorse Utili

### Documentazione
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

### Tutorial Video
- [Next.js 14 Full Course](https://www.youtube.com/results?search_query=nextjs+14+tutorial)
- [Supabase + Next.js](https://www.youtube.com/results?search_query=supabase+nextjs)
- [shadcn/ui Tutorial](https://www.youtube.com/results?search_query=shadcn+ui+tutorial)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [r/nextjs Reddit](https://reddit.com/r/nextjs)

### Code Examples
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)

---

## 🤝 Workflow Consigliato

### Daily
1. **Mattina**: Review PRs, planning day
2. **Sviluppo**: Focus su 1-2 features
3. **Pomeriggio**: Testing, debugging
4. **Fine giornata**: Commit, push, update docs

### Weekly
1. **Lunedì**: Sprint planning
2. **Mercoledì**: Mid-week review
3. **Venerdì**: Sprint review, retrospettiva
4. **Weekend**: Deploy su staging, testing

### Best Practices
- ✅ Commit piccoli e frequenti
- ✅ Branch per feature (`feature/nome-feature`)
- ✅ PR con descrizione dettagliata
- ✅ Code review obbligatoria
- ✅ Test prima di merge
- ✅ Deploy incrementali

---

## 🐛 Troubleshooting Comuni

### Supabase Connection Error
```typescript
// Verifica env variables
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL); // Non deve essere undefined

// Verifica Supabase client
const supabase = createClient();
const { data, error } = await supabase.from('test').select('*');
console.log({ data, error });
```

### TypeScript Errors
```bash
# Regenera types da Supabase
supabase gen types typescript --project-id your-id > types/database.ts

# Check TypeScript
npx tsc --noEmit
```

### Build Errors Vercel
```bash
# Test build locally
npm run build

# Check logs su Vercel dashboard
# Verifica environment variables
```

### Slow Queries
```sql
-- Aggiungi indexes
CREATE INDEX idx_atleti_societa ON atleti(cod_societa);
CREATE INDEX idx_iscrizioni_gara ON iscrizioni(id_gara);

-- Usa EXPLAIN
EXPLAIN ANALYZE SELECT * FROM atleti WHERE cod_societa = 'X';
```

---

## 🎉 Next Steps

1. **Leggi tutti i documenti** in `/refactoring-nextjs/`
2. **Setup environment** seguendo questa guida
3. **Inizia con Sprint 1** (Setup & Infrastruttura)
4. **Usa i prompts AI** per generare codice
5. **Testa frequentemente** ogni feature
6. **Deploy spesso** su staging
7. **Chiedi aiuto** nella community se blocchi

### Contatti
- **Email**: dev@comitatounitariomodena.eu
- **GitHub Issues**: Per bug e feature requests
- **Discord/Slack**: Per discussioni real-time

---

**Buon lavoro! 🚀**

La refactoring è un'opportunità per creare qualcosa di moderno, scalabile e performante. 

Segui la documentazione, usa gli AI agents, e costruisci qualcosa di cui essere orgoglioso!
