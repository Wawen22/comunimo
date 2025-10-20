# Design: Migrate Legacy Database Schema

**Change ID**: `migrate-legacy-schema`  
**Status**: In Progress  
**Created**: 2024-10-20

---

## Table of Contents

1. [Schema Mapping](#schema-mapping)
2. [New Fields](#new-fields)
3. [New Tables](#new-tables)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [RLS Policies](#rls-policies)

---

## Schema Mapping

### Legacy → Modern Table Mapping

| Legacy Table | Modern Table | Purpose |
|-------------|--------------|---------|
| `doctor_tbl` | `societies` | Managed societies |
| `tab_atleti` | `members` | Athletes/members |
| `tab_gara` | `events` | Races/events |
| `tab_iscritti` | `event_registrations` | Event registrations |
| `tab_cert` | `medical_certificates` | Medical certificates (NEW) |
| `tab_societa` | `all_societies` | All societies lookup (NEW) |
| `tab_enti` | `organizations` | Organizations (NEW) |
| `categorie` | `categories` | Athletic categories (NEW) |
| `tab_specialita` | `event_specialties` | Event specialties (NEW) |
| `tab_pettorale` | `bib_number_sequences` | Bib number tracking (NEW) |

---

## New Fields

### societies Table

```sql
ALTER TABLE public.societies ADD COLUMN IF NOT EXISTS
  society_code TEXT UNIQUE,  -- Codice società (es. "MO001")
  logo_url TEXT;             -- URL logo società
```

**Rationale**: 
- `society_code`: Unique identifier used in legacy system, needed for compatibility
- `logo_url`: Society branding, important for UI

---

### members Table

```sql
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS
  organization TEXT,                    -- FIDAL, UISP, CSI, RUNCARD
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),  -- Anno gestione
  regional_code TEXT,                   -- Codice regionale
  category TEXT,                        -- Categoria atletica
  membership_card_number TEXT UNIQUE,   -- Numero tessera
  card_issue_date DATE,                 -- Data emissione tessera
  card_expiry_date DATE,                -- Data scadenza tessera
  birth_place TEXT,                     -- Luogo di nascita
  is_foreign BOOLEAN DEFAULT false,     -- Atleta straniero
  medical_certificate_date DATE,        -- Data certificato medico
  photo_url TEXT;                       -- URL foto atleta
```

**Rationale**:
- Athletic-specific fields required for race management
- Medical certificate tracking for compliance
- Organization affiliation for multi-federation support

---

### events Table

```sql
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS
  event_number INTEGER,                 -- Numero progressivo gara
  registration_start_date TIMESTAMPTZ,  -- Inizio iscrizioni
  registration_end_date TIMESTAMPTZ,    -- Fine iscrizioni
  poster_url TEXT,                      -- URL locandina
  results_url TEXT,                     -- URL classifiche
  has_specialties BOOLEAN DEFAULT false; -- Ha specialità
```

**Rationale**:
- Event numbering for legacy compatibility
- Registration window management
- Document attachments (posters, results)
- Specialty support flag

---

### event_registrations Table

```sql
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS
  bib_number TEXT,          -- Numero pettorale
  organization TEXT,        -- Ente di appartenenza
  category TEXT,            -- Categoria
  specialty TEXT;           -- Specialità (es. "100m", "Salto in lungo")
```

**Rationale**:
- Bib number assignment for race day
- Category tracking for results
- Specialty selection for multi-discipline events

---

## New Tables

### 1. organizations

```sql
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,        -- FIDAL, UISP, CSI, RUNCARD
  name TEXT NOT NULL,               -- Nome completo
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO public.organizations (code, name) VALUES
  ('FIDAL', 'Federazione Italiana di Atletica Leggera'),
  ('UISP', 'Unione Italiana Sport Per tutti'),
  ('CSI', 'Centro Sportivo Italiano'),
  ('RUNCARD', 'Runcard');
```

---

### 2. categories

```sql
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,        -- Es. "SM", "SF", "AM", "AF"
  gender TEXT NOT NULL,             -- M, F
  age_from INTEGER NOT NULL,        -- Età minima
  age_to INTEGER NOT NULL,          -- Età massima
  description TEXT,                 -- Descrizione categoria
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example seed data
INSERT INTO public.categories (code, gender, age_from, age_to, description) VALUES
  ('SM', 'M', 18, 34, 'Seniores Maschile'),
  ('SF', 'F', 18, 34, 'Seniores Femminile'),
  ('AM', 'M', 35, 39, 'Master 35 Maschile'),
  ('AF', 'F', 35, 39, 'Master 35 Femminile');
```

---

### 3. medical_certificates

```sql
CREATE TABLE public.medical_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  membership_card_number TEXT NOT NULL,  -- Numero tessera
  issue_date DATE NOT NULL,              -- Data emissione
  expiry_date DATE NOT NULL,             -- Data scadenza
  last_update_date DATE,                 -- Data ultimo aggiornamento
  issuing_authority TEXT,                -- Ente rilascio
  manual_update_note TEXT,               -- Note aggiornamento manuale
  certificate_url TEXT,                  -- URL certificato
  card_attachment_url TEXT,              -- URL allegato tessera
  is_valid BOOLEAN GENERATED ALWAYS AS (expiry_date >= CURRENT_DATE) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medical_certificates_member ON public.medical_certificates(member_id);
CREATE INDEX idx_medical_certificates_card ON public.medical_certificates(membership_card_number);
CREATE INDEX idx_medical_certificates_expiry ON public.medical_certificates(expiry_date);
```

---

### 4. event_specialties

```sql
CREATE TABLE public.event_specialties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                    -- Codice specialità (es. "100", "LUN")
  name TEXT NOT NULL,                    -- Nome specialità (es. "100 metri", "Salto in lungo")
  category TEXT,                         -- Categoria (opzionale)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, code)
);

CREATE INDEX idx_event_specialties_event ON public.event_specialties(event_id);
```

---

### 5. all_societies

```sql
CREATE TABLE public.all_societies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  society_code TEXT UNIQUE NOT NULL,     -- Codice società
  name TEXT NOT NULL,                    -- Nome società
  province TEXT,                         -- Provincia
  organization TEXT,                     -- Ente (FIDAL, UISP, etc.)
  is_managed BOOLEAN DEFAULT false,      -- Gestita da noi
  managed_society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_all_societies_code ON public.all_societies(society_code);
CREATE INDEX idx_all_societies_org ON public.all_societies(organization);
```

**Rationale**: Lookup table for all societies (managed and external) for race registrations.

---

### 6. bib_number_sequences

```sql
CREATE TABLE public.bib_number_sequences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  last_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bib_sequences_event ON public.bib_number_sequences(event_id);
```

**Rationale**: Track last assigned bib number per event for automatic assignment.

---

## Relationships

```
organizations
  └─> members (organization FK)
  └─> all_societies (organization FK)

categories
  └─> members (category FK)
  └─> event_registrations (category FK)

societies
  ├─> members (society_id FK)
  ├─> events (created_by FK)
  └─> all_societies (managed_society_id FK)

members
  ├─> event_registrations (member_id FK)
  └─> medical_certificates (member_id FK)

events
  ├─> event_registrations (event_id FK)
  ├─> event_specialties (event_id FK)
  └─> bib_number_sequences (event_id FK)

all_societies
  └─> event_registrations (society_code FK)
```

---

## Indexes

### Performance Indexes

```sql
-- members
CREATE INDEX idx_members_organization ON public.members(organization);
CREATE INDEX idx_members_category ON public.members(category);
CREATE INDEX idx_members_card_number ON public.members(membership_card_number);
CREATE INDEX idx_members_card_expiry ON public.members(card_expiry_date);

-- events
CREATE INDEX idx_events_number ON public.events(event_number);
CREATE INDEX idx_events_reg_dates ON public.events(registration_start_date, registration_end_date);

-- event_registrations
CREATE INDEX idx_registrations_bib ON public.event_registrations(bib_number);
CREATE INDEX idx_registrations_org ON public.event_registrations(organization);
CREATE INDEX idx_registrations_category ON public.event_registrations(category);
```

---

## RLS Policies

All new tables will use the same RLS pattern as existing tables:

```sql
-- Enable RLS
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- View policy (authenticated users)
CREATE POLICY "Authenticated users can view [table]"
  ON public.[table_name] FOR SELECT
  TO authenticated
  USING (true);

-- Manage policy (admins only)
CREATE POLICY "Admins can manage [table]"
  ON public.[table_name] FOR ALL
  USING (public.is_admin());
```

---

## Migration Strategy

1. **Add new columns** to existing tables (non-breaking)
2. **Create new tables** with proper constraints
3. **Create indexes** for performance
4. **Apply RLS policies** for security
5. **Update TypeScript types**
6. **Test thoroughly**

---

## Backward Compatibility

- All new fields are **nullable** to maintain compatibility
- Existing queries continue to work
- New features are opt-in
- No data loss during migration

