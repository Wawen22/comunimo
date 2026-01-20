## Why
- L'elenco campionati include anche stagioni passate, rendendo meno immediata la lettura dei campionati in corso.
- Serve distinguere rapidamente i campionati attivi da quelli archiviati senza perdere accesso allo storico.

## What Changes
- Aggiungere un filtro/toggle "In corso" (default) e "Archivio" nella lista campionati.
- "Archivio" mostra i campionati con `is_active = false` (archiviati).
- Ricerca e paginazione si applicano sempre al filtro selezionato.
- Messaggi empty state aggiornati per la vista Archivio.

## Impact
- Affected specs: nuova capability `championships`.
- Affected code: `components/races/ChampionshipsList.tsx` (UI + query), opzionale copy/UI.
- Nessuna migrazione database: riuso del campo `is_active`.
