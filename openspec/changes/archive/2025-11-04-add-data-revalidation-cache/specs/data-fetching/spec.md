## ADDED Requirements
### Requirement: Client Data Cache Layer
L'app dashboard MUST usare una cache client per le principali collezioni Supabase con politiche di revalidazione esplicite.

#### Scenario: Prima visualizzazione lista
- **GIVEN** un utente apre la lista società
- **WHEN** i dati vengono caricati tramite hook condiviso
- **THEN** la risposta MUST essere memorizzata in cache con `staleTime` configurabile e riutilizzata per navigazioni successive entro la finestra di validità

#### Scenario: Mutazione dati
- **GIVEN** una società viene aggiornata o creata tramite mutate helper
- **WHEN** l'operazione va a buon fine
- **THEN** la cache MUST invalidare/aggiornare automaticamente la query associata così che la UI mostri i dati aggiornati senza refresh manuale

#### Scenario: Revalidazione on focus
- **GIVEN** l'utente ritorna sulla tab del browser dopo alcuni minuti
- **WHEN** la politica di revalidazione lo richiede
- **THEN** l'hook MUST eseguire un refetch in background per mantenere i dati coerenti
