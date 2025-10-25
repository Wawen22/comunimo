# Design: Import Massivo Atleti FIDAL/UISP da Excel

**Status**: ✅ Approved  
**Created**: 2025-10-25  
**Updated**: 2025-10-25  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  User Interface (Next.js 14 App Router)                     │
│  ├── MembersList.tsx                                        │
│  │   └── "Importa Excel" Button → Dropdown (FIDAL/UISP)    │
│  └── BulkImportExcelDialog.tsx (Multi-step wizard)         │
│      ├── Step 1: Select import type (FIDAL/UISP)           │
│      ├── Step 2: Upload Excel file                         │
│      ├── Step 3: Preview & validation                      │
│      ├── Step 4: Import with progress bar                  │
│      └── Step 5: Final report                              │
├─────────────────────────────────────────────────────────────┤
│  Business Logic (TypeScript)                                │
│  └── lib/utils/excelImport.ts                              │
│      ├── parseFIDALExcel(file) → ParsedData[]              │
│      ├── validateFIDALRow(row) → ValidationResult          │
│      ├── upsertMemberFromFIDAL(row) → Promise<void>        │
│      └── lookupSociety(code) → AllSociety | null           │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                             │
│  ├── all_societies (lookup table - 842 rows)               │
│  │   ├── society_code (UNIQUE)                             │
│  │   ├── name, province, organization                      │
│  │   ├── is_managed (boolean)                              │
│  │   └── managed_society_id (FK → societies)              │
│  └── members (athletes)                                     │
│      ├── membership_number (UNIQUE) ← Upsert key           │
│      ├── society_code (FK → all_societies)                 │
│      ├── fidal_card_date (NEW)                             │
│      └── fidal_system_date (NEW)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### 1. Database Schema

#### **all_societies** (Lookup Table)

```sql
CREATE TABLE public.all_societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_code TEXT UNIQUE NOT NULL,      -- Codice società (es: "MO497")
  name TEXT NOT NULL,                     -- Nome società
  province TEXT,                          -- Provincia (es: "MO")
  organization TEXT,                      -- Ente (FIDAL, UISP, RUNCARD)
  is_managed BOOLEAN DEFAULT false,       -- Gestita dalla web app
  managed_society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_all_societies_code ON all_societies(society_code);
CREATE INDEX idx_all_societies_managed ON all_societies(is_managed);
CREATE INDEX idx_all_societies_organization ON all_societies(organization);
```

**Purpose**: 
- Contiene TUTTE le società (gestite + non gestite)
- Permette import atleti anche con società non gestite
- Collegamento a `societies` per società gestite

**Data**:
- ✅ 842 società pre-caricate da `tab_societa.sql`

#### **members** (Athletes) - New Columns

```sql
ALTER TABLE members 
ADD COLUMN fidal_card_date DATE,
ADD COLUMN fidal_system_date DATE;

COMMENT ON COLUMN members.fidal_card_date IS 'Data movimento/tessera FIDAL (DAT_MOV)';
COMMENT ON COLUMN members.fidal_system_date IS 'Data inserimento sistema FIDAL (DAT_SYS)';
```

---

### 2. TypeScript Types

#### **AllSociety**

```typescript
export interface AllSociety {
  id: string;
  society_code: string;               // Codice società
  name: string;                       // Nome società
  province: string | null;            // Provincia
  organization: string | null;        // Ente (FIDAL, UISP, etc.)
  is_managed: boolean;                // Gestita da noi
  managed_society_id: string | null;  // FK to societies
  created_at: string;
  updated_at: string;
}
```

#### **FIDALRow** (Excel Row)

```typescript
export interface FIDALRow {
  CODE_REG: string;      // Codice regionale (es: "EMI")
  SGR_PROV: string;      // Sigla provincia (es: "R")
  SETTORE: string;       // Settore (es: "A")
  CATEG: string;         // Categoria (es: "SM55")
  FL_RIN: string;        // Flag rinnovo (es: "R")
  COD_SOC: string;       // Codice società (es: "MO497")
  DAT_MOV: string;       // Data tessera (es: "10/12/2024")
  NUM_TES: string;       // Numero tessera (es: "AA000326")
  COGN: string;          // Cognome
  NOME: string;          // Nome
  LOC_NAS: string;       // Località nascita
  DAT_NAS: string;       // Data nascita (es: "22/07/1997")
  STRAN: string;         // Straniero (es: "S" o "I")
  TEL_ATL: string;       // Telefono atleta
  DAT_SYS: string;       // Data sistema FIDAL (es: "22/02/2010")
  INDI: string;          // Indirizzo
  CAP: string;           // CAP
  LOCA: string;          // Località
  PROV: string;          // Provincia
  COD_FISC: string;      // Codice fiscale
  COD_PROF: string;      // Codice professione
  FAS_INT: string;       // Fascia interesse
  MILITARE: string;      // Militare
  SOCPROV: string;       // Società provincia
}
```

#### **ParsedFIDALData**

```typescript
export interface ParsedFIDALData {
  rowNumber: number;
  data: Partial<Member>;
  isValid: boolean;
  errors: string[];
}
```

---

### 3. Validation Schema (Zod)

```typescript
const fidalRowSchema = z.object({
  NUM_TES: z.string().min(1, 'Numero tessera obbligatorio'),
  COD_SOC: z.string().min(1, 'Codice società obbligatorio'),
  COGN: z.string().min(1, 'Cognome obbligatorio'),
  NOME: z.string().min(1, 'Nome obbligatorio'),
  DAT_NAS: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data nascita formato DD/MM/YYYY'),
  CATEG: z.string().min(2, 'Categoria obbligatoria (min 2 caratteri)'),
  LOC_NAS: z.string().optional(),
  CODE_REG: z.string().optional(),
  DAT_MOV: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).optional(),
  DAT_SYS: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).optional(),
});

const memberFromFIDALSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  birth_date: z.string(),
  birth_place: z.string().optional(),
  gender: z.enum(['M', 'F']),
  membership_number: z.string().min(1),
  society_code: z.string().min(1),
  regional_code: z.string().optional(),
  category: z.string().optional(),
  fidal_card_date: z.string().optional(),
  fidal_system_date: z.string().optional(),
  organization: z.literal('FIDAL'),
});
```

---

## Component Specifications

### 1. BulkImportExcelDialog.tsx

**Props**:
```typescript
interface BulkImportExcelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State**:
```typescript
const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
const [importType, setImportType] = useState<'FIDAL' | 'UISP' | null>(null);
const [file, setFile] = useState<File | null>(null);
const [parsedData, setParsedData] = useState<ParsedFIDALData[]>([]);
const [isProcessing, setIsProcessing] = useState(false);
const [progress, setProgress] = useState(0);
const [result, setResult] = useState<ImportResult | null>(null);
```

**Steps**:

#### Step 1: Select Import Type
```tsx
<div className="space-y-4">
  <h3>Seleziona Tipo Import</h3>
  <div className="grid grid-cols-2 gap-4">
    <Button onClick={() => { setImportType('FIDAL'); setStep(2); }}>
      <FileSpreadsheet className="mr-2" />
      Import FIDAL
    </Button>
    <Button onClick={() => { setImportType('UISP'); setStep(2); }} disabled>
      <FileSpreadsheet className="mr-2" />
      Import UISP (Coming Soon)
    </Button>
  </div>
</div>
```

#### Step 2: Upload Excel
```tsx
<div className="space-y-4">
  <h3>Carica File Excel FIDAL</h3>
  <Input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleFileSelect}
  />
  <p className="text-sm text-gray-500">
    Formato atteso: 24 colonne (CODE_REG, SGR_PROV, SETTORE, ...)
  </p>
</div>
```

#### Step 3: Preview & Validation
```tsx
<div className="space-y-4">
  <h3>Anteprima Dati</h3>
  <div className="stats">
    <div>Totale: {parsedData.length}</div>
    <div>Validi: {validCount}</div>
    <div>Errori: {errorCount}</div>
  </div>
  <Table>
    {/* Show first 10 rows + errors */}
  </Table>
  <Button onClick={handleImport}>Conferma Import</Button>
</div>
```

#### Step 4: Import Progress
```tsx
<div className="space-y-4">
  <h3>Import in Corso...</h3>
  <Progress value={progress} />
  <p>{progress}% completato</p>
</div>
```

#### Step 5: Final Report
```tsx
<div className="space-y-4">
  <h3>Report Import</h3>
  <div className="stats">
    <div>✅ Inseriti: {result.inserted}</div>
    <div>🔄 Aggiornati: {result.updated}</div>
    <div>❌ Errori: {result.errors}</div>
  </div>
  {result.errorDetails.length > 0 && (
    <div>
      <h4>Dettaglio Errori:</h4>
      <ul>
        {result.errorDetails.map(err => (
          <li key={err.row}>Riga {err.row}: {err.message}</li>
        ))}
      </ul>
    </div>
  )}
  <Button onClick={onSuccess}>Chiudi</Button>
</div>
```

---

## Utility Functions

### lib/utils/excelImport.ts

```typescript
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';

/**
 * Parse FIDAL Excel file
 */
export async function parseFIDALExcel(file: File): Promise<ParsedFIDALData[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: FIDALRow[] = XLSX.utils.sheet_to_json(worksheet);

  const parsedData: ParsedFIDALData[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header + 1-based

    try {
      // Validate row
      fidalRowSchema.parse(row);

      // Transform to Member data
      const memberData = transformFIDALToMember(row);

      // Validate member data
      memberFromFIDALSchema.parse(memberData);

      parsedData.push({
        rowNumber,
        data: memberData,
        isValid: true,
        errors: [],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        parsedData.push({
          rowNumber,
          data: {},
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      }
    }
  });

  return parsedData;
}

/**
 * Transform FIDAL row to Member data
 */
function transformFIDALToMember(row: FIDALRow): Partial<Member> {
  return {
    first_name: row.NOME,
    last_name: row.COGN,
    birth_date: parseDate(row.DAT_NAS),
    birth_place: row.LOC_NAS || null,
    gender: row.CATEG[1] as 'M' | 'F', // 2nd letter
    membership_number: row.NUM_TES,
    society_code: row.COD_SOC,
    regional_code: row.CODE_REG || null,
    category: row.CATEG,
    fidal_card_date: row.DAT_MOV ? parseDate(row.DAT_MOV) : null,
    fidal_system_date: row.DAT_SYS ? parseDate(row.DAT_SYS) : null,
    organization: 'FIDAL',
  };
}

/**
 * Parse date from DD/MM/YYYY to YYYY-MM-DD
 */
function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Lookup society in all_societies
 */
export async function lookupSociety(code: string): Promise<AllSociety | null> {
  const { data, error } = await supabase
    .from('all_societies')
    .select('*')
    .eq('society_code', code)
    .single();

  if (error) return null;
  return data;
}

/**
 * Upsert member from FIDAL data
 */
export async function upsertMemberFromFIDAL(
  memberData: Partial<Member>
): Promise<{ success: boolean; action: 'inserted' | 'updated'; error?: string }> {
  try {
    // 1. Lookup society
    let society = await lookupSociety(memberData.society_code!);

    // 2. Create society if not exists
    if (!society) {
      const { data: newSociety } = await supabase
        .from('all_societies')
        .insert({
          society_code: memberData.society_code,
          name: `Società ${memberData.society_code}`,
          organization: 'FIDAL',
          is_managed: false,
        })
        .select()
        .single();

      society = newSociety;
    }

    // 3. Check if member exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('membership_number', memberData.membership_number!)
      .single();

    // 4. Prepare member data
    const finalData = {
      ...memberData,
      society_id: society?.is_managed ? society.managed_society_id : null,
    };

    // 5. Upsert
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

## Flow Diagram

```mermaid
graph TD
    A[User clicks "Importa Excel"] --> B[Select FIDAL/UISP]
    B --> C[Upload Excel file]
    C --> D[Parse Excel with XLSX]
    D --> E[Validate each row with Zod]
    E --> F{All valid?}
    F -->|Yes| G[Show preview]
    F -->|No| H[Show errors + valid rows]
    H --> G
    G --> I[User confirms]
    I --> J[Start import]
    J --> K[For each valid row]
    K --> L[Lookup society]
    L --> M{Society exists?}
    M -->|No| N[Create society in all_societies]
    M -->|Yes| O[Continue]
    N --> O
    O --> P{Member exists?}
    P -->|Yes| Q[UPDATE member]
    P -->|No| R[INSERT member]
    Q --> S[Next row]
    R --> S
    S --> T{More rows?}
    T -->|Yes| K
    T -->|No| U[Show final report]
    U --> V[Close dialog]
```

---

## Error Handling

| Error Type | Handling | User Message |
|------------|----------|--------------|
| Invalid file format | Catch, show error | "File non valido. Seleziona un file Excel (.xlsx, .xls)" |
| Missing columns | Validation error | "Colonne mancanti: NUM_TES, COD_SOC, ..." |
| Invalid date format | Validation error | "Riga X: Data nascita formato errato (atteso DD/MM/YYYY)" |
| Duplicate membership_number | Upsert (update) | Info: "Atleta aggiornato" |
| Society not found | Auto-create | Info: "Società creata automaticamente" |
| Database error | Catch, log, show error | "Errore durante l'import. Riprova." |

---

## Performance Considerations

- **Batch processing**: Import 10 rows at a time
- **Progress updates**: Update UI every batch
- **Async operations**: Use Promise.all for parallel lookups
- **Memory**: Stream large files (if > 1000 rows)
- **Timeout**: Set max 5 minutes for import

---

## Testing Strategy

1. **Unit tests**: Validation functions, date parsing
2. **Integration tests**: Upsert logic, society lookup
3. **E2E tests**: Full import flow with test file
4. **Performance tests**: 100+ rows import
5. **Error tests**: Invalid data, missing columns

---

## Security

- ✅ RLS policies on `all_societies` (anyone can view, admins can manage)
- ✅ RLS policies on `members` (existing)
- ✅ File validation (only .xlsx, .xls)
- ✅ Input sanitization (Zod validation)
- ✅ Admin-only access to import feature

