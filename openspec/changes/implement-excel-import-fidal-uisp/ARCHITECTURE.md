# Architettura Società - Due Tabelle

## 📊 Overview

Il sistema utilizza **due tabelle separate** per gestire le società:

1. **`all_societies`** - Tabella di lookup (read-only)
2. **`societies`** - Tabella di gestione (read-write)

---

## 🗄️ Tabelle

### 1. `all_societies` (Lookup Table)

**Scopo**: Tabella di riferimento con TUTTE le società FIDAL/UISP/RUNCARD

**Caratteristiche**:
- ✅ Contiene 842+ società (importate da database FIDAL)
- ✅ Read-only (aggiornata periodicamente da fonti esterne)
- ✅ Usata per validare codici società durante import Excel
- ✅ Minimalista (solo dati essenziali)

**Schema**:
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
```

**Esempio dati**:
```
| society_code | name                    | province | organization | is_managed | managed_society_id |
|--------------|-------------------------|----------|--------------|------------|--------------------|
| MO497        | ASD MODENA RUNNERS      | MO       | FIDAL        | true       | abc-123-def-456    |
| BO123        | POL. CASALECCHIO        | BO       | FIDAL        | false      | null               |
| MO001U       | UISP MODENA             | MO       | UISP         | true       | xyz-789-ghi-012    |
```

---

### 2. `societies` (Managed Table)

**Scopo**: Società effettivamente gestite dalla web app

**Caratteristiche**:
- ✅ Contiene solo società gestite dall'applicazione
- ✅ Read-write (create, update, delete)
- ✅ Dettagli completi (indirizzo, email, P.IVA, logo, etc.)
- ✅ Relazione FK con `members`, `profiles`, `events`

**Schema**:
```sql
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  society_code TEXT UNIQUE,               -- Codice società (es: "MO497")
  organization TEXT,                      -- Ente (FIDAL, UISP, CSI, RUNCARD)
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  vat_number TEXT UNIQUE,
  fiscal_code TEXT,
  legal_representative TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

**Esempio dati**:
```
| id              | society_code | name                | organization | email                  | phone      |
|-----------------|--------------|---------------------|--------------|------------------------|------------|
| abc-123-def-456 | MO497        | ASD MODENA RUNNERS  | FIDAL        | info@modenarunners.it  | 059123456  |
| xyz-789-ghi-012 | MO001U       | UISP MODENA         | UISP         | modena@uisp.it         | 059654321  |
```

---

## 🔗 Relazione tra le Tabelle

### Link Bidirezionale

```
all_societies.managed_society_id → societies.id
```

**Quando una società viene gestita**:
1. Viene creata in `societies`
2. `all_societies.managed_society_id` viene aggiornato con `societies.id`
3. `all_societies.is_managed` viene impostato a `true`

**Query per vedere la relazione**:
```sql
SELECT 
  a.society_code,
  a.name as lookup_name,
  a.is_managed,
  s.id as managed_id,
  s.name as managed_name,
  s.email,
  s.phone
FROM all_societies a
LEFT JOIN societies s ON a.managed_society_id = s.id
WHERE a.organization = 'FIDAL'
ORDER BY a.society_code;
```

---

## 🔄 Flusso di Import Excel

### Scenario 1: Società già gestita

```
1. Import Excel → COD_SOC = "MO497"
2. Lookup in all_societies → Trovata
3. all_societies.managed_society_id = "abc-123-def-456"
4. Usa society_id = "abc-123-def-456"
5. Importa atleta con society_id
```

### Scenario 2: Società in all_societies ma non gestita

```
1. Import Excel → COD_SOC = "BO123"
2. Lookup in all_societies → Trovata
3. all_societies.managed_society_id = null
4. Crea in societies → id = "new-123-456"
5. Aggiorna all_societies.managed_society_id = "new-123-456"
6. Aggiorna all_societies.is_managed = true
7. Usa society_id = "new-123-456"
8. Importa atleta con society_id
```

### Scenario 3: Società non in all_societies

```
1. Import Excel → COD_SOC = "RE999"
2. Lookup in all_societies → Non trovata
3. Crea in all_societies → { society_code: "RE999", name: "Società RE999", organization: "FIDAL" }
4. Crea in societies → id = "new-789-012"
5. Aggiorna all_societies.managed_society_id = "new-789-012"
6. Aggiorna all_societies.is_managed = true
7. Usa society_id = "new-789-012"
8. Importa atleta con society_id
```

---

## 🎯 Vantaggi dell'Architettura

### Separazione delle Responsabilità

| Aspetto | all_societies | societies |
|---------|---------------|-----------|
| **Scopo** | Lookup/Validazione | Gestione |
| **Dati** | Minimi (code, name, province) | Completi (tutti i dettagli) |
| **Fonte** | Esterna (FIDAL/UISP) | Interna (web app) |
| **Aggiornamento** | Periodico (import) | Continuo (CRUD) |
| **Dimensione** | 842+ società | Solo gestite (~10-50) |
| **Relazioni FK** | Nessuna | members, profiles, events |

### Performance

- ✅ `all_societies` piccola e veloce per lookup
- ✅ `societies` contiene solo dati necessari
- ✅ Indici su `society_code` in entrambe le tabelle
- ✅ Nessun JOIN necessario per operazioni comuni

### Manutenibilità

- ✅ Chiara separazione tra dati esterni e interni
- ✅ Facile aggiornare `all_societies` da fonti esterne
- ✅ `societies` gestita completamente dall'app
- ✅ Nessun rischio di sovrascrivere dati gestiti

---

## 🔍 Query Utili

### Società gestite

```sql
SELECT 
  s.*,
  a.organization
FROM societies s
JOIN all_societies a ON s.id = a.managed_society_id
WHERE s.is_active = true;
```

### Società non ancora gestite

```sql
SELECT *
FROM all_societies
WHERE is_managed = false
  AND organization = 'FIDAL'
ORDER BY society_code;
```

### Atleti per società

```sql
SELECT 
  m.first_name,
  m.last_name,
  m.membership_number,
  s.name as society_name,
  s.society_code
FROM members m
JOIN societies s ON m.society_id = s.id
WHERE s.society_code = 'MO497';
```

### Statistiche società

```sql
SELECT 
  s.society_code,
  s.name,
  COUNT(m.id) as total_members
FROM societies s
LEFT JOIN members m ON s.id = m.society_id
GROUP BY s.id, s.society_code, s.name
ORDER BY total_members DESC;
```

---

## 📝 Best Practices

### Import Excel

1. ✅ Sempre fare lookup in `all_societies` prima
2. ✅ Creare in `societies` solo se necessario
3. ✅ Aggiornare `managed_society_id` dopo creazione
4. ✅ Usare sempre `society_id` (non `society_code`) in `members`

### Gestione Società

1. ✅ Creare in `societies` tramite UI
2. ✅ Se esiste in `all_societies`, aggiornare `managed_society_id`
3. ✅ Usare `society_code` come identificatore univoco
4. ✅ Mantenere sincronizzati `societies.society_code` e `all_societies.society_code`

### Aggiornamento all_societies

1. ✅ Importare nuove società da FIDAL/UISP periodicamente
2. ✅ Non sovrascrivere `managed_society_id` esistenti
3. ✅ Verificare duplicati prima dell'import
4. ✅ Mantenere `is_managed` sincronizzato

---

## 🚀 Conclusione

L'architettura a due tabelle è **corretta e ottimale** per questo caso d'uso:

- ✅ Separazione chiara tra lookup e gestione
- ✅ Performance ottimali
- ✅ Manutenibilità elevata
- ✅ Scalabilità garantita
- ✅ Integrità referenziale mantenuta

**Non è necessario unificare le tabelle!**

