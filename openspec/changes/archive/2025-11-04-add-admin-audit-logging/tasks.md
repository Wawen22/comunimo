## 1. Modellazione dati
- [x] 1.1 Definire schema tabella `audit_logs` (azione, resource_type, resource_id, actor_id, payload, created_at)
- [x] 1.2 Creare migrazione Supabase + policy di sicurezza (RLS read-only per admin)

## 2. Integrazione logging
- [x] 2.1 Implementare helper per scrivere log dopo operazioni societarie/utenti
- [x] 2.2 Coprire percorsi critici (crea/aggiorna/disattiva società, assegnazioni user-society, gestione eventi)

## 3. UI consultazione
- [x] 3.1 Creare pagina Cronologia attività con filtri per data/attore/risorsa
- [x] 3.2 Implementare paginazione e dettagli payload
- [x] 3.3 QA permessi: solo admin può visualizzare
