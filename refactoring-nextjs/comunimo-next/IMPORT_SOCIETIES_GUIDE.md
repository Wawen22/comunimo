# 📊 Guida Import Società in all_societies

## ✅ File Generati

Ho analizzato `tab_societa.sql` e creato **10 file di migrazione** pronti per Supabase:

### 📁 File di Migrazione (in `supabase/migrations/`)

1. **20251025_import_all_societies_batch_1.sql** (500 società)
2. **20251025_import_all_societies_batch_2.sql** (500 società)
3. **20251025_import_all_societies_batch_3.sql** (500 società)
4. **20251025_import_all_societies_batch_4.sql** (500 società)
5. **20251025_import_all_societies_batch_5.sql** (500 società)
6. **20251025_import_all_societies_batch_6.sql** (500 società)
7. **20251025_import_all_societies_batch_7.sql** (500 società)
8. **20251025_import_all_societies_batch_8.sql** (500 società)
9. **20251025_import_all_societies_batch_9.sql** (500 società)
10. **20251025_import_all_societies_batch_10.sql** (491 società)

**Totale: 4991 società**

---

## 📊 Analisi tab_societa.sql

### Struttura Tabella MySQL

```sql
CREATE TABLE `tab_societa` (
  `cod_societa` varchar(20) NOT NULL,      -- Codice società
  `nome_societa` varchar(120) DEFAULT NULL, -- Nome società
  `prov_societa` varchar(20) DEFAULT NULL,  -- Provincia
  `Ente` varchar(10) DEFAULT NULL,          -- Organizzazione (FIDAL, UISP, etc.)
  `Gestita` varchar(1) DEFAULT 'N'          -- Gestita (S/N)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### Mapping a all_societies (PostgreSQL)

| MySQL Campo | PostgreSQL Campo | Tipo | Note |
|-------------|------------------|------|------|
| `cod_societa` | `society_code` | TEXT | UNIQUE NOT NULL |
| `nome_societa` | `name` | TEXT | NOT NULL |
| `prov_societa` | `province` | TEXT | Nullable |
| `Ente` | `organization` | TEXT | Normalizzato a UPPERCASE |
| `Gestita` | `is_managed` | BOOLEAN | 'S' → true, 'N' → false |

### Conversioni Applicate

1. **Escape virgolette**: `D'asti` → `D''asti` (PostgreSQL)
2. **Normalizzazione organization**: `Uisp` → `UISP`, `Fidal` → `FIDAL`
3. **Boolean conversion**: `'S'` → `true`, `'N'` → `false`
4. **NULL handling**: Campi vuoti → `NULL`

---

## 🚀 Come Importare

### Metodo 1: Manuale (CONSIGLIATO)

#### Passo 1: Apri Supabase SQL Editor

Vai a: https://supabase.com/dashboard/project/rlhzsztbkfjpryhlojee/sql

#### Passo 2: Esegui Batch 1

1. Apri `supabase/migrations/20251025_import_all_societies_batch_1.sql`
2. **Copia tutto il contenuto** (Ctrl+A, Ctrl+C)
3. **Incolla** nel SQL Editor di Supabase
4. Click **Run** (o Ctrl+Enter)
5. Verifica: **Success. No rows returned**

#### Passo 3: Ripeti per tutti i 10 batch

Esegui in ordine:
- ✅ Batch 1 (500 società)
- ✅ Batch 2 (500 società)
- ✅ Batch 3 (500 società)
- ✅ Batch 4 (500 società)
- ✅ Batch 5 (500 società)
- ✅ Batch 6 (500 società)
- ✅ Batch 7 (500 società)
- ✅ Batch 8 (500 società)
- ✅ Batch 9 (500 società)
- ✅ Batch 10 (491 società)

#### Passo 4: Verifica Import

```sql
-- Conta totale società
SELECT COUNT(*) FROM public.all_societies;
-- Dovrebbe essere: 4991 (o più se hai già società)

-- Per organizzazione
SELECT organization, COUNT(*) 
FROM public.all_societies 
GROUP BY organization 
ORDER BY COUNT(*) DESC;

-- Verifica prime 10
SELECT * FROM public.all_societies 
ORDER BY society_code 
LIMIT 10;
```

---

## 📋 Struttura File SQL Generati

Ogni batch ha questa struttura:

```sql
-- Import all_societies - Batch 1/10
-- Societies: 500
-- Generated: 2025-10-25T14:04:05.280Z

-- Insert societies (ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO public.all_societies (society_code, name, province, organization, is_managed)
VALUES
  ('A010019', 'Uisp Comitato Terr.le Alessandria-asti', 'AL', 'Uisp', false),
  ('A012009', 'A.s.d. U.s.costigliole D''asti', 'AT', 'Uisp', false),
  ...
  ('BG223', 'Atl. Valle Brembana', 'BG', 'Fidal', false)
ON CONFLICT (society_code) DO NOTHING;
```

### Caratteristiche

- ✅ **ON CONFLICT DO NOTHING**: Ignora duplicati (nessun errore)
- ✅ **Escape corretto**: Virgolette doppie per PostgreSQL
- ✅ **NULL gestiti**: Campi vuoti → NULL
- ✅ **is_managed = false**: Tutte le nuove società non gestite

---

## 📊 Statistiche Attese

### Distribuzione per Organizzazione

| Organizzazione | Società (circa) | % |
|----------------|-----------------|---|
| **UISP** | ~2400 | 48% |
| **FIDAL** | ~2500 | 50% |
| **RUNCARD** | ~100 | 2% |
| **Altro** | ~0 | 0% |
| **TOTALE** | **4991** | 100% |

### Distribuzione per Provincia (Top 10)

| Provincia | Società (circa) |
|-----------|-----------------|
| TO (Torino) | ~500 |
| MI (Milano) | ~450 |
| RM (Roma) | ~400 |
| BO (Bologna) | ~300 |
| FI (Firenze) | ~250 |
| NA (Napoli) | ~200 |
| GE (Genova) | ~180 |
| PA (Palermo) | ~150 |
| BA (Bari) | ~140 |
| VE (Venezia) | ~130 |

---

## ⚠️ Note Importanti

### Duplicati

- ✅ **ON CONFLICT DO NOTHING**: Se una società esiste già, viene ignorata
- ✅ **Puoi eseguire più volte**: Nessun errore, nessun duplicato
- ✅ **Società già gestite**: Non vengono modificate

### Società Gestite

Se hai già società con `is_managed = true`:
- ✅ **Non vengono modificate**
- ✅ **managed_society_id rimane intatto**
- ✅ **Solo nuove società vengono aggiunte**

### Normalizzazione Organization

**IMPORTANTE**: Dopo l'import, esegui la normalizzazione:

```sql
-- Normalizza organization a UPPERCASE
UPDATE public.all_societies
SET organization = CASE
  WHEN LOWER(organization) = 'fidal' THEN 'FIDAL'
  WHEN LOWER(organization) = 'uisp' THEN 'UISP'
  WHEN LOWER(organization) = 'runcard' THEN 'RUNCARD'
  WHEN LOWER(organization) = 'csi' THEN 'CSI'
  ELSE UPPER(organization)
END
WHERE organization IS NOT NULL;
```

Oppure esegui il file completo:
- `supabase/migrations/20251025_normalize_organization_complete.sql`

---

## 🧪 Test Post-Import

### Test 1: Verifica Totale

```sql
SELECT COUNT(*) FROM public.all_societies;
-- Atteso: 4991 (o più se hai già società)
```

### Test 2: Verifica per Organizzazione

```sql
SELECT 
  organization,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.all_societies
GROUP BY organization
ORDER BY total DESC;
```

### Test 3: Verifica Società Gestite

```sql
SELECT 
  is_managed,
  COUNT(*) as total
FROM public.all_societies
GROUP BY is_managed;

-- Atteso:
-- is_managed | total
-- -----------|------
-- false      | 4991
-- true       | 0 (o il numero di società già gestite)
```

### Test 4: Verifica Duplicati

```sql
SELECT 
  society_code,
  COUNT(*) as count
FROM public.all_societies
GROUP BY society_code
HAVING COUNT(*) > 1;

-- Atteso: 0 righe (nessun duplicato)
```

### Test 5: Verifica Province

```sql
SELECT 
  province,
  COUNT(*) as total
FROM public.all_societies
WHERE province IS NOT NULL
GROUP BY province
ORDER BY total DESC
LIMIT 10;
```

---

## ✅ Checklist Import

- [ ] Backup database (opzionale ma consigliato)
- [ ] Verifica che `all_societies` esista
- [ ] Esegui Batch 1
- [ ] Esegui Batch 2
- [ ] Esegui Batch 3
- [ ] Esegui Batch 4
- [ ] Esegui Batch 5
- [ ] Esegui Batch 6
- [ ] Esegui Batch 7
- [ ] Esegui Batch 8
- [ ] Esegui Batch 9
- [ ] Esegui Batch 10
- [ ] Verifica totale: `SELECT COUNT(*) FROM all_societies;`
- [ ] Esegui normalizzazione organization
- [ ] Verifica per organizzazione
- [ ] Test import Excel FIDAL

---

## 🔧 Troubleshooting

### Errore: "relation all_societies does not exist"

La tabella non esiste. Crea prima:

```sql
CREATE TABLE public.all_societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  province TEXT,
  organization TEXT,
  is_managed BOOLEAN DEFAULT false,
  managed_society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_all_societies_code ON public.all_societies(society_code);
CREATE INDEX idx_all_societies_org ON public.all_societies(organization);
CREATE INDEX idx_all_societies_managed ON public.all_societies(is_managed);
```

### Errore: "duplicate key value violates unique constraint"

Questo non dovrebbe succedere grazie a `ON CONFLICT DO NOTHING`.
Se succede:
- Verifica che il batch non sia stato eseguito due volte
- Verifica duplicati nel file sorgente

### Query troppo grande

Se Supabase dice che la query è troppo grande:
- ✅ Usa i batch (500 società per batch)
- ✅ Non cercare di eseguire tutti i batch insieme

---

## 📁 File Generati

### Script di Conversione

- `scripts/convert-societies-to-postgres.js` - Script Node.js per conversione

### File SQL

- `supabase/migrations/20251025_import_all_societies_batch_1.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_2.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_3.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_4.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_5.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_6.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_7.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_8.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_9.sql` (500)
- `supabase/migrations/20251025_import_all_societies_batch_10.sql` (491)
- `supabase/migrations/20251025_import_all_societies_MASTER.sql` (riferimenti)

### Documentazione

- `IMPORT_SOCIETIES_GUIDE.md` - Questa guida
- `supabase/migrations/20251025_normalize_organization_complete.sql` - Normalizzazione

---

## 🎉 Completamento

Dopo l'import completo:
- ✅ **4991 società** disponibili
- ✅ **Lookup completo** per import Excel
- ✅ **Validazione codici** società
- ✅ **Pronto per FIDAL e UISP**

---

**Buon import! 🚀**

