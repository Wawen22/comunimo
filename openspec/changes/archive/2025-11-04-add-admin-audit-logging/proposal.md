## Why
- Operazioni sensibili (creazione/disattivazione società, assegnazione utenti) non lasciano traccia consultabile.
- Serve audit trail per supporto, accountability e possibili requisiti normativi.
- Un sistema di audit interno riduce ambiguità su chi ha effettuato azioni critiche.

## What Changes
- Introdurre tabella/log Supabase per eventi amministrativi con metadati (utente, timestamp, payload).
- Creare helper server-side per registrare automaticamente eventi da mutazioni critiche.
- Fornire UI di consultazione filtrabile per admin (cronologia attività).

## Impact
- Migliore tracciabilità e supporto.
- Richiede migrazione DB + aggiornamento API.
- Possibile aumento storage/log; valutare retention e cleanup.
