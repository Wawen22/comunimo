## Why
- La home dashboard mostra poche informazioni aggregate; gli admin devono aprire varie sezioni per avere visione d'insieme.
- Dati aggregati (società attive per ente, nuove iscrizioni settimanali, utenti in onboarding) aiutano la pianificazione.
- Un layer di insight migliora l'utilità della dashboard e supporta decisioni rapide.

## What Changes
- Definire widget di insight principali (es. card KPI, grafici mini sparkline).
- Introdurre API Supabase (RPC/view) o aggregazioni lato client per popolazione dei dati.
- Aggiornare layout dashboard per accomodare i nuovi pannelli con responsive design.

## Impact
- Miglior tempo di risposta decisionale per admin.
- Richiede calcoli aggregati e possibili ottimizzazioni query.
- Potenziale aumento chiamate, mitigabile con caching (dipende da change `add-data-revalidation-cache`).
