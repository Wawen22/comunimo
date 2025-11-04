## Why
- Le liste più consultate (società, membri, iscrizioni) richiedono fetch Supabase ad ogni apertura/modale, aumentando latenza percepita.
- Mancano caching e revalidazioni automatiche lato client, causando refetch ridondanti.
- Un layer di data-fetching (SWR o React Query) migliorerebbe UX e semplificherebbe l'invalidazione centralizzata.

## What Changes
- Introdurre una libreria di data fetching con cache (es. React Query) a livello app.
- Implementare hook condivisi (`useSocieties`, `useMembers`, ...) con politiche di stale-time configurabili.
- Collegare eventi di mutazione per invalidare automaticamente la cache dopo create/update/delete.

## Impact
- Migliore responsività UI, minori chiamate ripetute a Supabase.
- Leggera complessità aggiuntiva (provider globale, migrazione hook).
- Richiede regressione test per assicurare dati aggiornati post-mutate.
