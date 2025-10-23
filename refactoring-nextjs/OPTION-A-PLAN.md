# Piano Dettagliato: Opzione A - Completare Members Management

**Data Creazione**: 2025-10-22  
**Status**: 🟡 IN PROGRESS  
**Obiettivo**: Completare al 100% il modulo Members Management (Phase 5, 7, 8)  
**Progress Target**: 59% → 100% (13 tasks rimanenti)

---

## 🎯 Obiettivo Strategico

Completare il modulo **Members Management** implementando le ultime 3 fasi:
- **Phase 5**: Document Management (scadenze + upload foto)
- **Phase 7**: Bulk Operations (import/export CSV)
- **Phase 8**: Statistics (dashboard metriche)

**Rationale**:
- ✅ Completa un modulo intero prima di passare ad altro
- ✅ Riduce context switching (rimaniamo nel dominio atleti)
- ✅ Permette testing end-to-end completo
- ✅ Valore incrementale ad ogni fase
- ✅ Foundation solida per Eventi/Iscrizioni future

---

## 📊 Effort vs Impact Analysis

| Phase | Tasks | Effort | Impact | Priority | Estimated Time |
|-------|-------|--------|--------|----------|----------------|
| Phase 5 | 3 | MEDIO | ALTO | 1 | 3-4 ore |
| Phase 8 | 2 | BASSO | ALTO | 2 | 1-2 ore |
| Phase 7 | 2 | MEDIO | MEDIO | 3 | 2-3 ore |

**Total Estimated Time**: 6-9 ore di sviluppo

---

## 🗺️ Roadmap Implementazione

### Ordine di Implementazione (Ottimizzato)

```
1. Phase 5.1: Expiry Alert Component       [30 min] ⭐ Foundation
2. Phase 5.2: Expiry Indicators in List    [45 min] ⭐ Usa 5.1
3. Phase 5.3: Photo Upload                 [2 ore] ⭐ Indipendente
   ├─ Supabase Storage setup
   ├─ Upload component
   └─ Integration in form/detail
4. Phase 8.1: Member Stats Component       [1 ora] ⭐ Quick Win
5. Phase 8.2: Stats in Members Page        [30 min] ⭐ Usa 8.1
6. Phase 7.2: Export Utility               [1 ora] ⭐ Più semplice
7. Phase 7.1: Bulk Import Dialog           [2 ore] ⭐ Più complesso
```

**Rationale ordine**:
- Iniziare con foundation (Expiry Alert)
- Quick wins intermedi (Stats) per morale
- Lasciare il più complesso alla fine (Bulk Import)

---

## 📋 Phase 5: Document Management

### 5.1 - Expiry Alert Component ⭐

**File da creare**:
- `components/members/ExpiryAlert.tsx`
- `lib/utils/expiryCheck.ts`

**Funzionalità**:
- Componente riutilizzabile per mostrare stato scadenza
- Input: `expiryDate: Date | null`, `label: string`
- Output: Badge colorato con icona e testo
- Colori:
  - 🔴 Rosso: scaduto (data < oggi)
  - 🟠 Arancione: in scadenza (data < oggi + 30gg)
  - 🟢 Verde: valido (data >= oggi + 30gg)
  - ⚪ Grigio: non disponibile (data = null)

**Utility `expiryCheck.ts`**:
```typescript
export function getExpiryStatus(expiryDate: Date | null): 'expired' | 'expiring' | 'valid' | 'unknown'
export function getDaysUntilExpiry(expiryDate: Date): number
export function formatExpiryDate(expiryDate: Date): string
```

**Pattern**: Simile a `MemberStatusBadge.tsx`

---

### 5.2 - Expiry Indicators in List ⭐

**File da modificare**:
- `components/members/MembersList.tsx`

**Funzionalità**:
- Aggiungere colonna "Scadenze" nella tabella
- Mostrare 2 badge inline:
  - Tessera (card_expiry_date)
  - Certificato Medico (medical_certificate_expiry)
- Tooltip con data esatta al hover
- Verificare filtro "In scadenza" esistente

**UI Design**:
```
| Nome | Società | Scadenze | Azioni |
|------|---------|----------|--------|
| Mario Rossi | ASD Modena | 🟢 Tessera 🔴 Certificato | ... |
```

---

### 5.3 - Photo Upload with Supabase Storage ⭐⭐

**File da creare**:
- `components/members/PhotoUpload.tsx`
- `supabase/storage-policies.sql`

**File da modificare**:
- `components/members/MemberForm.tsx` (step 4)
- `components/members/MemberCard.tsx`
- `components/members/MemberDetail.tsx`

**Supabase Storage Setup**:
1. Creare bucket `member-photos` (public read, authenticated write)
2. RLS policies:
   - SELECT: public (per mostrare foto)
   - INSERT/UPDATE/DELETE: authenticated + admin check
3. Path structure: `{society_code}/{member_id}.jpg`

**PhotoUpload Component**:
- Drag & drop o click to upload
- Preview immagine prima upload
- Validazione:
  - Max size: 5MB
  - Formati: jpg, jpeg, png
  - Dimensioni consigliate: 400x400px
- Crop/resize opzionale (future enhancement)
- Progress bar durante upload
- Error handling

**Integration**:
- `MemberForm.tsx`: campo upload in step 4 (Documenti)
- `MemberCard.tsx`: mostrare foto o placeholder
- `MemberDetail.tsx`: mostrare foto grande in header

**Database**:
- Campo `photo_url` già presente in `members` table ✅
- Salvare URL Supabase Storage

---

## 📋 Phase 7: Bulk Operations

### 7.1 - Bulk Import Dialog ⭐⭐⭐

**File da creare**:
- `components/members/BulkImportDialog.tsx`
- `lib/utils/csvImport.ts`

**File da modificare**:
- `app/(dashboard)/dashboard/members/page.tsx` (add import button)

**Funzionalità**:
1. **Dialog con stepper**:
   - Step 1: Upload CSV/Excel
   - Step 2: Preview e validazione
   - Step 3: Import e report

2. **Template CSV**:
   - Download template con headers
   - Esempio righe con dati validi
   - Commenti con istruzioni

3. **Validazione**:
   - Riutilizzare Zod schema da `MemberForm`
   - Validare ogni riga
   - Report errori con numero riga e campo

4. **Preview**:
   - Tabella con prime 10 righe
   - Highlight errori in rosso
   - Contatori: totali, validi, errori

5. **Import**:
   - Progress bar (X/Y righe importate)
   - Batch insert (10 righe alla volta)
   - Skip righe con errori
   - Report finale: successi, errori, skipped

**CSV Format**:
```csv
first_name,last_name,fiscal_code,birth_date,gender,society_code,organization,...
Mario,Rossi,RSSMRA80A01H501Z,1980-01-01,M,MO123,FIDAL,...
```

**Dependencies**:
- `papaparse` library per CSV parsing
- `xlsx` library per Excel (opzionale)

**Pattern**: Simile a `DeleteMemberDialog.tsx` per dialog structure

---

### 7.2 - Export Utility ⭐

**File da creare**:
- `lib/utils/csvExport.ts`

**File da modificare**:
- `components/members/MembersList.tsx` (export button già presente)

**Funzionalità**:
- Esportare lista atleti corrente (con filtri applicati)
- Formato CSV UTF-8 con BOM (Excel compatibility)
- Colonne: tutti i campi member + society_name (join)
- Filename: `atleti_export_YYYY-MM-DD.csv`
- Download automatico

**Utility `csvExport.ts`**:
```typescript
export function exportMembersToCSV(members: Member[], societies: Society[]): void
export function generateCSVContent(data: any[]): string
export function downloadCSV(content: string, filename: string): void
```

**Dependencies**:
- `papaparse` library (già installata per import)

---

## 📋 Phase 8: Statistics

### 8.1 - Member Stats Component ⭐

**File da creare**:
- `components/members/MemberStats.tsx`

**Funzionalità**:
- Grid di cards con metriche chiave
- Queries Supabase con aggregazioni
- Loading skeleton durante fetch

**Metriche**:
1. **Totale Atleti**: count(*)
2. **Attivi**: count where status = 'active'
3. **Sospesi/Scaduti**: count where status != 'active'
4. **Per Organizzazione**: count group by organization (FIDAL, UISP, CSI, RUNCARD)
5. **Per Categoria**: count group by category (Youth vs Adult)
6. **Scadenze Imminenti**: count where card_expiry < now() + 30 days OR medical_expiry < now() + 30 days

**UI Design**:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Totale      │ Attivi      │ Sospesi     │ In Scadenza │
│ 150         │ 142         │ 8           │ 12          │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────┐
│ Per Organizzazione                                      │
│ FIDAL: 80 | UISP: 50 | CSI: 15 | RUNCARD: 5           │
└─────────────────────────────────────────────────────────┘
```

**Pattern**: Riutilizzare componenti UI esistenti (Card, Badge)

---

### 8.2 - Stats in Members Page ⭐

**File da modificare**:
- `app/(dashboard)/dashboard/members/page.tsx`

**Funzionalità**:
- Integrare `MemberStats` sopra `MembersList`
- Stats aggiornate in base a filtri applicati
- Animazioni smooth (opzionale)

**Layout**:
```
┌─────────────────────────────────────────┐
│ Dashboard Atleti                        │
├─────────────────────────────────────────┤
│ [MemberStats Component]                 │
├─────────────────────────────────────────┤
│ [MembersList Component]                 │
└─────────────────────────────────────────┘
```

---

## 🗂️ File Structure Summary

### File da Creare (7 nuovi file)

```
components/members/
├── ExpiryAlert.tsx              ⭐ Phase 5.1
├── PhotoUpload.tsx              ⭐ Phase 5.3
├── BulkImportDialog.tsx         ⭐ Phase 7.1
└── MemberStats.tsx              ⭐ Phase 8.1

lib/utils/
├── expiryCheck.ts               ⭐ Phase 5.1
├── csvExport.ts                 ⭐ Phase 7.2
└── csvImport.ts                 ⭐ Phase 7.1

supabase/
└── storage-policies.sql         ⭐ Phase 5.3
```

### File da Modificare (5 file esistenti)

```
components/members/
├── MembersList.tsx              ⭐ Phase 5.2, 7.2, 8.2
├── MemberForm.tsx               ⭐ Phase 5.3
├── MemberCard.tsx               ⭐ Phase 5.3
└── MemberDetail.tsx             ⭐ Phase 5.3

app/(dashboard)/dashboard/members/
└── page.tsx                     ⭐ Phase 7.1, 8.2
```

---

## 📦 Dependencies da Installare

```bash
npm install papaparse
npm install --save-dev @types/papaparse

# Opzionale per Excel support
npm install xlsx
npm install --save-dev @types/xlsx
```

---

## ✅ Checklist Implementazione

### Phase 5: Document Management
- [ ] 5.1: Creare ExpiryAlert component + utility
- [ ] 5.2: Aggiungere expiry indicators in MembersList
- [ ] 5.3: Setup Supabase Storage bucket + policies
- [ ] 5.3: Creare PhotoUpload component
- [ ] 5.3: Integrare upload in MemberForm
- [ ] 5.3: Mostrare foto in MemberCard e MemberDetail
- [ ] Test: Verificare scadenze con date passate/future/null
- [ ] Test: Upload foto con file grandi/invalidi

### Phase 7: Bulk Operations
- [ ] 7.1: Installare papaparse dependency
- [ ] 7.1: Creare csvImport utility
- [ ] 7.1: Creare BulkImportDialog component
- [ ] 7.1: Integrare import button in members page
- [ ] 7.1: Creare CSV template scaricabile
- [ ] 7.2: Creare csvExport utility
- [ ] 7.2: Collegare export button esistente
- [ ] Test: Import CSV con errori validazione
- [ ] Test: Export con filtri applicati

### Phase 8: Statistics
- [ ] 8.1: Creare MemberStats component
- [ ] 8.1: Implementare queries aggregazioni
- [ ] 8.2: Integrare stats in members page
- [ ] 8.2: Collegare stats a filtri
- [ ] Test: Verificare conteggi corretti
- [ ] Test: Performance con molti atleti

### Documentation
- [ ] Aggiornare openspec/tasks.md
- [ ] Aggiornare openspec/IMPLEMENTATION-SUMMARY.md
- [ ] Aggiornare NEXT-SESSION-PROMPT.md
- [ ] Creare SESSION-2025-10-22-OPTION-A.md

---

## 🎯 Success Criteria

**Phase 5 Complete quando**:
- ✅ Scadenze visibili in lista con colori corretti
- ✅ Upload foto funziona e foto visibile in card/detail
- ✅ Validazione file upload robusta

**Phase 7 Complete quando**:
- ✅ Import CSV con validazione e report errori
- ✅ Export CSV con tutti i campi e filtri applicati
- ✅ Template CSV scaricabile

**Phase 8 Complete quando**:
- ✅ Dashboard statistiche con tutte le metriche
- ✅ Stats aggiornate in base a filtri
- ✅ Performance accettabile (<1s per calcolo)

**Overall Success**:
- ✅ Members Management al 100% (32/32 tasks)
- ✅ Tutti i test passano
- ✅ Documentazione aggiornata
- ✅ Zero regressioni su funzionalità esistenti

---

## 🚨 Rischi e Mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Supabase Storage policies complesse | MEDIA | ALTO | Testare con admin, documentare bene |
| CSV import con dati malformati | ALTA | MEDIO | Validazione robusta + preview |
| Performance con molte foto | MEDIA | MEDIO | Lazy loading + thumbnails |
| Errori durante bulk import | ALTA | BASSO | Transaction rollback + report |

---

**Next Action**: Iniziare con Phase 5.1 (Expiry Alert Component)

