# Multi-Society Authentication - Testing Guide

**Date**: 2025-10-22  
**Status**: Ready for Testing  
**Build**: ✅ Successful

---

## 🎯 Obiettivo

Testare il nuovo sistema di autenticazione multi-società che permette:
1. Un utente può gestire più codici società (es. FIDAL + UISP)
2. Più utenti possono gestire la stessa società
3. Society admins vedono SOLO i dati delle società assegnate
4. Admin possono assegnare società agli utenti

---

## ✅ Pre-requisiti

1. **Database aggiornato** con le migration:
   - `20251022_add_multi_society_support.sql`
   - `20251022_fix_rls_policies_society_admin.sql`
   - `20251022_fix_handle_new_user_role.sql`
   - `20251022_add_admin_view_all_profiles_policy.sql` ⭐ NEW

2. **Build completato** senza errori:
   ```bash
   cd refactoring-nextjs/comunimo-next
   npm run build
   ```

3. **Server avviato**:
   ```bash
   npm run dev
   ```

---

## 🧪 Test 1: Registrazione Nuovo Utente

### Obiettivo
Verificare che la registrazione funzioni correttamente con il nuovo ruolo `society_admin`.

### Steps
1. Vai a `http://localhost:3000/register`
2. Compila il form:
   - Nome: `Test User`
   - Email: `test@example.com`
   - Password: `Password123!`
3. Clicca **Registrati**

### Risultato Atteso
- ✅ Registrazione completata senza errori
- ✅ Ricevi email di verifica
- ✅ Profilo creato con `role = 'society_admin'`

### Verifica Database
```sql
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE email = 'test@example.com';
```

**Aspettative**:
- `role = 'society_admin'`
- `is_active = true`

---

## 🧪 Test 2: Society Admin Senza Società Assegnate

### Obiettivo
Verificare che un society_admin senza società NON veda alcun dato.

### Steps
1. Login con l'utente appena creato (`test@example.com`)
2. Vai a **Dashboard → Atleti**
3. Vai a **Dashboard → Gare**

### Risultato Atteso
- ✅ Login funziona
- ✅ Dashboard carica senza errori
- ✅ Lista atleti è **VUOTA** (0 risultati)
- ✅ Non può creare atleti (nessuna società disponibile)
- ✅ Lista gare/iscrizioni è **VUOTA**

### ⚠️ Comportamento Corretto
L'utente NON deve vedere NESSUN dato finché non gli viene assegnata almeno una società.

---

## 🧪 Test 3: Admin Assegna Società a Utente

### Obiettivo
Verificare che un admin possa assegnare società a un society_admin.

### Pre-requisito
Devi avere un utente con ruolo `admin` o `super_admin`. Se non ce l'hai:

```sql
-- Crea un admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'TUA_EMAIL_ADMIN@example.com';
```

### Steps
1. **Logout** dall'utente test
2. **Login** con l'utente admin
3. Vai a **Dashboard → Gestione Utenti** (nuovo link nella sidebar)
4. Cerca l'utente `test@example.com`
5. Clicca **Gestisci Società**
6. Nel modal, seleziona una società dal dropdown
7. Clicca **Aggiungi**

### Risultato Atteso
- ✅ Pagina "Gestione Utenti" carica correttamente
- ✅ Vedi lista di tutti gli utenti
- ✅ Utente `test@example.com` ha badge "⚠️ Nessuna società assegnata"
- ✅ Modal si apre correttamente
- ✅ Dropdown mostra tutte le società attive
- ✅ Dopo aver cliccato "Aggiungi", la società appare nella lista
- ✅ Modal si aggiorna in tempo reale

### Verifica Database
```sql
SELECT us.*, s.name, s.society_code
FROM user_societies us
JOIN societies s ON s.id = us.society_id
WHERE us.user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
```

**Aspettative**:
- Record presente in `user_societies`
- Società corretta assegnata

---

## 🧪 Test 4: Society Admin Con Società Assegnata

### Obiettivo
Verificare che un society_admin con società assegnata veda SOLO i dati di quella società.

### Steps
1. **Logout** dall'admin
2. **Login** con `test@example.com`
3. Vai a **Dashboard → Atleti**
4. Vai a **Dashboard → Società**

### Risultato Atteso
- ✅ Vedi SOLO gli atleti della società assegnata
- ✅ Puoi creare nuovi atleti (società disponibile nel dropdown)
- ✅ Vedi TUTTE le società (le società sono pubbliche)
- ✅ Non vedi atleti di altre società

### Test Creazione Atleta
1. Clicca **Nuovo Atleta**
2. Compila il form
3. Nel campo "Società", verifica che sia pre-selezionata la tua società
4. Salva

**Aspettative**:
- ✅ Atleta creato con successo
- ✅ Atleta appare nella lista
- ✅ `society_id` corrisponde alla società assegnata

---

## 🧪 Test 5: Utente Con Multiple Società (FIDAL + UISP)

### Obiettivo
Verificare che un utente possa gestire più società contemporaneamente.

### Steps
1. **Login** come admin
2. Vai a **Gestione Utenti**
3. Seleziona `test@example.com`
4. Clicca **Gestisci Società**
5. Assegna una **SECONDA** società (es. se prima era FIDAL, ora aggiungi UISP)
6. **Logout** e **login** come `test@example.com`
7. Vai a **Atleti**

### Risultato Atteso
- ✅ Vedi atleti di **ENTRAMBE** le società
- ✅ Puoi creare atleti per entrambe le società
- ✅ Nel form di creazione, il dropdown società mostra entrambe

---

## 🧪 Test 6: Rimozione Società

### Obiettivo
Verificare che la rimozione di una società funzioni correttamente.

### Steps
1. **Login** come admin
2. Vai a **Gestione Utenti**
3. Seleziona `test@example.com`
4. Clicca **Gestisci Società**
5. Clicca l'icona **Cestino** accanto a una società
6. Conferma la rimozione
7. **Logout** e **login** come `test@example.com`
8. Vai a **Atleti**

### Risultato Atteso
- ✅ Società rimossa dalla lista
- ✅ Utente NON vede più gli atleti di quella società
- ✅ Se rimuovi tutte le società, l'utente torna a vedere 0 dati

---

## 🧪 Test 7: Admin Vede Tutto

### Obiettivo
Verificare che admin e super_admin vedano TUTTI i dati.

### Steps
1. **Login** come admin
2. Vai a **Atleti**
3. Vai a **Società**
4. Vai a **Gare**

### Risultato Atteso
- ✅ Vedi TUTTI gli atleti di TUTTE le società
- ✅ Vedi TUTTE le società
- ✅ Vedi TUTTE le gare e iscrizioni
- ✅ Nessuna limitazione

---

## 🧪 Test 8: Iscrizione Atleta a Gara

### Obiettivo
Verificare che l'iscrizione usi il `society_id` corretto.

### Steps
1. **Login** come `test@example.com` (con società assegnata)
2. Vai a **Gare → [Seleziona una gara] → Iscrizioni**
3. Clicca **Nuova Iscrizione**
4. Seleziona un atleta FIDAL
5. Completa l'iscrizione

### Risultato Atteso
- ✅ Iscrizione creata con successo
- ✅ `society_id` corrisponde alla società FIDAL dell'atleta

### Verifica Database
```sql
SELECT 
  er.id,
  m.first_name,
  m.last_name,
  m.society_id,
  s.name as society_name,
  s.society_code
FROM event_registrations er
JOIN members m ON m.id = er.member_id
JOIN societies s ON s.id = m.society_id
WHERE er.id = 'REGISTRATION_ID_QUI';
```

---

## 🧪 Test 9: Filtri e Ricerca

### Obiettivo
Verificare che filtri e ricerca funzionino correttamente.

### Steps
1. **Login** come admin
2. Vai a **Gestione Utenti**
3. Usa il filtro "Filtra per ruolo" → Seleziona "Amministratori Società"
4. Usa la ricerca per cercare un utente specifico

### Risultato Atteso
- ✅ Filtro mostra solo society_admin
- ✅ Ricerca funziona per nome e email
- ✅ Contatori aggiornati correttamente

---

## 📊 Checklist Completa

Esegui tutti i test e segna quelli completati:

- [ ] **Test 1**: Registrazione nuovo utente
- [ ] **Test 2**: Society admin senza società (vede 0 dati)
- [ ] **Test 3**: Admin assegna società
- [ ] **Test 4**: Society admin con società (vede solo i suoi dati)
- [ ] **Test 5**: Utente con multiple società (FIDAL + UISP)
- [ ] **Test 6**: Rimozione società
- [ ] **Test 7**: Admin vede tutto
- [ ] **Test 8**: Iscrizione atleta con society_id corretto
- [ ] **Test 9**: Filtri e ricerca funzionano

---

## 🐛 Problemi Comuni

### Problema: "Vedo tutti gli atleti anche senza società"
**Causa**: RLS policies non aggiornate  
**Soluzione**: Esegui la migration `20251022_fix_rls_policies_society_admin.sql`

### Problema: "500 error durante registrazione"
**Causa**: `handle_new_user()` non aggiornata  
**Soluzione**: Esegui la migration `20251022_fix_handle_new_user_role.sql`

### Problema: "Non vedo il link Gestione Utenti"
**Causa**: Utente non è admin
**Soluzione**: Verifica il ruolo con `SELECT role FROM profiles WHERE email = 'TUA_EMAIL'`

### Problema: "Vedo solo il mio utente in Gestione Utenti"
**Causa**: RLS policy mancante per admin
**Soluzione**: Esegui la migration `20251022_add_admin_view_all_profiles_policy.sql`

---

## ✅ Risultati Attesi Finali

Dopo aver completato tutti i test:

1. ✅ Nuovi utenti vengono creati con `role = 'society_admin'`
2. ✅ Society admins senza società vedono 0 dati
3. ✅ Society admins con società vedono SOLO i loro dati
4. ✅ Admin possono assegnare/rimuovere società
5. ✅ Admin vedono TUTTI i dati
6. ✅ Iscrizioni usano il `society_id` corretto
7. ✅ Sistema sicuro e funzionante

---

**Buon Testing!** 🚀

Se trovi problemi, segnalali con:
- Descrizione del problema
- Steps per riprodurlo
- Screenshot (se possibile)
- Errori nella console del browser

