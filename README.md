# ComUniMo - Refactoring Next.js + Supabase

Refactoring completo dell'applicazione **ComUniMo** (Comitato Unitario Modena) da PHP/CodeIgniter + MySQL a **Next.js 14 + Supabase**.

## 📋 Descrizione

ComUniMo è un'applicazione per la gestione di:
- **Società sportive** con codice società univoco
- **Atleti** appartenenti alle società
- **Iscrizioni alle gare** degli atleti
- **Pagamenti** e **Eventi**

## 🚀 Tech Stack

- **Frontend**: Next.js 14.2+, React 18.3+, TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod
- **Icons**: lucide-react

## 📁 Struttura Progetto

```
refactoring-nextjs/
├── comunimo-next/          # Applicazione Next.js
│   ├── app/                # App Router
│   │   ├── (auth)/         # Route autenticazione
│   │   ├── (dashboard)/    # Route dashboard
│   │   ├── (admin)/        # Route admin
│   │   └── (public)/       # Route pubbliche
│   ├── components/         # Componenti React
│   ├── lib/                # Utilities e hooks
│   ├── supabase/           # Schema database
│   └── ...
├── openspec/               # Documentazione OpenSpec
│   ├── 00-OVERVIEW.md      # Overview completo
│   └── changes/            # Change proposals
└── NEXT-SESSION-PROMPT.md  # Prompt per continuare
```

## ✅ Stato Implementazione

### Completato (31%)

- ✅ **Setup Iniziale**: Next.js 14, TypeScript, Tailwind, Supabase
- ✅ **Autenticazione**: Login, Register, Forgot/Reset Password
- ✅ **Autorizzazione**: RBAC con 3 ruoli (user, admin, super_admin)
- ✅ **Dashboard**: Layout responsive con sidebar e header
- ✅ **Profilo Utente**: Visualizzazione e modifica
- ✅ **Gestione Società**: CRUD completo
- ✅ **Gestione Atleti**: Lista, dettaglio, eliminazione (31% completato)

### In Corso

- ⏳ **Form Atleti**: Creazione e modifica (Phase 3)
- ⏳ **Funzionalità Atletiche**: Categorie, enti, certificati
- ⏳ **Gestione Documenti**: Upload foto, certificati
- ⏳ **Operazioni Bulk**: Import/Export CSV
- ⏳ **Statistiche**: Dashboard con metriche

## 🗄️ Database

Schema completo con 11 tabelle:
- `profiles` - Profili utenti
- `societies` - Società sportive
- `members` - Atleti
- `payments` - Pagamenti
- `events` - Eventi/Gare
- `event_registrations` - Iscrizioni gare
- `organizations` - Enti (FIDAL, UISP, CSI, RUNCARD)
- `categories` - Categorie atletiche
- `medical_certificates` - Certificati medici
- `event_specialties` - Specialità eventi
- `all_societies` - Lookup società
- `bib_number_sequences` - Numerazione pettorale

## 🔐 Sicurezza

- **RLS (Row Level Security)** su tutte le tabelle
- **SECURITY DEFINER functions** per evitare ricorsione
- **Client-side authentication** con Supabase
- **Role-based access control** (RBAC)

## 🚀 Quick Start

```bash
cd refactoring-nextjs/comunimo-next
npm install
cp .env.example .env.local
# Configura le variabili d'ambiente
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 📚 Documentazione

- **Overview**: `openspec/00-OVERVIEW.md`
- **Implementazione Atleti**: `openspec/changes/implement-members-management/`
- **Prompt Prossima Sessione**: `NEXT-SESSION-PROMPT.md`

## 🎯 Prossimi Step

1. Implementare form multi-step per creazione/modifica atleti
2. Aggiungere auto-assegnazione categoria
3. Implementare upload documenti
4. Creare dashboard statistiche
5. Aggiungere import/export CSV

## 📊 Progress

- **Phase 1**: ✅ 100% (Lista atleti)
- **Phase 2**: ✅ 100% (Dettaglio atleta)
- **Phase 3**: ⏳ 0% (Form)
- **Phase 4-10**: ⏳ 0%

**Totale**: 31% (10/32 tasks)

## 👥 Team

- **Developer**: Moez Nebili
- **Organization**: Comitato Unitario Modena

## 📝 License

Proprietario - Comitato Unitario Modena

---

**Ultimo aggiornamento**: 2025-10-20

