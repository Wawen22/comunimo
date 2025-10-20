# Supabase Database Setup

## 📋 Panoramica

Questo documento spiega come configurare il database Supabase per ComUniMo.

## 🗄️ Schema Database

Lo schema include le seguenti tabelle:

1. **profiles** - Profili utenti (estende auth.users di Supabase)
2. **societies** - Società/Associazioni
3. **members** - Soci delle società
4. **payments** - Pagamenti e quote
5. **events** - Eventi
6. **event_registrations** - Iscrizioni agli eventi

## 🚀 Setup Iniziale

### Passo 1: Accedi a Supabase

Vai al tuo progetto Supabase:
https://supabase.com/dashboard/project/rlhzsztbkfjpryhlojee/database/schemas

### Passo 2: Esegui lo Schema SQL

1. Nel dashboard Supabase, vai a **SQL Editor**
2. Clicca su **New Query**
3. Copia il contenuto del file `schema.sql`
4. Incolla nell'editor SQL
5. Clicca su **Run** per eseguire lo script

### Passo 3: Verifica le Tabelle

Vai a **Table Editor** e verifica che siano state create le seguenti tabelle:
- ✅ profiles
- ✅ societies
- ✅ members
- ✅ payments
- ✅ events
- ✅ event_registrations

### Passo 4: Verifica Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con le seguenti policy:

**Profiles**:
- Gli utenti possono vedere e modificare solo il proprio profilo
- Gli admin possono vedere tutti i profili

**Societies**:
- Tutti possono vedere le società attive
- Solo gli admin possono creare/modificare/eliminare società

**Members**:
- Gli utenti possono vedere i membri della propria società
- Gli admin possono gestire tutti i membri

**Payments**:
- Gli utenti possono vedere i pagamenti della propria società
- Gli admin possono gestire tutti i pagamenti

**Events**:
- Tutti possono vedere gli eventi pubblici
- I membri possono vedere gli eventi della propria società
- Gli admin possono gestire tutti gli eventi

## 🔐 Autenticazione

### Configurazione Email Auth

1. Vai a **Authentication** > **Providers**
2. Abilita **Email** provider
3. Configura le email templates (opzionale)

### Configurazione OAuth (Opzionale)

Puoi abilitare provider OAuth come:
- Google
- GitHub
- Microsoft

## 👤 Creare il Primo Admin

Dopo aver eseguito lo schema, crea il primo utente admin:

### Opzione 1: Via Dashboard Supabase

1. Vai a **Authentication** > **Users**
2. Clicca su **Add user** > **Create new user**
3. Inserisci email e password
4. Clicca su **Create user**
5. Vai a **Table Editor** > **profiles**
6. Trova il profilo appena creato
7. Modifica il campo `role` da `user` a `super_admin`

### Opzione 2: Via SQL

```sql
-- 1. Crea l'utente (sostituisci con la tua email)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@comunimo.it',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin ComUniMo"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Aggiorna il profilo a super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'admin@comunimo.it';
```

## 📊 Dati di Test (Opzionale)

Per testare l'applicazione, puoi inserire dati di esempio:

```sql
-- Inserisci una società di test
INSERT INTO public.societies (name, description, city, is_active)
VALUES ('Società Test', 'Società di test per sviluppo', 'Modena', true);

-- Inserisci un socio di test
INSERT INTO public.members (
  society_id,
  first_name,
  last_name,
  email,
  membership_status
)
SELECT 
  id,
  'Mario',
  'Rossi',
  'mario.rossi@example.com',
  'active'
FROM public.societies
WHERE name = 'Società Test'
LIMIT 1;
```

## 🔄 Migrazioni Future

Per modifiche future allo schema:

1. Crea un nuovo file SQL in `supabase/migrations/`
2. Nomina il file con timestamp: `YYYYMMDD_description.sql`
3. Esegui la migrazione nel SQL Editor di Supabase

Esempio:
```
supabase/migrations/
  20251020_initial_schema.sql
  20251021_add_documents_table.sql
  20251022_add_notifications.sql
```

## 🛠️ Strumenti Utili

### Supabase CLI (Opzionale)

Per gestire le migrazioni localmente:

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref rlhzsztbkfjpryhlojee

# Genera types TypeScript
supabase gen types typescript --project-id rlhzsztbkfjpryhlojee > types/supabase.ts
```

## 📝 Note Importanti

1. **Backup**: Supabase fa backup automatici, ma è buona pratica fare backup manuali prima di modifiche importanti
2. **RLS**: Non disabilitare mai Row Level Security in produzione
3. **Indexes**: Gli indici sono già configurati per le query più comuni
4. **Triggers**: I trigger `updated_at` sono automatici su tutte le tabelle
5. **UUID**: Tutte le tabelle usano UUID come chiave primaria

## 🔍 Verifica Setup

Dopo aver completato il setup, verifica che tutto funzioni:

```sql
-- Verifica tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verifica policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verifica triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🆘 Troubleshooting

### Errore: "permission denied for schema public"
- Verifica di essere connesso come owner del database
- Esegui: `GRANT ALL ON SCHEMA public TO postgres;`

### Errore: "function uuid_generate_v4() does not exist"
- Esegui: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### RLS blocca tutte le query
- Verifica che l'utente sia autenticato
- Controlla le policy con: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

## 📚 Risorse

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Prossimi Passi**: Dopo aver configurato il database, torna all'applicazione Next.js e inizia a implementare le funzionalità CRUD.

