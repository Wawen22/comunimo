# audit Specification

## Purpose
TBD - created by archiving change add-admin-audit-logging. Update Purpose after archive.
## Requirements
### Requirement: Administrative Audit Trail
Il sistema MUST registrare le azioni amministrative critiche e renderle consultabili dagli admin autorizzati.

#### Scenario: Log operazioni società
- **GIVEN** un admin crea o disattiva una società
- **WHEN** l'operazione viene completata con successo
- **THEN** un record di audit MUST essere salvato con attore, timestamp e payload minimo (id società, tipo azione)

#### Scenario: Consultazione cronologia
- **GIVEN** un admin apre la pagina Cronologia attività
- **WHEN** filtra per intervallo temporale o attore
- **THEN** MUST visualizzare solo i record coerenti con i filtri, ordinati per data decrescente

#### Scenario: Protezione dati audit
- **GIVEN** un utente non admin prova ad accedere ai log
- **WHEN** esegue la richiesta
- **THEN** l'accesso MUST essere negato via RLS o verifica lato server

