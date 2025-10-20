# Analisi Applicazione Esistente - ComUniMo

## 📊 Overview Generale

**Tipo Applicazione**: Web Application per gestione iscrizioni e classifiche sportive
**Framework Attuale**: PHP 7.x con CodeIgniter 3.x
**Database**: MySQL
**Server**: Apache/Linux
**Utenti Target**: 
- Società sportive (registrazione atleti)
- Amministratori (gestione dati, classifiche)
- Pubblico (visualizzazione classifiche e calendario)

## 🏗️ Architettura Attuale

### Stack Tecnologico

#### Backend
- **PHP 7.x** (linguaggio server-side)
- **CodeIgniter 3.x** (MVC framework)
- **MySQL** (database relazionale)
- **Apache** (web server)

#### Frontend
- **HTML5/CSS3**
- **Bootstrap 4/5** (framework CSS)
- **jQuery 1.12.4** (JavaScript library - DATATO)
- **JavaScript ES5** (script legacy)
- **Font Awesome 4.x** (icons)

#### Librerie e Plugin
- **PayPal Library** (pagamenti)
- **SMS Gateway** (notifiche SMS)
- **Email System** (notifiche email)
- **PHPMailer** (invio email)

### Struttura Database

#### Tabelle Principali

##### 1. **Gestione Utenti e Autenticazione**
```sql
- users_tbl (amministratori e utenti sistema)
  - user_id (PK)
  - name, email, password
  - user_type (1=admin, 2=societa)
  - status, created_at

- doctor_tbl (società sportive - naming legacy)
  - doctor_id (PK)
  - doctor_name, email, password
  - phone, address
  - status, specialist
```

##### 2. **Gestione Atleti**
```sql
- tab_atleti (atleti registrati)
  - id (PK)
  - cognome, nome
  - data_nascita, sesso
  - cod_fis, cod_soc
  - categoria, anno_cat
  - status

- tab_atleti_uisp (atleti UISP)
  - Simile a tab_atleti
  - Dati specifici UISP

- tab_iscritti (iscrizioni gare)
  - id_iscrizione (PK)
  - id_atleta (FK)
  - id_gara (FK)
  - id_specialita (FK)
  - tempo, punti
  - status_pagamento
```

##### 3. **Gestione Gare e Eventi**
```sql
- tab_gara (gare/eventi)
  - id_gara (PK)
  - nome_gara, data_gara
  - luogo, tipo
  - status

- tab_specialita (specialità sportive)
  - id_specialita (PK)
  - nome_specialita
  - categoria

- events (calendario eventi)
  - event_id (PK)
  - title, start_date, end_date
  - description, color
```

##### 4. **Gestione Società**
```sql
- tab_societa (società sportive)
  - cod_soc (PK)
  - denominazione, indirizzo
  - email, telefono
  - responsabile
  - status

- tab_enti (enti organizzatori)
  - id_ente (PK)
  - nome_ente, sigla
  - tipo
```

##### 5. **Sistema di Classifiche**
```sql
- classification (classifiche)
  - id (PK)
  - id_atleta (FK)
  - id_gara (FK)
  - posizione, tempo, punti
  - categoria

- tab_cert (certificazioni)
  - id (PK)
  - id_atleta (FK)
  - tipo_cert, scadenza
```

##### 6. **Sistema Admin Legacy (da valutare se mantenere)**
```sql
- appointment_tbl (appuntamenti - sembra non usato)
- patient_tbl (pazienti - naming legacy medico)
- prescription_data (prescrizioni - legacy)
- invoice, payment_table (fatturazione - da valutare)
```

##### 7. **Comunicazioni**
```sql
- email_config, email_template, email_delivery
- sms_gateway, sms_template, sms_delivery
- email_schedule, sms_schedule
```

##### 8. **Configurazione Sistema**
```sql
- app_setting (impostazioni applicazione)
- web_pages_tbl (contenuti CMS)
- language (sistema multilingua)
- ci_sessions (sessioni utente)
```

## 🎯 Funzionalità Mappate

### Area Pubblica

#### 1. Homepage
- **Percorso**: `/` → `Welcome::index()`
- **View**: `views/new_neb/index.php`
- **Funzionalità**:
  - Hero section con slider
  - Presentazione organizzazione
  - Eventi in evidenza
  - Ultime notizie
  - Footer con contatti

#### 2. Classifiche e Calendario
- **Visualizzazione classifiche** per categoria
- **Calendario gare** con filtri
- **Dettagli evento** con iscritti
- **Export PDF** delle classifiche

#### 3. Sitemap
- **Percorso**: `/sitemap.xml`
- **Controller**: `Sitemap::index()`
- Generazione automatica sitemap XML

### Area Società (Utenti Registrati)

#### 1. Autenticazione
- **Login**: `/login` → `Auth_controller::login()`
- **Autenticazione**: `/authentication` → verificare credenziali
- **Logout**: `/logout` → distruggere sessione
- **Recupero Password**: form via email

#### 2. Dashboard Società
- **Visualizzazione atleti** della propria società
- **Statistiche iscrizioni**
- **Storico gare partecipate**

#### 3. Gestione Atleti
- **Lista atleti**: visualizzare tutti gli atleti della società
- **Aggiungere atleta**: form registrazione nuovo atleta
- **Modificare atleta**: aggiornare dati esistenti
- **Eliminare atleta**: soft delete

#### 4. Iscrizioni Gare
- **Iscrivere atleti** a gare disponibili
- **Visualizzare iscrizioni** effettuate
- **Annullare iscrizione** (entro termini)
- **Pagamento iscrizioni**: integrazione PayPal

#### 5. Documenti e Certificazioni
- **Upload certificati** medici atleti
- **Visualizzare scadenze**
- **Download documenti**

### Area Amministrativa

#### 1. Dashboard Admin
- **Percorso**: `/admin/dashboard`
- **Controller**: `admin/Dashboard::index()`
- **Funzionalità**:
  - Statistiche generali (totale società, atleti, iscrizioni)
  - Grafici andamento iscrizioni
  - Appuntamenti del giorno (se usato)
  - Quick actions

#### 2. Gestione Società
- **Controller**: `admin/societa/*`
- **Funzionalità**:
  - CRUD società sportive
  - Assegnare credenziali accesso
  - Visualizzare storico attività
  - Gestire stato (attivo/sospeso)

#### 3. Gestione Atleti
- **Controller**: `admin/Patient_controller` (naming legacy)
- **Funzionalità**:
  - Visualizzare tutti gli atleti
  - Modificare dati atleti
  - Gestire certificazioni
  - Export liste atleti

#### 4. Gestione Gare
- **Controller**: `admin/Appointment_controller` (naming legacy)
- **Funzionalità**:
  - CRUD gare/eventi
  - Gestire specialità disponibili
  - Impostare date e scadenze iscrizioni
  - Definire quote di partecipazione

#### 5. Gestione Iscrizioni
- **Visualizzare tutte le iscrizioni**
- **Approvare/rifiutare iscrizioni**
- **Gestire lista d'attesa**
- **Verificare pagamenti**

#### 6. Classifiche
- **Controller**: `admin/Setup_controller` (da verificare)
- **Funzionalità**:
  - Inserire risultati gare
  - Calcolare classifiche automaticamente
  - Pubblicare classifiche
  - Export PDF/Excel

#### 7. Import/Export Dati
- **Percorso**: `application/import.php`
- **Funzionalità**:
  - Import atleti da CSV/Excel
  - Import iscrizioni FIDAL
  - Export dati per backup
  - Sincronizzazione archivio FIDAL

#### 8. Comunicazioni
- **Controller**: `admin/email/*` e `admin/Sms_*`
- **Funzionalità**:
  - Invio email massive
  - Invio SMS (via gateway)
  - Template personalizzabili
  - Storico invii
  - Scheduling comunicazioni

#### 9. Fatturazione e Pagamenti
- **Controller**: `admin/Invoice`, `admin/payment_method/*`
- **Funzionalità**:
  - Gestire pagamenti società
  - Generare fatture
  - Integrare PayPal
  - Report pagamenti

#### 10. Sistema di Setup
- **Controller**: `admin/Setting_controller`, `admin/Setup_controller`
- **Funzionalità**:
  - Configurazione applicazione
  - Gestire timezone
  - Setup email/SMS gateway
  - Personalizzare template
  - Gestire permessi utenti

#### 11. Web Setup (CMS)
- **Controller**: `admin/Web_setup_controller`
- **Funzionalità**:
  - Modificare contenuti homepage
  - Gestire slider/banner
  - Upload immagini
  - SEO settings

#### 12. Utenti Sistema
- **Controller**: `admin/Users_controller`
- **Funzionalità**:
  - CRUD amministratori
  - Gestire ruoli e permessi
  - Cambio password
  - Log accessi

#### 13. Emergency Stop
- **Controller**: `admin/Emergency_stop_controller`
- **Funzionalità**:
  - Bloccare iscrizioni temporaneamente
  - Messaggi di manutenzione
  - Gestione emergenze

#### 14. Report e Analytics
- **Visualizzare statistiche dettagliate**
- **Export report personalizzati**
- **Grafici andamento**
- **Log attività sistema**

## 🔍 Analisi Punti Critici

### Problematiche Identificate

#### 1. **Naming Convention Confuso**
- Tabelle e controller con nomi del dominio medico (doctor, patient, prescription, appointment)
- Riutilizzo di un template medico → confusione nel codice
- **Soluzione**: Renaming completo con nomi del dominio sportivo

#### 2. **Sicurezza**
- Password in chiaro nel codice (database.php)
- Possibili vulnerabilità SQL injection
- Sessioni non cifrate
- **Soluzione**: Implementare Supabase Auth + RLS

#### 3. **Performance**
- Query non ottimizzate
- Nessun caching implementato
- Immagini non ottimizzate
- **Soluzione**: Next.js ISR, Supabase pooling, Vercel Edge

#### 4. **UI/UX Datato**
- Design obsoleto
- Non responsive su tutti i device
- jQuery legacy
- **Soluzione**: Design system moderno con Tailwind + shadcn/ui

#### 5. **Manutenibilità**
- Codice duplicato
- Scarsa documentazione
- Dipendenze obsolete
- **Soluzione**: TypeScript, componenti riutilizzabili, docs

#### 6. **Testing**
- Nessun test automatizzato
- Difficile fare refactor
- **Soluzione**: Test suite completa (Jest, Playwright)

## 📦 Asset e Risorse da Migrare

### Immagini
- Logo organizzazione
- Banner e slider homepage
- Foto eventi
- Icone società

### Documenti
- PDF classifiche storiche
- Template certificati
- Regolamenti gare
- Modulistica

### Dati
- Database completo (~18000+ record atleti)
- Storico iscrizioni
- Storico pagamenti
- Email e SMS template

## 🔗 Integrazioni Esistenti

### Servizi Esterni
1. **PayPal** - Pagamenti online
2. **SMS Gateway** - Notifiche SMS
3. **Email SMTP** - Invio email
4. **FIDAL API** (se presente) - Sincronizzazione dati

### Da Mantenere/Aggiornare
- ✅ PayPal (o valutare Stripe)
- ✅ Email (via Supabase + Resend/SendGrid)
- ⚠️ SMS (valutare alternative moderne: Twilio)
- ✅ FIDAL (se API disponibile)

## 📊 Metriche Applicazione Attuale

### Utilizzo
- **Utenti registrati**: ~50-100 società
- **Atleti gestiti**: ~8000-10000
- **Gare annue**: ~50-100 eventi
- **Iscrizioni medie per gara**: 100-500

### Performance Attuale (da migliorare)
- **Load Time**: 3-5 secondi
- **Mobile Performance**: 40-60/100
- **SEO Score**: 50-70/100
- **Accessibility**: Non testato

### Obiettivi Nuova Applicazione
- **Load Time**: < 1.5 secondi
- **Mobile Performance**: > 90/100
- **SEO Score**: > 90/100
- **Accessibility**: WCAG 2.1 AA (> 95/100)

## 🎯 Funzionalità da Mantenere al 100%

- ✅ Tutte le funzionalità area pubblica
- ✅ Tutte le funzionalità area società
- ✅ Tutte le funzionalità area admin
- ✅ Sistema di autenticazione e autorizzazione
- ✅ Gestione completa atleti e iscrizioni
- ✅ Sistema classifiche e risultati
- ✅ Comunicazioni email/SMS
- ✅ Import/Export dati
- ✅ Integrazione pagamenti

## 🚀 Funzionalità Aggiuntive da Considerare

- ➕ **Real-time notifications** (Supabase Realtime)
- ➕ **Mobile app** (React Native/PWA)
- ➕ **QR Code check-in** gare
- ➕ **Chat support** per società
- ➕ **Dashboard analytics avanzata**
- ➕ **Integrazione calendar** (Google Calendar)
- ➕ **Multi-tenant** per altri comitati
- ➕ **API pubblica** per terze parti

---

**Status**: ✅ Analisi Completa
**Prossimo Step**: Progettazione nuova architettura
