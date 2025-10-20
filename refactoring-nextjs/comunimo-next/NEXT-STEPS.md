# Prossimi Passi - ComUniMo Next.js

## ✅ Completato

- [x] Setup progetto Next.js 14 con TypeScript
- [x] Configurazione Tailwind CSS e design system
- [x] Installazione dipendenze (shadcn/ui, Supabase, ecc.)
- [x] Creazione struttura cartelle
- [x] Configurazione ESLint e Prettier
- [x] Creazione utility functions
- [x] **Schema database Supabase creato**
- [x] **TypeScript types per database**
- [x] **Fix errore TypeScript in routes.ts**

## 🔧 Da Fare Subito

### 1. Verifica Build (dal terminale WSL bash)

```bash
# Apri WSL
wsl

# Naviga al progetto
cd ~/Progetti/NEB/www.comitatounitariomodena.eu/refactoring-nextjs/comunimo-next

# Verifica TypeScript
npm run type-check

# Verifica build
npm run build

# Avvia dev server
npm run dev
```

Poi apri http://localhost:3000 nel browser.

### 2. Configura Database Supabase

**Vai a**: https://supabase.com/dashboard/project/rlhzsztbkfjpryhlojee/sql/new

**Passi**:
1. Apri il file `supabase/schema.sql`
2. Copia tutto il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **Run** per eseguire lo script
5. Verifica che le tabelle siano state create in **Table Editor**

**Documentazione completa**: Vedi `supabase/README.md`

### 3. Crea il Primo Utente Admin

**Opzione A - Via Dashboard**:
1. Vai a **Authentication** > **Users**
2. Clicca **Add user** > **Create new user**
3. Email: `admin@comunimo.it`
4. Password: (scegli una password sicura)
5. Clicca **Create user**
6. Vai a **Table Editor** > **profiles**
7. Trova il profilo e cambia `role` da `user` a `super_admin`

**Opzione B - Via SQL**:
```sql
-- Esegui nel SQL Editor di Supabase
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'TUA_EMAIL@example.com';
```

## 🚀 Fase 2: Implementazione Features

### 2.1 Autenticazione (Priorità Alta)

**File da creare**:
- `app/(auth)/login/page.tsx` - Pagina login
- `app/(auth)/register/page.tsx` - Pagina registrazione
- `components/forms/LoginForm.tsx` - Form login
- `components/forms/RegisterForm.tsx` - Form registrazione
- `lib/hooks/useAuth.ts` - Hook per autenticazione
- `middleware.ts` - Middleware per proteggere route

**Esempio LoginForm**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Email o password non validi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Accesso in corso...' : 'Accedi'}
      </Button>
    </form>
  );
}
```

### 2.2 Dashboard (Priorità Alta)

**File da creare**:
- `app/(dashboard)/dashboard/page.tsx` - Dashboard principale
- `app/(dashboard)/dashboard/layout.tsx` - Layout dashboard
- `components/layout/Sidebar.tsx` - Sidebar navigazione
- `components/layout/Header.tsx` - Header con user menu
- `components/dashboard/StatsCard.tsx` - Card statistiche
- `components/dashboard/RecentActivity.tsx` - Attività recenti

### 2.3 Gestione Società (Priorità Alta)

**File da creare**:
- `app/(dashboard)/societies/page.tsx` - Lista società
- `app/(dashboard)/societies/[id]/page.tsx` - Dettaglio società
- `app/(dashboard)/societies/new/page.tsx` - Nuova società
- `components/forms/SocietyForm.tsx` - Form società
- `actions/societies.ts` - Server Actions per CRUD società

**Esempio Server Action**:
```typescript
'use server';

import { supabaseAdmin } from '@/lib/api/supabase-server';
import type { CreateSocietyInput } from '@/types/database';

export async function createSociety(data: CreateSocietyInput) {
  const { data: society, error } = await supabaseAdmin
    .from('societies')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return society;
}

export async function getSocieties() {
  const { data, error } = await supabaseAdmin
    .from('societies')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}
```

### 2.4 Gestione Soci (Priorità Media)

**File da creare**:
- `app/(dashboard)/members/page.tsx` - Lista soci
- `app/(dashboard)/members/[id]/page.tsx` - Dettaglio socio
- `app/(dashboard)/members/new/page.tsx` - Nuovo socio
- `components/forms/MemberForm.tsx` - Form socio
- `components/tables/MembersTable.tsx` - Tabella soci
- `actions/members.ts` - Server Actions per CRUD soci

### 2.5 Gestione Pagamenti (Priorità Media)

**File da creare**:
- `app/(dashboard)/payments/page.tsx` - Lista pagamenti
- `app/(dashboard)/payments/new/page.tsx` - Nuovo pagamento
- `components/forms/PaymentForm.tsx` - Form pagamento
- `components/tables/PaymentsTable.tsx` - Tabella pagamenti
- `actions/payments.ts` - Server Actions per CRUD pagamenti

### 2.6 Gestione Eventi (Priorità Bassa)

**File da creare**:
- `app/(dashboard)/events/page.tsx` - Lista eventi
- `app/(dashboard)/events/[id]/page.tsx` - Dettaglio evento
- `app/(dashboard)/events/new/page.tsx` - Nuovo evento
- `components/forms/EventForm.tsx` - Form evento
- `actions/events.ts` - Server Actions per CRUD eventi

## 📚 Componenti shadcn/ui da Aggiungere

Man mano che implementi le features, aggiungi i componenti necessari:

```bash
# Form components
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# UI components
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs

# Navigation
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add breadcrumb
```

## 🔄 Workflow di Sviluppo

1. **Crea branch per feature**:
   ```bash
   git checkout -b feature/authentication
   ```

2. **Sviluppa la feature**

3. **Testa localmente**:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   npm run dev
   ```

4. **Commit**:
   ```bash
   git add .
   git commit -m "feat: implement authentication"
   ```

5. **Push e crea PR**

## 📖 Risorse Utili

- **Next.js 14 Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
- **TanStack Query**: https://tanstack.com/query/latest

## 🎯 Obiettivi Fase 2

- [ ] Autenticazione completa (login, logout, registrazione)
- [ ] Dashboard con statistiche
- [ ] CRUD Società
- [ ] CRUD Soci
- [ ] CRUD Pagamenti
- [ ] CRUD Eventi
- [ ] Middleware per protezione route
- [ ] Gestione permessi (user/admin/super_admin)
- [ ] Export dati (CSV, PDF)
- [ ] Ricerca e filtri avanzati

## 💡 Suggerimenti

1. **Inizia dall'autenticazione** - È la base per tutto il resto
2. **Usa Server Actions** - Per operazioni database sicure
3. **Implementa RLS** - Già configurato nel database
4. **Testa con dati reali** - Inserisci dati di test nel database
5. **Documenta il codice** - Usa JSDoc per funzioni complesse
6. **Gestisci errori** - Usa try/catch e mostra messaggi user-friendly

---

**Buon lavoro! 🚀**

Per domande o problemi, consulta la documentazione in:
- `README.md` - Panoramica generale
- `SETUP.md` - Setup e troubleshooting
- `supabase/README.md` - Database setup
- `PHASE1-SUMMARY.md` - Riepilogo Fase 1

