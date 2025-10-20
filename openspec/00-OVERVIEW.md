# ComUniMo - Panoramica Applicazione

**Progetto**: ComUniMo (Comitato Unitario Modena)  
**Versione**: 2.0 (Refactoring Next.js)  
**Data Creazione**: 2024-10-20  
**Ultimo Aggiornamento**: 2024-10-20

---

## 📋 Descrizione

ComUniMo è un sistema di gestione per il **Comitato Unitario Modena**, progettato per gestire:

1. **Società Sportive** - Gestione delle società affiliate
2. **Atleti** - Gestione degli atleti iscritti alle società
3. **Iscrizioni Gare** - Gestione delle iscrizioni degli atleti alle gare
4. **Eventi/Gare** - Organizzazione e gestione delle gare sportive
5. **Pagamenti** - Tracciamento dei pagamenti

---

## 🎯 Modello di Business

### Attori Principali

1. **Comitato (Admin/Super Admin)**
   - Gestisce tutte le società
   - Gestisce tutti gli atleti
   - Organizza le gare
   - Vede tutti i dati

2. **Società Sportive**
   - Hanno un **CODICE SOCIETÀ** univoco (es. "MO001")
   - Iscrivono i propri atleti
   - Vedono solo i propri atleti (filtrati per codice società)
   - Iscrivono gli atleti alle gare

3. **Atleti**
   - Appartengono a una società (identificata dal **CODICE SOCIETÀ**)
   - Hanno una tessera con scadenza
   - Hanno un certificato medico con scadenza
   - Appartengono a un ente (FIDAL, UISP, CSI, RUNCARD)
   - Hanno una categoria atletica (SM, SF, AM, AF, etc.)

---

## 🗄️ Modello Dati

### Tabelle Principali

#### 1. **profiles** (Utenti del Sistema)
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- phone (TEXT)
- fiscal_code (TEXT, UNIQUE)
- role (TEXT: 'user' | 'admin' | 'super_admin')
- society_id (UUID, FK → societies.id)  -- Società di appartenenza
- is_active (BOOLEAN)
- created_at, updated_at
```

**Ruoli:**
- `user`: Utente base (rappresentante società)
- `admin`: Amministratore (gestisce tutto)
- `super_admin`: Super amministratore (accesso completo)

**Relazione con Società:**
- Un utente `user` appartiene a una società (`society_id`)
- Può vedere/gestire solo gli atleti della sua società
- Gli `admin` e `super_admin` vedono tutto

---

#### 2. **societies** (Società Sportive)
```sql
- id (UUID, PK)
- name (TEXT)
- society_code (TEXT, UNIQUE)  -- Codice univoco (es. "MO001")
- description (TEXT)
- address, city, province, postal_code
- phone, email, website
- vat_number (TEXT, UNIQUE)
- fiscal_code (TEXT)
- legal_representative (TEXT)
- logo_url (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at, created_by
```

**Codice Società:**
- Identificatore univoco della società (es. "MO001", "MO002")
- Usato per filtrare gli atleti
- Denormalizzato nella tabella `members` per performance

---

#### 3. **members** (Atleti)
```sql
- id (UUID, PK)
- society_id (UUID, FK → societies.id)
- society_code (TEXT)  -- Denormalizzato da societies.society_code
- user_id (UUID, FK → profiles.id)  -- Se l'atleta è anche utente

-- Dati Personali
- first_name, last_name (TEXT)
- fiscal_code (TEXT, UNIQUE)
- birth_date, birth_place (DATE, TEXT)
- gender (TEXT: 'M' | 'F' | 'other')

-- Contatti
- email, phone, mobile (TEXT)

-- Indirizzo
- address, city, province, postal_code (TEXT)

-- Tesseramento
- membership_number (TEXT, UNIQUE)
- membership_date (DATE)
- membership_type (TEXT)
- membership_status (TEXT: 'active' | 'suspended' | 'expired' | 'cancelled')

-- Dati Atletici
- organization (TEXT: 'FIDAL' | 'UISP' | 'CSI' | 'RUNCARD')
- year (INTEGER)  -- Anno gestione
- regional_code (TEXT)  -- Codice regionale
- category (TEXT)  -- Categoria atletica (SM, SF, AM, AF, etc.)
- membership_card_number (TEXT, UNIQUE)  -- Numero tessera
- card_issue_date (DATE)
- card_expiry_date (DATE)
- is_foreign (BOOLEAN)
- medical_certificate_date (DATE)
- photo_url (TEXT)

-- Altro
- notes (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at, created_by
```

**Relazione Società-Atleti:**
- Ogni atleta appartiene a una società (`society_id`)
- Il `society_code` è denormalizzato per filtrare velocemente
- Una società vede solo i suoi atleti (WHERE society_code = user.society.society_code)

---

#### 4. **events** (Gare/Eventi)
```sql
- id (UUID, PK)
- society_id (UUID, FK → societies.id)  -- Società organizzatrice
- name, description (TEXT)
- event_date (DATE)
- location, city, province (TEXT)
- max_participants (INTEGER)
- registration_fee (DECIMAL)
- is_public (BOOLEAN)
- event_number (TEXT)  -- Numero gara
- registration_start_date, registration_end_date (DATE)
- poster_url, results_url (TEXT)
- has_specialties (BOOLEAN)
- is_active (BOOLEAN)
- created_at, updated_at, created_by
```

---

#### 5. **event_registrations** (Iscrizioni Gare)
```sql
- id (UUID, PK)
- event_id (UUID, FK → events.id)
- member_id (UUID, FK → members.id)
- society_id (UUID, FK → societies.id)
- registration_date (DATE)
- status (TEXT: 'pending' | 'confirmed' | 'cancelled')
- payment_status (TEXT)
- bib_number (TEXT)  -- Numero pettorale
- organization (TEXT)  -- FIDAL, UISP, etc.
- category (TEXT)  -- Categoria atleta
- specialty (TEXT)  -- Specialità gara
- notes (TEXT)
- created_at, updated_at
```

**Flusso Iscrizione:**
1. Una società iscrive un suo atleta a una gara
2. Viene assegnato un numero pettorale
3. L'iscrizione viene confermata
4. L'atleta partecipa alla gara

---

### Tabelle di Supporto

#### 6. **organizations** (Enti Sportivi)
```sql
- code (TEXT, PK: 'FIDAL' | 'UISP' | 'CSI' | 'RUNCARD')
- name (TEXT)
- description (TEXT)
- website (TEXT)
- is_active (BOOLEAN)
```

#### 7. **categories** (Categorie Atletiche)
```sql
- code (TEXT, PK: 'SM' | 'SF' | 'AM' | 'AF' | etc.)
- description (TEXT)
- gender (TEXT: 'M' | 'F')
- min_age, max_age (INTEGER)
- is_active (BOOLEAN)
```

#### 8. **medical_certificates** (Certificati Medici)
```sql
- id (UUID, PK)
- member_id (UUID, FK → members.id)
- issue_date, expiry_date (DATE)
- certificate_type (TEXT)
- doctor_name (TEXT)
- document_url (TEXT)
- is_active (BOOLEAN)
```

#### 9. **event_specialties** (Specialità Gare)
```sql
- id (UUID, PK)
- event_id (UUID, FK → events.id)
- name (TEXT)
- description (TEXT)
- max_participants (INTEGER)
- is_active (BOOLEAN)
```

#### 10. **all_societies** (Tutte le Società - Lookup)
```sql
- id (UUID, PK)
- code (TEXT, UNIQUE)
- name (TEXT)
- city (TEXT)
- is_active (BOOLEAN)
```

#### 11. **bib_number_sequences** (Sequenze Pettorali)
```sql
- id (UUID, PK)
- event_id (UUID, FK → events.id)
- last_number (INTEGER)
- prefix (TEXT)
```

---

## 🔐 Sicurezza e Permessi

### Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con policy specifiche:

1. **Authenticated users can view** - Utenti autenticati possono vedere i dati
2. **Admins can manage** - Solo admin possono creare/modificare/eliminare

### Funzioni SECURITY DEFINER

Per evitare ricorsione infinita nelle policy RLS:

```sql
-- Verifica se l'utente è admin
CREATE FUNCTION public.is_admin() RETURNS BOOLEAN
  SECURITY DEFINER;

-- Ottiene la società dell'utente
CREATE FUNCTION public.get_user_society_id() RETURNS UUID
  SECURITY DEFINER;
```

---

## 🎨 Stack Tecnologico

### Frontend
- **Next.js 14.2+** (App Router, React Server Components)
- **React 18.3+**
- **TypeScript 5.3+** (strict mode)
- **Tailwind CSS 3.4+**
- **shadcn/ui** (Radix UI primitives)
- **React Hook Form + Zod** (validazione form)
- **lucide-react** (icone)

### Backend
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Row Level Security (RLS)** per sicurezza database

### Autenticazione
- **Supabase Auth** (JWT-based)
- **Client-side authentication** (no Server Actions)
- **Role-based access control (RBAC)**

---

## 📁 Struttura Progetto

```
refactoring-nextjs/comunimo-next/
├── app/
│   ├── (auth)/              # Pagine autenticazione
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Pagine dashboard
│   │   └── dashboard/
│   │       ├── page.tsx     # Dashboard home
│   │       ├── profile/     # Profilo utente
│   │       ├── societies/   # Gestione società
│   │       ├── members/     # Gestione atleti
│   │       ├── events/      # Gestione gare
│   │       └── payments/    # Gestione pagamenti
│   └── (public)/            # Pagine pubbliche
├── components/
│   ├── ui/                  # Componenti UI base
│   ├── auth/                # Componenti autenticazione
│   ├── layout/              # Layout (Sidebar, Header)
│   ├── societies/           # Componenti società
│   └── members/             # Componenti atleti
├── lib/
│   ├── api/                 # Client Supabase
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── supabase/
    └── schema.sql           # Database schema
```

---

## 🚀 Stato Implementazione

### ✅ Completato
- [x] Setup progetto Next.js 14
- [x] Configurazione Tailwind CSS
- [x] Setup Supabase
- [x] Database schema completo
- [x] Autenticazione (login, register, forgot password)
- [x] RBAC (Role-Based Access Control)
- [x] Dashboard layout (Sidebar, Header)
- [x] Profilo utente
- [x] Gestione società (CRUD completo)
- [x] Gestione atleti - Fase 1 (Lista con filtri)

### ⏳ In Corso
- [ ] Gestione atleti - Fase 2 (Dettaglio e Form)
- [ ] Gestione atleti - Fase 3 (Bulk import/export)

### 📝 Da Fare
- [ ] Gestione pagamenti
- [ ] Gestione eventi/gare
- [ ] Gestione iscrizioni gare
- [ ] Dashboard statistiche
- [ ] Notifiche scadenze
- [ ] Testing completo

---

## 📝 Note Importanti

1. **Terminologia**: "Members" nel database = "Atleti" nell'UI
2. **Codice Società**: Campo chiave per filtrare atleti per società
3. **RLS**: Usare sempre funzioni SECURITY DEFINER per evitare ricorsione
4. **Client-side**: Tutte le operazioni CRUD sono client-side (no Server Actions)
5. **Soft Delete**: Usare `is_active = false` invece di DELETE

---

## 🔗 Link Utili

- **Repository**: `\\wsl.localhost\Ubuntu-24.04\home\rnebili\Progetti\NEB\www.comitatounitariomodena.eu`
- **Supabase Project**: ComUniMo (ID: rlhzsztbkfjpryhlojee)
- **OpenSpec**: `/openspec/changes/`

