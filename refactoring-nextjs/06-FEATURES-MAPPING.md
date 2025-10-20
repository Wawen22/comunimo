# Features Mapping - Vecchio → Nuovo

## 🔄 Mapping Completo Funzionalità

### 📍 Area Pubblica

#### 1. Homepage
**Vecchio**: `views/new_neb/index.php`
**Nuovo**: `app/(public)/page.tsx`

| Feature | Vecchio | Nuovo | Note |
|---------|---------|-------|------|
| Hero Section | HTML statico | Next.js Image + framer-motion | Ottimizzato, animato |
| Slider Eventi | jQuery carousel | Swiper React | Touch-friendly |
| Notizie in evidenza | Query MySQL diretta | React Query + Supabase | Caching |
| Footer | HTML template | Component riusabile | Consistente |

**API Endpoints**:
- `GET /api/homepage/featured-events` - Eventi in evidenza
- `GET /api/homepage/latest-news` - Ultime notizie

---

#### 2. Calendario Gare
**Vecchio**: `views/public/calendario.php`
**Nuovo**: `app/(public)/calendario/page.tsx`

| Feature | Vecchio | Nuovo | Implementazione |
|---------|---------|-------|-----------------|
| Lista gare | Server-side rendering PHP | ISR Next.js | Revalidate ogni ora |
| Filtri | Form POST + reload | Client-side + URL params | Instant, shareable |
| Dettaglio gara | `gara.php?id=X` | `/calendario/[slug]` | SEO-friendly URLs |
| Download PDF | PHP generate | API route + PDF lib | Async generation |

**API Endpoints**:
- `GET /api/calendario/gare?filters={...}` - Lista gare filtrate
- `GET /api/calendario/gare/[slug]` - Dettaglio gara

---

#### 3. Classifiche
**Vecchio**: `views/public/classifiche.php`
**Nuovo**: `app/(public)/classifiche/page.tsx`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| Visualizzazione | Table HTML semplice | shadcn/ui DataTable | Sorting, pagination |
| Filtri categoria | Dropdown + reload | Multi-select + instant | UX migliore |
| Search atleta | SQL LIKE | Full-text search Supabase | Più veloce |
| Export PDF | Server generate | Client-side PDF.js | Offline capable |

**API Endpoints**:
- `GET /api/classifiche/gare` - Gare con classifiche
- `GET /api/classifiche/[garaSlug]?filters={...}` - Classifica filtrata

---

### 🔐 Area Autenticazione

#### Login/Register
**Vecchio**: `controllers/auth/Auth_controller.php`
**Nuovo**: `app/(auth)/login/page.tsx` + Supabase Auth

| Feature | Vecchio | Nuovo | Vantaggi |
|---------|---------|-------|----------|
| Login email/password | Session PHP | Supabase Auth JWT | Stateless, scalabile |
| Password hashing | MD5 (insicuro!) | bcrypt via Supabase | Sicuro |
| Session management | PHP $_SESSION | JWT in httpOnly cookie | XSS-proof |
| Remember me | Cookie custom | Supabase refresh token | Auto-refresh |
| Password reset | Email PHP + token DB | Supabase Magic Link | Built-in |

**Implementation**:
```typescript
// actions/auth.ts
export async function login(email: string, password: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}
```

---

### 👥 Area Società

#### Dashboard
**Vecchio**: `views/admin/_deshboard.php` (società view)
**Nuovo**: `app/(dashboard)/page.tsx`

| Widget | Vecchio | Nuovo | Tech |
|--------|---------|-------|------|
| Stats cards | PHP count queries | React Query + aggregations | Real-time |
| Grafici iscrizioni | Chart.js legacy | Recharts | Responsive |
| Recent activity | Query diretta | Infinite scroll + pagination | Better UX |
| Quick actions | Links | Action buttons + shortcuts | Keyboard support |

**Server Actions**:
```typescript
// actions/dashboard.ts
export async function getDashboardStats(societaId: string) {
  const supabase = createServerClient();
  const [atleti, iscrizioni, pagamenti] = await Promise.all([
    supabase.from('atleti').select('count', { count: 'exact' }).eq('cod_societa', societaId),
    supabase.from('iscrizioni').select('count', { count: 'exact' }).eq('cod_societa', societaId),
    supabase.from('pagamenti').select('sum(importo)').eq('cod_societa', societaId),
  ]);
  return { atleti, iscrizioni, pagamenti };
}
```

---

#### Gestione Atleti
**Vecchio**: `controllers/admin/Patient_controller.php` (naming legacy!)
**Nuovo**: `app/(dashboard)/atleti/**`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| Lista atleti | Table HTML + pagination server | DataTable client + virtual scroll | Smooth, instant search |
| Aggiungi atleta | Form POST + reload | React Hook Form + optimistic update | No reload |
| Modifica atleta | Form pre-filled | Same form + edit mode | DRY |
| Elimina atleta | Confirm alert + reload | Dialog confirm + soft delete | Reversibile |
| Search | SQL LIKE | Debounced search + full-text | Fast |
| Filtri | Query params | URL state + persist | Shareable |
| Import CSV | PHP parse + insert | Papa Parse + transaction | Progress bar |
| Export Excel | PHP library | ExcelJS client-side | Faster |

**API Structure**:
```typescript
// lib/api/atleti.ts
export const atletiApi = {
  getAtleti: (filters: AtletiFilters, pagination: Pagination) => 
    useQuery(['atleti', filters, pagination], ...),
  
  createAtleta: (data: AtletaInput) => 
    useMutation(['atleti', 'create'], ...),
  
  updateAtleta: (id: string, data: Partial<AtletaInput>) => 
    useMutation(['atleti', 'update', id], ...),
  
  deleteAtleta: (id: string) => 
    useMutation(['atleti', 'delete', id], ...),
};
```

---

#### Gestione Iscrizioni
**Vecchio**: `controllers/admin/Appointment_controller.php` (naming legacy!)
**Nuovo**: `app/(dashboard)/iscrizioni/**`

| Feature | Vecchio | Nuovo | Vantaggi |
|---------|---------|-------|----------|
| Nuova iscrizione | Multi-step form con reload | Wizard con state management | Better UX |
| Selezione gara | Dropdown | Searchable select + filters | Easier find |
| Selezione atleti | Checkboxes | Multi-select con search | Bulk iscrizioni |
| Verifica posti | Query sync | Real-time check + lock | No overbooking |
| Carrello | Session PHP | Zustand store | Persistent |
| Checkout | Redirect PayPal | Stripe Checkout embedded | Modern |

**Workflow Nuovo**:
1. Select gara (con preview info)
2. Select atleti propria società (multi)
3. Select specialità per atleta
4. Review carrello (totale, dettagli)
5. Checkout Stripe
6. Webhook confirmation
7. Email ricevuta

---

#### Certificati Medici
**Vecchio**: Non esisteva feature completa
**Nuovo**: `app/(dashboard)/certificati/**` - **Feature Nuova**

| Feature | Implementazione | Note |
|---------|----------------|------|
| Upload certificato | Supabase Storage + metadata DB | PDF max 5MB |
| Lista certificati | DataTable con badge scadenza | Verde/Giallo/Rosso |
| Alert scadenze | Dashboard widget + email cron | 30/15/7 giorni prima |
| Download | Pre-signed URL Supabase | Sicuro, temporaneo |

**Database**:
```sql
CREATE TABLE certificati_medici (
  id UUID PRIMARY KEY,
  id_atleta UUID REFERENCES atleti(id),
  tipo TEXT CHECK (tipo IN ('agonistico', 'non_agonistico')),
  data_rilascio DATE,
  data_scadenza DATE,
  file_url TEXT,
  created_at TIMESTAMPTZ
);
```

---

### 👨‍💼 Area Admin

#### Dashboard Admin
**Vecchio**: `controllers/admin/Dashboard.php`
**Nuovo**: `app/admin/page.tsx`

| Widget | Vecchio | Nuovo | Tech |
|--------|---------|-------|------|
| KPI Cards | PHP counts | React Query + aggregations | Real-time |
| Charts | Chart.js | Recharts + multiple charts | Interactive |
| Latest activities | Query limit 10 | Infinite scroll | Better UX |
| Quick stats | Static | Auto-refresh ogni 30s | Live data |
| User analytics | Non esistente | Vercel Analytics | Insights |

---

#### Gestione Società
**Vecchio**: `controllers/admin/societa/*`
**Nuovo**: `app/admin/societa/**`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| CRUD società | Standard PHP forms | Modal forms + inline edit | Faster |
| Assegna credenziali | Manual create user | Auto-invite via email | Self-service |
| Upload logo | PHP upload | Drag & drop + crop | Better UX |
| View atleti società | Separate page | Tab nel dettaglio | Context |
| Stats società | Query custom | Aggregated views | Performance |

---

#### Gestione Gare
**Vecchio**: `controllers/admin/Setup_controller.php` (gare)
**Nuovo**: `app/admin/gare/**`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| Crea gara | Long form | Multi-step wizard | Less overwhelming |
| Gestione specialità | Separate CRUD | Inline editor | Faster |
| Upload regolamento | Simple upload | Drag & drop PDF | Preview |
| Pubblicazione | Boolean flag | Workflow draft→review→publish | Safe |
| Duplica gara | Non esistente | Clone con edit | Time saver |
| Calendar view | Non esistente | FullCalendar integration | Visual |

---

#### Gestione Iscrizioni (Admin)
**Vecchio**: `controllers/admin/Appointment_controller.php`
**Nuovo**: `app/admin/iscrizioni/**`

| Feature | Vecchio | Nuovo | Vantaggi |
|---------|---------|-------|----------|
| Visualizza tutte | Table flat | Grouped by gara | Organized |
| Approva iscrizioni | Manual status change | Batch actions | Bulk |
| Gestisci lista attesa | Non esistente | Auto-move su cancellation | Automated |
| Export iscritti | PHP Excel | Multiple formats (CSV, Excel, PDF) | Flexible |
| Stampa lista | PDF basic | Customizable template | Professional |

---

#### Gestione Classifiche
**Vecchio**: `controllers/admin/Setup_controller.php` (risultati)
**Nuovo**: `app/admin/classifiche/**`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| Import risultati | CSV manual | Drag & drop + validation | Error handling |
| Inserimento manuale | One-by-one | Bulk edit table | Faster |
| Calcolo posizioni | Manual | Auto-calculate + override | Smart |
| Pubblicazione | Instant | Review→Approve→Publish | Safe workflow |
| Export PDF | Template fisso | Customizable template | Branded |
| Notifiche | Non esistente | Auto-notify atleti on publish | Engagement |

**Business Logic**:
```typescript
// lib/classifiche/calculator.ts
export function calculateClassifica(risultati: Risultato[]) {
  // Ordina per tempo
  const sorted = risultati.sort((a, b) => a.tempo - b.tempo);
  
  // Calcola posizioni assolute
  sorted.forEach((r, i) => r.posizioneAssoluta = i + 1);
  
  // Calcola posizioni per categoria
  const byCategoria = groupBy(sorted, 'categoria');
  Object.entries(byCategoria).forEach(([cat, atleti]) => {
    atleti.forEach((a, i) => a.posizioneCategoria = i + 1);
  });
  
  return sorted;
}
```

---

#### Comunicazioni
**Vecchio**: `controllers/admin/email/*` + `controllers/admin/Sms_*`
**Nuovo**: `app/admin/comunicazioni/**`

| Feature | Vecchio | Nuovo | Tech |
|---------|---------|-------|------|
| Email massive | PHPMailer sync | Resend API + queue | Async |
| SMS | Custom gateway | Twilio | Reliable |
| Template email | File PHP | React Email | Type-safe |
| Destinatari | Manual select | Smart filters (gara, categoria, etc) | Dynamic |
| Scheduling | Cron custom | Supabase Edge Functions + cron | Cloud |
| Log invii | Basic table | Timeline + stats | Insightful |

**Email Template Example**:
```tsx
// emails/iscrizione-confermata.tsx
import { Html, Button, Section } from '@react-email/components';

export default function IscrizioneConfermata({ atleta, gara }) {
  return (
    <Html>
      <Section>
        <h1>Iscrizione Confermata!</h1>
        <p>Ciao {atleta.nome},</p>
        <p>La tua iscrizione a {gara.nome} è stata confermata.</p>
        <Button href={`${baseUrl}/iscrizioni/${iscrizione.id}`}>
          Visualizza Dettagli
        </Button>
      </Section>
    </Html>
  );
}
```

---

#### Import/Export Dati
**Vecchio**: `application/import.php`
**Nuovo**: `app/admin/import-export/**`

| Feature | Vecchio | Nuovo | Miglioramenti |
|---------|---------|-------|---------------|
| Import atleti CSV | Parse PHP + insert | Papa Parse + validation UI | Error preview |
| Import FIDAL | Custom parser | API integration (se disponibile) | Automated |
| Export backup | mysqldump manual | Scheduled Supabase backup | Automatic |
| Export Excel | PHP library | ExcelJS con progress | Faster |

**Import Workflow**:
1. Upload file (drag & drop)
2. Parse & validate
3. Show preview + errors
4. Map columns (if needed)
5. Confirm import
6. Background job
7. Success/Error report

---

#### CMS Contenuti
**Vecchio**: `controllers/admin/Web_setup_controller.php`
**Nuovo**: `app/admin/cms/**`

| Feature | Vecchio | Nuovo | Tech |
|---------|---------|-------|------|
| Edit homepage | Form with HTML | Visual editor (Tiptap) | WYSIWYG |
| Gestione slider | Upload images | Media library + ordering | Organized |
| Gestione pagine | Basic CRUD | Slug auto-generate, SEO fields | SEO-ready |
| Blog/Notizie | Basic | Rich editor, tags, categories, featured | Full CMS |
| Media library | Non esistente | Supabase Storage + gallery | Assets management |

---

#### Impostazioni
**Vecchio**: `controllers/admin/Setting_controller.php`
**Nuovo**: `app/admin/impostazioni/**`

| Setting | Vecchio | Nuovo | Vantaggi |
|---------|---------|-------|----------|
| Dati organizzazione | Config file | Database + UI | Editable |
| Email gateway | Hardcoded | Provider select (Resend/SendGrid) | Flexible |
| Payment gateway | PayPal only | Stripe + PayPal | Options |
| Timezone | Server setting | User-selectable | Multi-timezone |
| Maintenance mode | File flag | Database flag + UI toggle | Easy |

---

## 🆕 Nuove Features

### 1. Notifiche Real-time
**Tech**: Supabase Realtime
**Use Cases**:
- Nuova iscrizione ricevuta
- Pagamento confermato
- Classifica pubblicata
- Certificato in scadenza

### 2. Dashboard Analytics Avanzata
**Tech**: Recharts + Vercel Analytics
**Insights**:
- Trend iscrizioni nel tempo
- Gare più popolari
- Revenue per categoria
- Retention società

### 3. QR Code Check-in (opzionale)
**Use Case**: Check-in atleti giorno gara
**Implementation**:
- QR code su ricevuta iscrizione
- Scanner app per organizzatori
- Real-time attendance tracking

### 4. API Pubblica (opzionale)
**Tech**: Next.js API Routes + API Keys
**Endpoints**:
- GET /api/public/gare - Lista gare pubbliche
- GET /api/public/classifiche/[garaId] - Classifiche pubbliche
- POST /api/public/webhook - Webhook per integrazioni terze

### 5. Multi-tenant (futuro)
**Idea**: Permettere ad altri comitati di usare la stessa piattaforma
**Implementation**:
- Tenant isolation (RLS)
- Custom domains
- White-label UI
- Separate databases

---

## 📊 Tabella Riassuntiva Migrazione

| Area | Features Vecchie | Features Nuove | Rimosse | Aggiunte |
|------|------------------|----------------|---------|----------|
| Pubblico | 3 | 3 | 0 | SEO, PWA |
| Auth | 5 | 5 | 0 | Magic links |
| Società | 8 | 12 | 0 | Certificati, Dashboard |
| Admin | 15 | 20 | Legacy naming | Analytics, Notifiche |
| **Totale** | **31** | **40** | **0** | **+9** |

---

**Status**: ✅ Features Mapping Completo
**Prossimo Step**: Implementazione
