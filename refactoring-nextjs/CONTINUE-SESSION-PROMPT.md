# ComUniMo - Continue Session Prompt

**Last Updated**: 2025-10-22  
**Project**: ComUniMo (Comitato Unitario Modena)  
**Repository**: https://github.com/Wawen22/comunimo  
**Current Progress**: ~60% Complete

---

## 🎯 Quick Start for New Session

```
Ciao! Continua lo sviluppo del progetto ComUniMo.

Siamo al 60% del refactoring da PHP/CodeIgniter a Next.js 14 + Supabase.

COMPLETATO:
✅ Infrastructure & Setup (100%)
✅ Authentication & Authorization (100%)
✅ Dashboard Layout (100%)
✅ Societies Management (100%)
✅ Members Management (100%)
✅ Races Management - Championships CRUD (100%)
✅ Races Management - Races CRUD (100%)
✅ Championship Registrations System (100%) ⭐ APPENA COMPLETATO

PROSSIMO OBIETTIVO CONSIGLIATO:
🎯 Event Registrations Management (Gestione Iscrizioni Gare Singole)

Prima di iniziare:
1. Leggi questo file completo per il contesto
2. Controlla refactoring-nextjs/REFACTORING-STATUS.md per lo stato dettagliato
3. Verifica openspec/changes/implement-races-management/ per la documentazione

Fammi sapere quando sei pronto e procediamo! 🚀
```

---

## 📊 Stato Attuale del Progetto

### Completato (60%)

#### 1. Infrastructure & Setup ✅
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Supabase integration (PostgreSQL + Auth + Storage)
- Project structure and conventions

#### 2. Authentication & Authorization ✅
- Login/Logout/Register with Supabase Auth
- RBAC (user, admin, super_admin roles)
- Protected routes with middleware
- Session management

#### 3. Dashboard Layout ✅
- Responsive sidebar navigation
- Header with user menu
- Profile management
- Breadcrumbs and loading states

#### 4. Societies Management ✅
- Complete CRUD operations
- Society code field (unique, displayed in lists and detail)
- Search and filters
- Soft delete with confirmation
- Admin-only access control

#### 5. Members Management ✅
- Complete CRUD with multi-step wizard form
- Auto-category assignment based on birth date
- Document management (photo upload, expiry alerts)
- CSV Import/Export with validation
- Statistics dashboard
- Bulk operations

#### 6. Races Management - Phase 1 & 2 ✅
- Championships CRUD (create, edit, view, delete)
- Races CRUD with championship relationship
- Auto-assignment of event_number
- Slug generation
- Search and filters

#### 7. Championship Registrations ✅ **APPENA COMPLETATO**
- Society selector for admin/super_admin
- Bulk athlete registration with checkboxes
- FIDAL/UISP organization filters
- Automatic bib number assignment (sequential, persistent)
- Cascading registration to all championship races
- Smart reactivation of cancelled registrations
- Society-filtered registration list
- RLS policies for championship_registrations and event_registrations
- Real-time list updates on society change

---

## 🔧 Implementazioni Tecniche Chiave

### Championship Registrations System

**Funzionalità Principali**:
1. **Smart Registration Logic**: Controlla se esistono registrazioni cancellate e le riattiva invece di creare duplicati
2. **Persistent Bib Numbers**: Stesso atleta mantiene stesso pettorale in tutte le gare del campionato
3. **Cascading Operations**: Iscrizione a campionato crea automaticamente iscrizioni a tutte le tappe
4. **Society Filtering**: Admin può cambiare società, lista si aggiorna automaticamente
5. **Bulk Operations**: Selezione multipla atleti e iscrizione in batch

**Files Chiave**:
- `app/(dashboard)/dashboard/races/championships/[id]/registrations/page.tsx`
- `components/races/ChampionshipRegistrations.tsx`
- `components/races/ChampionshipRegistrationForm.tsx`
- `components/races/ChampionshipRegistrationsList.tsx`
- `components/races/MemberSelectionList.tsx`

**Database Tables**:
- `championship_registrations` - Iscrizioni a campionati
- `event_registrations` - Iscrizioni a singole gare (con RLS policies)

**RLS Policies**:
- Authenticated users can view all registrations
- Admins can manage all registrations (using `is_admin()` function)
- Societies can only manage their own athletes' registrations

---

## 🎯 Prossimi Sviluppi Consigliati

### Opzione 1: Event Registrations Management (CONSIGLIATA) 🌟

**Perché**: Completa il sistema iscrizioni per gare standalone (non campionato)

**Scope**:
1. Pagina gestione iscrizioni per singola gara
2. Lista iscritti per gara con filtri
3. Form iscrizione atleti a gara singola
4. Assegnazione numeri pettorali per gare standalone
5. Gestione status iscrizione (confirmed, cancelled, pending)
6. Export lista iscritti (CSV, PDF)

**Estimated Time**: 1-2 giorni

**Files da Creare**:
- `app/(dashboard)/dashboard/races/events/[id]/registrations/page.tsx`
- `components/races/EventRegistrations.tsx`
- `components/races/EventRegistrationForm.tsx`
- `components/races/EventRegistrationsList.tsx`

**Business Logic**:
- Gare standalone hanno numeri pettorali indipendenti
- Società possono iscrivere solo i propri atleti
- Admin possono iscrivere atleti di qualsiasi società
- Deadline iscrizioni (opzionale)

---

### Opzione 2: Results Management 🏆

**Perché**: Funzionalità core per piattaforma gare

**Scope**:
1. Inserimento risultati gare (tempo, posizione)
2. Classifiche automatiche (assoluta, per categoria)
3. Gestione categorie e specialità
4. Export classifiche (PDF, CSV)
5. Pubblicazione risultati (public view)

**Estimated Time**: 2-3 giorni

---

### Opzione 3: Race Day Management 📋

**Perché**: Strumenti operativi per il giorno della gara

**Scope**:
1. Check-in atleti
2. Stampa liste partenza
3. Gestione ritiri/assenti
4. Modifica numeri pettorali last-minute
5. Dashboard giorno gara

**Estimated Time**: 1-2 giorni

---

## 📚 Documentazione di Riferimento

### File Importanti
1. `refactoring-nextjs/REFACTORING-STATUS.md` - Stato dettagliato progetto
2. `refactoring-nextjs/00-OVERVIEW.md` - Overview completo
3. `openspec/changes/implement-races-management/` - Documentazione Races Management
4. `refactoring-nextjs/comunimo-next/supabase/schema.sql` - Database schema completo

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5.3+, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: Client-side only (useEffect + useState)

### Key Patterns
1. **Client-Side Data Fetching**: useEffect + useState (NO Server Actions)
2. **Form Pattern**: React Hook Form + Zod + explicit defaultValues
3. **Controlled Inputs**: Valori espliciti (empty string, not undefined)
4. **Bulk Operations**: Checkbox multipla + batch processing
5. **Soft Delete**: status field invece di hard delete
6. **RLS Policies**: Three-tier access control

---

## ⚠️ Note Importanti

### Problemi Risolti Recentemente
1. ✅ UUID validation error - Fixed con society selector
2. ✅ Society code not saving - Fixed con defaultValues
3. ✅ Duplicate key error dopo cancellazione - Fixed con smart reactivation
4. ✅ Society filter not working - Fixed passando societyId a List component

### Pattern da Seguire
- Sempre usare `@ts-expect-error` per Supabase type issues su .update()
- Sempre includere dependencies complete in useEffect
- Sempre filtrare per society_id quando necessario
- Sempre usare soft delete (status field)

### Build Status
- ✅ TypeScript compilation: SUCCESS
- ✅ No errors, no warnings
- ✅ All components type-safe

---

**Pronto per iniziare? Fammi sapere quale feature vuoi implementare! 🚀**

