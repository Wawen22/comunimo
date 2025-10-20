# Database Migration - MySQL to Supabase (PostgreSQL)

## 🗄️ Schema Database Supabase

### 1. Tabelle Autenticazione e Utenti

#### `profiles` (estende auth.users di Supabase)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'societa', 'readonly')),
  cod_societa TEXT REFERENCES societa(cod_societa),
  nome_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2. Tabelle Società

#### `societa`
```sql
CREATE TABLE societa (
  cod_societa TEXT PRIMARY KEY,
  denominazione TEXT NOT NULL,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  provincia TEXT,
  email TEXT,
  telefono TEXT,
  pec TEXT,
  codice_fiscale TEXT,
  partita_iva TEXT,
  responsabile_nome TEXT,
  responsabile_email TEXT,
  responsabile_telefono TEXT,
  ente TEXT CHECK (ente IN ('FIDAL', 'UISP', 'CSI', 'ALTRO')),
  status TEXT DEFAULT 'attivo' CHECK (status IN ('attivo', 'sospeso', 'inattivo')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_societa_denominazione ON societa(denominazione);
CREATE INDEX idx_societa_status ON societa(status);

-- RLS Policies
ALTER TABLE societa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active societa" ON societa
  FOR SELECT USING (status = 'attivo');

CREATE POLICY "Societa can view own data" ON societa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND cod_societa = societa.cod_societa
    )
  );

CREATE POLICY "Admins can manage all societa" ON societa
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3. Tabelle Atleti

#### `atleti`
```sql
CREATE TABLE atleti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cod_societa TEXT NOT NULL REFERENCES societa(cod_societa) ON DELETE RESTRICT,
  cognome TEXT NOT NULL,
  nome TEXT NOT NULL,
  codice_fiscale TEXT UNIQUE NOT NULL,
  data_nascita DATE NOT NULL,
  luogo_nascita TEXT,
  sesso TEXT CHECK (sesso IN ('M', 'F')),
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  provincia TEXT,
  email TEXT,
  telefono TEXT,
  categoria TEXT,
  anno_categoria INTEGER,
  ente TEXT CHECK (ente IN ('FIDAL', 'UISP', 'CSI', 'ALTRO')),
  numero_tessera TEXT,
  data_scadenza_tessera DATE,
  note TEXT,
  status TEXT DEFAULT 'attivo' CHECK (status IN ('attivo', 'sospeso', 'ritirato')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT atleti_cod_fiscale_length CHECK (char_length(codice_fiscale) = 16)
);

-- Indexes
CREATE INDEX idx_atleti_societa ON atleti(cod_societa);
CREATE INDEX idx_atleti_cognome_nome ON atleti(cognome, nome);
CREATE INDEX idx_atleti_codice_fiscale ON atleti(codice_fiscale);
CREATE INDEX idx_atleti_categoria ON atleti(categoria);
CREATE INDEX idx_atleti_status ON atleti(status);

-- Full-text search
CREATE INDEX idx_atleti_search ON atleti 
  USING gin(to_tsvector('italian', cognome || ' ' || nome));

-- RLS Policies
ALTER TABLE atleti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active atleti" ON atleti
  FOR SELECT USING (status = 'attivo');

CREATE POLICY "Societa can view own atleti" ON atleti
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND cod_societa = atleti.cod_societa
    )
  );

CREATE POLICY "Societa can manage own atleti" ON atleti
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND cod_societa = atleti.cod_societa
    )
  );

CREATE POLICY "Admins can manage all atleti" ON atleti
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### `certificati_medici`
```sql
CREATE TABLE certificati_medici (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_atleta UUID NOT NULL REFERENCES atleti(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('agonistico', 'non_agonistico')),
  numero_certificato TEXT,
  data_rilascio DATE NOT NULL,
  data_scadenza DATE NOT NULL,
  medico TEXT,
  file_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certificati_atleta ON certificati_medici(id_atleta);
CREATE INDEX idx_certificati_scadenza ON certificati_medici(data_scadenza);

-- RLS Policies
ALTER TABLE certificati_medici ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Societa can view own atleti certificates" ON certificati_medici
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atleti a
      JOIN profiles p ON p.cod_societa = a.cod_societa
      WHERE a.id = id_atleta AND p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certificates" ON certificati_medici
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 4. Tabelle Gare ed Eventi

#### `gare`
```sql
CREATE TABLE gare (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descrizione TEXT,
  data_gara DATE NOT NULL,
  ora_inizio TIME,
  luogo TEXT NOT NULL,
  indirizzo TEXT,
  citta TEXT,
  provincia TEXT,
  tipo TEXT CHECK (tipo IN ('corsa', 'marcia', 'cross', 'strada', 'pista')),
  distanza TEXT,
  ente_organizzatore TEXT,
  regolamento_url TEXT,
  quota_iscrizione DECIMAL(10,2),
  data_apertura_iscrizioni TIMESTAMPTZ,
  data_chiusura_iscrizioni TIMESTAMPTZ,
  posti_disponibili INTEGER,
  status TEXT DEFAULT 'programmata' CHECK (status IN ('programmata', 'iscrizioni_aperte', 'iscrizioni_chiuse', 'conclusa', 'annullata')),
  pubblicata BOOLEAN DEFAULT false,
  immagine_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gare_data ON gare(data_gara);
CREATE INDEX idx_gare_status ON gare(status);
CREATE INDEX idx_gare_slug ON gare(slug);

-- RLS Policies
ALTER TABLE gare ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published gare" ON gare
  FOR SELECT USING (pubblicata = true);

CREATE POLICY "Admins can manage all gare" ON gare
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### `specialita`
```sql
CREATE TABLE specialita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gara UUID NOT NULL REFERENCES gare(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  sesso TEXT CHECK (sesso IN ('M', 'F', 'MF')),
  distanza TEXT,
  quota_iscrizione DECIMAL(10,2),
  posti_disponibili INTEGER,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_specialita_gara ON specialita(id_gara);

-- RLS Policies
ALTER TABLE specialita ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view specialita of published gare" ON specialita
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gare
      WHERE id = id_gara AND pubblicata = true
    )
  );

CREATE POLICY "Admins can manage all specialita" ON specialita
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 5. Tabelle Iscrizioni

#### `iscrizioni`
```sql
CREATE TABLE iscrizioni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_atleta UUID NOT NULL REFERENCES atleti(id) ON DELETE RESTRICT,
  id_gara UUID NOT NULL REFERENCES gare(id) ON DELETE RESTRICT,
  id_specialita UUID NOT NULL REFERENCES specialita(id) ON DELETE RESTRICT,
  numero_pettorale INTEGER,
  tempo_iscrizione TEXT,
  tempo_finale TEXT,
  posizione INTEGER,
  punti DECIMAL(10,2),
  status_iscrizione TEXT DEFAULT 'in_attesa' CHECK (
    status_iscrizione IN ('in_attesa', 'confermata', 'annullata', 'non_presentato')
  ),
  status_pagamento TEXT DEFAULT 'non_pagato' CHECK (
    status_pagamento IN ('non_pagato', 'pagato', 'rimborsato')
  ),
  importo DECIMAL(10,2),
  data_pagamento TIMESTAMPTZ,
  metodo_pagamento TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(id_atleta, id_gara, id_specialita)
);

-- Indexes
CREATE INDEX idx_iscrizioni_atleta ON iscrizioni(id_atleta);
CREATE INDEX idx_iscrizioni_gara ON iscrizioni(id_gara);
CREATE INDEX idx_iscrizioni_specialita ON iscrizioni(id_specialita);
CREATE INDEX idx_iscrizioni_status ON iscrizioni(status_iscrizione);

-- RLS Policies
ALTER TABLE iscrizioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own societa iscrizioni" ON iscrizioni
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atleti a
      JOIN profiles p ON p.cod_societa = a.cod_societa
      WHERE a.id = id_atleta AND p.id = auth.uid()
    )
  );

CREATE POLICY "Societa can create iscrizioni for own atleti" ON iscrizioni
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM atleti a
      JOIN profiles p ON p.cod_societa = a.cod_societa
      WHERE a.id = id_atleta AND p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all iscrizioni" ON iscrizioni
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6. Tabelle Classifiche

#### `classifiche`
```sql
CREATE TABLE classifiche (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_iscrizione UUID NOT NULL REFERENCES iscrizioni(id) ON DELETE CASCADE,
  id_gara UUID NOT NULL REFERENCES gare(id),
  id_atleta UUID NOT NULL REFERENCES atleti(id),
  categoria TEXT NOT NULL,
  posizione_assoluta INTEGER,
  posizione_categoria INTEGER,
  posizione_sesso INTEGER,
  tempo_finale TEXT NOT NULL,
  tempo_chip TEXT,
  punti DECIMAL(10,2),
  velocita_media DECIMAL(5,2),
  pubblicata BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classifiche_gara ON classifiche(id_gara);
CREATE INDEX idx_classifiche_atleta ON classifiche(id_atleta);
CREATE INDEX idx_classifiche_categoria ON classifiche(categoria);

-- RLS Policies
ALTER TABLE classifiche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published classifiche" ON classifiche
  FOR SELECT USING (pubblicata = true);

CREATE POLICY "Admins can manage all classifiche" ON classifiche
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 7. Tabelle Pagamenti

#### `pagamenti`
```sql
CREATE TABLE pagamenti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_iscrizione UUID NOT NULL REFERENCES iscrizioni(id) ON DELETE RESTRICT,
  importo DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('paypal', 'stripe', 'bonifico', 'contanti')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,
  payer_email TEXT,
  payer_name TEXT,
  data_pagamento TIMESTAMPTZ,
  data_scadenza TIMESTAMPTZ,
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pagamenti_iscrizione ON pagamenti(id_iscrizione);
CREATE INDEX idx_pagamenti_status ON pagamenti(status);
CREATE INDEX idx_pagamenti_transaction ON pagamenti(transaction_id);

-- RLS Policies
ALTER TABLE pagamenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pagamenti" ON pagamenti
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM iscrizioni i
      JOIN atleti a ON a.id = i.id_atleta
      JOIN profiles p ON p.cod_societa = a.cod_societa
      WHERE i.id = id_iscrizione AND p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all pagamenti" ON pagamenti
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 8. Tabelle CMS e Contenuti

#### `pagine`
```sql
CREATE TABLE pagine (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titolo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contenuto TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  pubblicata BOOLEAN DEFAULT false,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE pagine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published pagine" ON pagine
  FOR SELECT USING (pubblicata = true);

CREATE POLICY "Admins can manage pagine" ON pagine
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### `notizie`
```sql
CREATE TABLE notizie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titolo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sommario TEXT,
  contenuto TEXT,
  immagine_url TEXT,
  autore_id UUID REFERENCES profiles(id),
  pubblicata BOOLEAN DEFAULT false,
  data_pubblicazione TIMESTAMPTZ,
  in_evidenza BOOLEAN DEFAULT false,
  categorie TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notizie_slug ON notizie(slug);
CREATE INDEX idx_notizie_pubblicata ON notizie(pubblicata);
CREATE INDEX idx_notizie_data ON notizie(data_pubblicazione DESC);

-- RLS
ALTER TABLE notizie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published notizie" ON notizie
  FOR SELECT USING (pubblicata = true);

CREATE POLICY "Admins can manage notizie" ON notizie
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 9. Tabelle Comunicazioni

#### `email_log`
```sql
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinatario TEXT NOT NULL,
  oggetto TEXT NOT NULL,
  corpo TEXT,
  template_id UUID,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_log_status ON email_log(status);
CREATE INDEX idx_email_log_sent_at ON email_log(sent_at DESC);
```

#### `sms_log`
```sql
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinatario TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
  provider TEXT,
  message_id TEXT,
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sms_log_status ON sms_log(status);
CREATE INDEX idx_sms_log_sent_at ON sms_log(sent_at DESC);
```

### 10. Tabella Impostazioni

#### `impostazioni`
```sql
CREATE TABLE impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT,
  tipo TEXT CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  descrizione TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE impostazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage impostazioni" ON impostazioni
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🔄 Piano di Migrazione Dati

### Step 1: Setup Supabase Project
```bash
# Creare progetto su Supabase dashboard
# Ottenere connection string e API keys

# Setup locale
supabase init
supabase link --project-ref <project-id>
```

### Step 2: Applicare Migrazioni
```bash
# Creare migration files in supabase/migrations/
# Esempio: 001_initial_schema.sql

supabase db push
```

### Step 3: Migrazione Dati

#### Script Node.js per migrazione
```typescript
// scripts/migrate-data.ts
import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

const mysqlConfig = {
  host: '89.46.111.185',
  user: 'Sql1696291',
  password: process.env.MYSQL_PASSWORD,
  database: 'Sql1696291_1'
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function migrateSocieta() {
  const mysql = await mysql2.createConnection(mysqlConfig);
  const [rows] = await mysql.execute('SELECT * FROM tab_societa');
  
  for (const row of rows) {
    await supabase.from('societa').insert({
      cod_societa: row.cod_soc,
      denominazione: row.denominazione,
      // ... map other fields
    });
  }
}

async function migrateAtleti() {
  // Similar logic for atleti
}

// Execute migrations in order
async function main() {
  await migrateSocieta();
  await migrateAtleti();
  // ... other tables
}

main();
```

### Step 4: Validazione Dati
```sql
-- Query di validazione
SELECT 
  (SELECT COUNT(*) FROM societa) as societa_count,
  (SELECT COUNT(*) FROM atleti) as atleti_count,
  (SELECT COUNT(*) FROM gare) as gare_count,
  (SELECT COUNT(*) FROM iscrizioni) as iscrizioni_count;

-- Verifica integrità referenziale
SELECT COUNT(*) FROM atleti a
LEFT JOIN societa s ON a.cod_societa = s.cod_societa
WHERE s.cod_societa IS NULL;
-- Dovrebbe essere 0
```

## 🔧 Database Functions & Triggers

### Auto-update timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applicare a tutte le tabelle con updated_at
CREATE TRIGGER update_societa_updated_at
  BEFORE UPDATE ON societa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ripetere per altre tabelle...
```

### Calcolo automatico categoria atleta
```sql
CREATE OR REPLACE FUNCTION calcola_categoria_atleta(data_nascita DATE, data_riferimento DATE DEFAULT CURRENT_DATE)
RETURNS TEXT AS $$
DECLARE
  eta INTEGER;
  anno_riferimento INTEGER;
BEGIN
  anno_riferimento := EXTRACT(YEAR FROM data_riferimento);
  eta := anno_riferimento - EXTRACT(YEAR FROM data_nascita);
  
  CASE
    WHEN eta < 8 THEN RETURN 'ESORDIENTI';
    WHEN eta BETWEEN 8 AND 9 THEN RETURN 'RAGAZZI';
    WHEN eta BETWEEN 10 AND 11 THEN RETURN 'CADETTI';
    WHEN eta BETWEEN 12 AND 13 THEN RETURN 'ALLIEVI';
    WHEN eta BETWEEN 14 AND 15 THEN RETURN 'JUNIORES';
    WHEN eta BETWEEN 16 AND 22 THEN RETURN 'PROMESSE';
    WHEN eta BETWEEN 23 AND 34 THEN RETURN 'SENIOR';
    WHEN eta BETWEEN 35 AND 39 THEN RETURN 'MASTER 35';
    WHEN eta BETWEEN 40 AND 44 THEN RETURN 'MASTER 40';
    -- ... altre categorie master
    ELSE RETURN 'MASTER 80';
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

### Trigger per posti disponibili
```sql
CREATE OR REPLACE FUNCTION check_posti_disponibili()
RETURNS TRIGGER AS $$
DECLARE
  posti INTEGER;
  iscritti INTEGER;
BEGIN
  SELECT posti_disponibili INTO posti
  FROM specialita
  WHERE id = NEW.id_specialita;
  
  SELECT COUNT(*) INTO iscritti
  FROM iscrizioni
  WHERE id_specialita = NEW.id_specialita
    AND status_iscrizione = 'confermata';
  
  IF posti IS NOT NULL AND iscritti >= posti THEN
    RAISE EXCEPTION 'Posti esauriti per questa specialità';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_iscrizione
  BEFORE INSERT ON iscrizioni
  FOR EACH ROW
  EXECUTE FUNCTION check_posti_disponibili();
```

## 📊 Views Utili

### View per dashboard admin
```sql
CREATE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM societa WHERE status = 'attivo') as societa_attive,
  (SELECT COUNT(*) FROM atleti WHERE status = 'attivo') as atleti_attivi,
  (SELECT COUNT(*) FROM iscrizioni WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as iscrizioni_ultimo_mese,
  (SELECT SUM(importo) FROM pagamenti WHERE status = 'completed' AND data_pagamento >= CURRENT_DATE - INTERVAL '30 days') as incassi_ultimo_mese;
```

### View classifiche con dettagli atleta
```sql
CREATE VIEW classifiche_complete AS
SELECT
  c.*,
  a.cognome,
  a.nome,
  a.cod_societa,
  s.denominazione as nome_societa,
  g.nome as nome_gara,
  g.data_gara
FROM classifiche c
JOIN atleti a ON c.id_atleta = a.id
JOIN societa s ON a.cod_societa = s.cod_societa
JOIN gare g ON c.id_gara = g.id
WHERE c.pubblicata = true;
```

---

**Status**: ✅ Schema Database Completo
**Prossimo Step**: Piano di implementazione
