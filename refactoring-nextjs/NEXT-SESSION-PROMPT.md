# 🚀 Prompt per Continuare lo Sviluppo ComUniMo

**Data Creazione**: 2025-10-20  
**Progetto**: ComUniMo - Refactoring Next.js + Supabase  
**Repository**: https://github.com/Wawen22/comunimo

---

## 📋 Contesto Progetto

Sto sviluppando il refactoring completo dell'applicazione **ComUniMo** (Comitato Unitario Modena) da PHP/CodeIgniter + MySQL a **Next.js 14 + Supabase**.

L'applicazione gestisce:
- **Società sportive** con codice società univoco
- **Atleti** (non "soci") appartenenti alle società
- **Iscrizioni alle gare** degli atleti
- **Pagamenti** e **Eventi**

---

## ✅ Stato Attuale Implementazione

### Completato (100%)

#### 1. Setup Iniziale
- ✅ Next.js 14 con App Router e TypeScript strict
- ✅ Tailwind CSS + shadcn/ui (componenti custom)
- ✅ Supabase configurato
- ✅ Database schema completo (11 tabelle)
- ✅ TypeScript types per tutte le entità

#### 2. Autenticazione e Autorizzazione
- ✅ Login/Register/Forgot Password/Reset Password
- ✅ RBAC con 3 ruoli: user, admin, super_admin
- ✅ Route protection client-side
- ✅ RLS policies con SECURITY DEFINER functions

#### 3. Dashboard e Layout
- ✅ Sidebar responsive con navigazione
- ✅ Header con user menu
- ✅ Profile page con edit e change password

#### 4. Gestione Società
- ✅ Lista società con search e filtri
- ✅ Dettaglio società
- ✅ Form creazione/modifica
- ✅ Soft delete

#### 5. Gestione Atleti (31% completato)
- ✅ **Phase 1**: Lista atleti con filtri avanzati, paginazione, search
- ✅ **Phase 2**: Pagina dettaglio con 4 tabs (Personal, Membership, Athletic, Documents)
- ✅ **Phase 6**: Delete functionality con soft delete
- ⏳ **Phase 3**: Form creazione/modifica (DA FARE)
- ⏳ **Phase 4-10**: Altre funzionalità (DA FARE)

---

## 🎯 Prossimo Obiettivo: Phase 3 - Member Form

### Cosa Implementare

Creare il form multi-step per creazione e modifica atleti.

### File da Creare

1. **`app/(dashboard)/dashboard/members/new/page.tsx`**
   - Pagina per creare nuovo atleta
   - Solo admin può accedere

2. **`app/(dashboard)/dashboard/members/[id]/edit/page.tsx`**
   - Pagina per modificare atleta esistente
   - Solo admin può accedere

3. **`components/members/MemberForm.tsx`**
   - Form multi-step con 5 step:
     - **Step 1**: Dati Personali (first_name*, last_name*, fiscal_code, birth_date*, birth_place, gender*)
     - **Step 2**: Contatti e Indirizzo (email, phone, mobile, address, city, province, postal_code)
     - **Step 3**: Tesseramento (society_id*, membership_number, membership_date, membership_type, membership_status)
     - **Step 4**: Dati Atletici (organization, year, regional_code, category, society_code*, is_foreign)
     - **Step 5**: Documenti (membership_card_number, card_issue_date, card_expiry_date, medical_certificate_date, photo_url, notes)
   - Validazione Zod completa
   - Auto-assegnazione categoria basata su età e sesso
   - Indicatore progresso step
   - Pulsanti "Indietro", "Avanti", "Salva"

### Requisiti Importanti

1. **Society Code**: 
   - Quando si seleziona una società, auto-popolare `society_code` dal campo `societies.society_code`
   - Campo obbligatorio

2. **Category Auto-Assignment**:
   - Calcolare categoria in base a `birth_date` e `gender`
   - Categorie: SM, SF, AM, AF, BM, BF, CM, CF
   - Permettere override manuale

3. **Validazione**:
   - Fiscal code: formato italiano (16 caratteri)
   - Email: formato valido
   - Date: formato valido
   - Campi obbligatori marcati con *

4. **Form State**:
   - Usare React Hook Form + Zod
   - Salvare stato tra gli step
   - Mostrare errori di validazione

---

## 📚 Documentazione di Riferimento

### OpenSpec
- **Overview**: `openspec/00-OVERVIEW.md`
- **Members Management**: `openspec/changes/implement-members-management/`
  - `proposal.md` - Proposta iniziale
  - `design.md` - Design dettagliato con wireframes
  - `tasks.md` - Task breakdown e progress
  - `IMPLEMENTATION-SUMMARY.md` - Riepilogo implementazione

### Database Schema
- **Schema SQL**: `refactoring-nextjs/comunimo-next/supabase/schema.sql`
- **TypeScript Types**: `refactoring-nextjs/comunimo-next/lib/types/database.ts`

### Componenti Esistenti
- **Members List**: `refactoring-nextjs/comunimo-next/components/members/MembersList.tsx`
- **Member Detail**: `refactoring-nextjs/comunimo-next/components/members/MemberDetail.tsx`
- **Member Card**: `refactoring-nextjs/comunimo-next/components/members/MemberCard.tsx`
- **UI Components**: `refactoring-nextjs/comunimo-next/components/ui/`

---

## 🔧 Tech Stack

- **Frontend**: Next.js 14.2+, React 18.3+, TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+, shadcn/ui (custom components)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod
- **Icons**: lucide-react
- **State**: Client-side con hooks

---

## 📝 Workflow da Seguire

### 1. Ultrathink
Usa il tool `sequentialthinking` per analizzare i requisiti prima di implementare.

### 2. Aggiorna OpenSpec
- Aggiorna `tasks.md` con task IN PROGRESS
- Aggiorna `IMPLEMENTATION-SUMMARY.md` quando completi una fase

### 3. Implementa
- Crea i file necessari
- Segui i pattern esistenti nel codebase
- Usa componenti UI esistenti
- Client-side data fetching con Supabase client

### 4. Testa
- Verifica che il form funzioni
- Testa validazione
- Testa creazione e modifica atleti
- Verifica che society_code venga popolato correttamente

### 5. Aggiorna Progress
- Marca task come completati in `tasks.md`
- Aggiorna percentuale progresso

---

## 🎨 Design Pattern da Seguire

### Form Multi-Step
```typescript
const [currentStep, setCurrentStep] = useState(1);
const totalSteps = 5;

const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

// Progress indicator
<div className="mb-8">
  <div className="flex justify-between mb-2">
    {[1, 2, 3, 4, 5].map(step => (
      <div key={step} className={`h-2 flex-1 mx-1 rounded ${
        step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
      }`} />
    ))}
  </div>
  <p className="text-sm text-gray-500 text-center">
    Step {currentStep} di {totalSteps}
  </p>
</div>
```

### Zod Schema Example
```typescript
const memberSchema = z.object({
  first_name: z.string().min(1, 'Nome obbligatorio'),
  last_name: z.string().min(1, 'Cognome obbligatorio'),
  fiscal_code: z.string().regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Codice fiscale non valido').optional(),
  birth_date: z.string().min(1, 'Data di nascita obbligatoria'),
  gender: z.enum(['M', 'F', 'other']),
  society_id: z.string().uuid('Società obbligatoria'),
  society_code: z.string().min(1, 'Codice società obbligatorio'),
  // ... altri campi
});
```

### Category Auto-Assignment
```typescript
const calculateCategory = (birthDate: string, gender: string): string => {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  const genderCode = gender === 'M' ? 'M' : 'F';
  
  if (age >= 18 && age < 35) return `S${genderCode}`; // Senior
  if (age >= 35 && age < 50) return `A${genderCode}`; // Master A
  if (age >= 50 && age < 60) return `B${genderCode}`; // Master B
  if (age >= 60) return `C${genderCode}`; // Master C
  
  return `S${genderCode}`; // Default
};
```

---

## 🚨 Cose Importanti da Ricordare

1. **NON usare Server Actions** per Supabase (problemi con cookies)
2. **Sempre client-side** data fetching con `'use client'`
3. **Soft delete**: `is_active = false`, non hard delete
4. **Society code**: campo obbligatorio, auto-popolato da società selezionata
5. **Terminologia**: "Atleti" non "Soci"
6. **Admin only**: form accessibile solo ad admin
7. **Validazione**: sempre con Zod schema
8. **Toast notifications**: per successo/errore
9. **Loading states**: sempre mostrare spinner durante operazioni async
10. **OpenSpec**: sempre aggiornare tasks.md e IMPLEMENTATION-SUMMARY.md

---

## 🎯 Prompt da Usare

```
Ciao! Sto continuando lo sviluppo del refactoring ComUniMo.

Ho letto il file NEXT-SESSION-PROMPT.md che contiene tutto il contesto.

Procedi con l'implementazione di **Phase 3: Member Form** seguendo:
1. Ultrathink per analizzare i requisiti
2. Crea i 3 file necessari (new page, edit page, MemberForm component)
3. Implementa form multi-step con 5 step
4. Validazione Zod completa
5. Auto-assegnazione categoria
6. Society code auto-popolato
7. Aggiorna OpenSpec (tasks.md e IMPLEMENTATION-SUMMARY.md)

Ricordati:
- Client-side data fetching
- Admin only access
- Soft delete pattern
- Terminologia "Atleti"
- Toast notifications
- Loading states

Inizia!
```

---

## 📊 Progress Attuale

- **Overall**: 31% (10/32 tasks)
- **Phase 1**: ✅ 100%
- **Phase 2**: ✅ 100%
- **Phase 3**: ⏳ 0% ← **PROSSIMO**
- **Phase 4-10**: ⏳ 0%

---

## 🔗 Link Utili

- **Repository**: https://github.com/Wawen22/comunimo
- **Supabase Project**: ComUniMo (ID: rlhzsztbkfjpryhlojee)
- **Local Dev**: http://localhost:3000

---

**Buon lavoro! 🚀**

