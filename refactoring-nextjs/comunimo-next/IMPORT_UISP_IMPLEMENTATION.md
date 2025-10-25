# Import UISP - Implementazione Completa

## 📋 **RIEPILOGO IMPLEMENTAZIONE**

Data: 2025-10-25

### 🎯 **Obiettivo**

Implementare l'import massivo di atleti UISP da file Excel, supportando le colonne specifiche UISP e gestendo le differenze rispetto al formato FIDAL.

---

## 📊 **CONFRONTO FIDAL vs UISP**

| Campo Database | FIDAL Excel | UISP Excel | Note |
|----------------|-------------|------------|------|
| `last_name` | COGNOME | **Cognome** | ✅ Stesso campo |
| `first_name` | NOME | **Nome** | ✅ Stesso campo |
| `birth_date` | DATA_NAS | **Data nascita** | ✅ Stesso campo |
| `gender` | CATEG (2° lettera) | **Sesso** (M/F) | ⚠️ **DIVERSO**: UISP ha campo diretto |
| `membership_number` | NUM_TES | **N° tess.** | ✅ Stesso campo |
| `card_date` | DAT_MOV | **Data tessera** | ✅ Rinominato da `fidal_card_date` |
| `society_code` | COD_SOC | **Cod. affiliata** | ✅ Stesso campo |
| `society_name` | SOCIETA | **Ragione sociale** | ✅ Stesso campo |
| `medical_certificate_expiry` | ❌ Non presente | **Scad. certificato** | ✅ **NUOVO** per UISP |
| `system_date` | DAT_SYS | ❌ Non presente | ⚠️ Solo FIDAL |

---

## 🛠️ **MODIFICHE IMPLEMENTATE**

### **1. Database Schema**

#### **Migration SQL**: `20251025_rename_fidal_columns_to_generic.sql`

```sql
-- Rinominare colonne FIDAL-specific in generiche
ALTER TABLE members 
  RENAME COLUMN fidal_card_date TO card_date;

ALTER TABLE members 
  RENAME COLUMN fidal_system_date TO system_date;

-- Aggiornare commenti
COMMENT ON COLUMN members.card_date IS 'Data movimento/tessera (DAT_MOV per FIDAL, Data tessera per UISP)';
COMMENT ON COLUMN members.system_date IS 'Data inserimento sistema (DAT_SYS per FIDAL)';
```

**Motivo**: Rendere i campi generici per supportare sia FIDAL che UISP.

---

### **2. TypeScript Types**

#### **File**: `lib/types/database.ts`

**Prima**:
```typescript
fidal_card_date: string | null;
fidal_system_date: string | null;
```

**Dopo**:
```typescript
card_date: string | null;                       // Data movimento/tessera (DAT_MOV per FIDAL, Data tessera per UISP)
system_date: string | null;                     // Data inserimento sistema (DAT_SYS per FIDAL)
```

---

### **3. Utility Functions UISP**

#### **File**: `lib/utils/excelImport.ts`

#### **A. Interface UISPRow**

```typescript
export interface UISPRow {
  'Cognome': string;
  'Nome': string;
  'Data nascita': string | number | Date;
  'Sesso': string;                          // M or F
  'N° tess.': string | number;
  'Data tessera': string | number | Date;
  'Cod. affiliata': string | number;
  'Ragione sociale': string;
  'Scad. certificato'?: string | number | Date;
  // Optional fields
  'Codice fiscale'?: string;
  'Telefono'?: string | number;
  'Cellulare'?: string | number;
  'Email'?: string;
  'Indirizzo'?: string;
  'N° civ.'?: string | number;
  'Cap'?: string | number;
  'Comune'?: string;
  'Categoria'?: string;
  [key: string]: any;  // Allow other fields
}
```

#### **B. Zod Schema**

```typescript
const uispRowSchema = z.object({
  'Cognome': z.string().min(1, 'Cognome obbligatorio'),
  'Nome': z.string().min(1, 'Nome obbligatorio'),
  'Data nascita': z.union([z.string(), z.number(), z.date()]).optional(),
  'Sesso': z.string().min(1, 'Sesso obbligatorio'),
  'N° tess.': z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Numero tessera obbligatorio')),
  'Data tessera': z.union([z.string(), z.number(), z.date()]).optional(),
  'Cod. affiliata': z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Codice affiliata obbligatorio')),
  'Ragione sociale': z.string().min(1, 'Ragione sociale obbligatoria'),
  'Scad. certificato': z.union([z.string(), z.number(), z.date(), z.undefined()]).optional(),
  // ... altri campi opzionali
}).passthrough();
```

#### **C. Transform Function**

```typescript
export function transformUISPToMember(row: UISPRow): Partial<Member> {
  // Normalize gender (M or F)
  const gender = row['Sesso']?.toString().toUpperCase().trim();
  const normalizedGender: 'M' | 'F' = gender === 'F' ? 'F' : 'M';

  // Combine address fields
  let fullAddress = row['Indirizzo'] || '';
  if (row['N° civ.']) {
    fullAddress += fullAddress ? `, ${row['N° civ.']}` : String(row['N° civ.']);
  }

  // Use mobile if available, otherwise phone
  const phone = row['Cellulare'] ? String(row['Cellulare']) : (row['Telefono'] ? String(row['Telefono']) : null);
  const mobile = row['Cellulare'] ? String(row['Cellulare']) : null;

  return {
    first_name: row['Nome'],
    last_name: row['Cognome'],
    birth_date: parseDate(row['Data nascita']),
    gender: normalizedGender,
    membership_number: String(row['N° tess.']),
    society_code: String(row['Cod. affiliata']),
    card_date: parseDate(row['Data tessera']),
    medical_certificate_expiry: parseDate(row['Scad. certificato']),
    organization: 'UISP',
    fiscal_code: row['Codice fiscale'] ? String(row['Codice fiscale']) : null,
    phone: phone,
    mobile: mobile,
    email: row['Email'] ? String(row['Email']) : null,
    address: fullAddress || null,
    postal_code: row['Cap'] ? String(row['Cap']) : null,
    city: row['Comune'] ? String(row['Comune']) : null,
    category: row['Categoria'] ? String(row['Categoria']) : null,
    is_foreign: false, // UISP doesn't have this field
  };
}
```

#### **D. Parse Function**

```typescript
export async function parseUISPExcel(file: File): Promise<ParsedUISPData[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
    dense: false,
    WTF: false,
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: UISPRow[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,
    defval: '',
    blankrows: false,
  });

  const parsedData: ParsedUISPData[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    try {
      uispRowSchema.parse(row);
      const memberData = transformUISPToMember(row);
      memberFromUISPSchema.parse(memberData);
      parsedData.push({
        rowNumber,
        data: memberData,
        isValid: true,
        errors: [],
      });
    } catch (error) {
      // Handle validation errors
    }
  });

  return parsedData;
}
```

#### **E. Upsert Function**

```typescript
export async function upsertMemberFromUISP(
  memberData: Partial<Member>
): Promise<{ success: boolean; action: 'inserted' | 'updated'; error?: string }> {
  try {
    // 1. Lookup society in all_societies
    let allSociety = await lookupSociety(memberData.society_code!);

    // 2. Create society if not exists
    if (!allSociety) {
      allSociety = await createSociety(
        memberData.society_code!,
        `Società ${memberData.society_code}`,
        'UISP'
      );
    }

    // 3. Get or create managed society
    let societyId: string | null = null;
    if (allSociety) {
      societyId = await getOrCreateManagedSociety(allSociety);
    }

    // 4. Check if member exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('membership_number', memberData.membership_number!)
      .maybeSingle();

    // 5. Prepare member data
    const finalData = {
      ...memberData,
      society_id: societyId,
      membership_status: 'active' as const,
      is_active: true,
    };

    // 6. Upsert
    if (existing) {
      const { error } = await supabase
        .from('members')
        .update(finalData)
        .eq('id', existing.id);
      if (error) throw error;
      return { success: true, action: 'updated' };
    } else {
      const { error } = await supabase
        .from('members')
        .insert(finalData);
      if (error) throw error;
      return { success: true, action: 'inserted' };
    }
  } catch (error: any) {
    return { success: false, action: 'inserted', error: error.message };
  }
}
```

---

### **4. UI Component**

#### **File**: `components/members/BulkImportExcelDialog.tsx`

#### **Modifiche**:

1. **Import aggiornati**:
```typescript
import {
  parseFIDALExcel,
  parseUISPExcel,
  upsertMemberFromFIDAL,
  upsertMemberFromUISP,
  type ParsedFIDALData,
  type ParsedUISPData,
  type ImportResult,
} from '@/lib/utils/excelImport';
```

2. **State aggiornato**:
```typescript
const [parsedData, setParsedData] = useState<ParsedFIDALData[] | ParsedUISPData[]>([]);
```

3. **File parsing**:
```typescript
if (importType === 'FIDAL') {
  const parsed = await parseFIDALExcel(selectedFile);
  setParsedData(parsed);
} else if (importType === 'UISP') {
  const parsed = await parseUISPExcel(selectedFile);
  setParsedData(parsed);
}
```

4. **Upsert dinamico**:
```typescript
const result = importType === 'FIDAL' 
  ? await upsertMemberFromFIDAL(item.data)
  : await upsertMemberFromUISP(item.data);
```

5. **Pulsante UISP abilitato**:
```typescript
<Button
  variant="outline"
  className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
  onClick={() => handleSelectType('UISP')}
>
  <FileSpreadsheet className="h-12 w-12 text-primary" />
  <div>
    <div className="font-semibold">Import UISP</div>
    <div className="text-xs text-muted-foreground">40 colonne</div>
  </div>
</Button>
```

---

## ✅ **CHECKLIST IMPLEMENTAZIONE**

- [x] **Database Schema**: Rinominare `fidal_card_date` → `card_date`, `fidal_system_date` → `system_date`
- [x] **TypeScript Types**: Aggiornare `database.ts` con nuovi nomi
- [x] **UISP Interface**: Creare `UISPRow` interface
- [x] **UISP Schema**: Creare Zod schema `uispRowSchema`
- [x] **Transform Function**: Implementare `transformUISPToMember()`
- [x] **Parse Function**: Implementare `parseUISPExcel()`
- [x] **Upsert Function**: Implementare `upsertMemberFromUISP()`
- [x] **UI Component**: Aggiornare `BulkImportExcelDialog` per supportare UISP
- [x] **Pulsante UISP**: Abilitare pulsante Import UISP
- [x] **Codice FIDAL**: Aggiornare riferimenti a `fidal_card_date` e `fidal_system_date`

---

## 🧪 **TESTING**

### **Test 1: Eseguire Migration SQL**

```bash
# In Supabase SQL Editor
-- Eseguire: supabase/migrations/20251025_rename_fidal_columns_to_generic.sql
```

### **Test 2: Import UISP**

1. Vai a `/dashboard/members`
2. Click su "Importa" → "Importa Excel (FIDAL/UISP)"
3. Seleziona "Import UISP"
4. Carica file Excel UISP
5. Verifica anteprima dati
6. Conferma import
7. Verifica risultati

### **Test 3: Verifica Campi**

- ✅ Sesso: Deve essere M o F (non estratto da categoria)
- ✅ Data tessera: Deve essere in `card_date`
- ✅ Scadenza certificato: Deve essere in `medical_certificate_expiry`
- ✅ Organizzazione: Deve essere "UISP"
- ✅ Società: Deve essere creata automaticamente se non esiste

---

## 📝 **NOTE TECNICHE**

### **Differenze Chiave FIDAL vs UISP**

1. **Sesso**:
   - FIDAL: Estratto da categoria (2° lettera: SM55 → M, SF40 → F)
   - UISP: Campo diretto "Sesso" (M o F)

2. **Certificato Medico**:
   - FIDAL: Non presente
   - UISP: Campo "Scad. certificato" con data scadenza

3. **Data Sistema**:
   - FIDAL: Campo "DAT_SYS" (data inserimento sistema)
   - UISP: Non presente

4. **Indirizzo**:
   - FIDAL: Campo singolo "INDI"
   - UISP: Due campi "Indirizzo" + "N° civ." (combinati)

5. **Telefono**:
   - FIDAL: Campo singolo "TEL_ATL"
   - UISP: Due campi "Telefono" + "Cellulare" (priorità a Cellulare)

---

## 🎯 **PROSSIMI PASSI**

1. **Eseguire Migration SQL** in Supabase
2. **Testare Import UISP** con file reale
3. **Verificare Certificati Medici** nella tabella atleti
4. **Documentare Formato Excel UISP** per utenti finali
5. **Creare Guida Utente** per import UISP

---

**Implementazione completata! 🎉**

