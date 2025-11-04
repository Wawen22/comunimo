## 1. Modellazione dati
- [ ] 1.1 Definire schema tabella `audit_logs` (azione, resource_type, resource_id, actor_id, payload, created_at)
- [ ] 1.2 Creare migrazione Supabase + policy di sicurezza (RLS read-only per admin)

## 2. Integrazione logging
- [ ] 2.1 Implementare helper per scrivere log dopo operazioni societarie/utenti
- [ ] 2.2 Coprire percorsi critici (crea/aggiorna/disattiva società, assegnazioni user-society, gestione eventi)

## 3. UI consultazione
- [ ] 3.1 Creare pagina Cronologia attività con filtri per data/attore/risorsa
- [ ] 3.2 Implementare paginazione e dettagli payload
- [ ] 3.3 QA permessi: solo admin può visualizzare
