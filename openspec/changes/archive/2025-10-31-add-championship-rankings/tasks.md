1. [x] Extend the database schema to persist championship-level ranking URLs (society and individual) and confirm the storage bucket strategy for ranking PDFs. Remember you have access to Supabase MCP.
2. [x] Update shared TypeScript types, Supabase client helpers, and any API utilities to expose the new ranking fields.
3. [x] Implement an admin UI flow that lets staff upload, replace, and remove a PDF ranking for each championship stage, wiring uploads to Supabase storage and saving the resulting URL on the event.
4. [x] Implement an admin UI flow on the championship detail screen that lets staff manage the two championship ranking PDFs and persists the URLs on the championship record.
5. [x] Surface download/open actions for the available ranking PDFs on the public pages (stage cards and championship overview) with appropriate empty states.
6. [x] Smoke-test uploads, replacements, deletions, and public access in the local environment and document any follow-up actions (e.g. creating storage buckets in production).
7. [x] Spostare la gestione delle classifiche nel dashboard iscrizioni con un modal dedicato che mostra sia le classifiche del campionato sia quelle delle tappe, includendo azioni di modifica per gli amministratori.
8. [x] Rinfrescare la sezione "Classifiche ufficiali" della landing con una UI coerente e luminosa mantenendo le azioni di download.
9. [x] Estendere la sezione classifiche della landing per mostrare in modo elegante sia le classifiche del campionato sia quelle delle tappe con design moderno.
10. [x] Integrare il countdown della prossima tappa direttamente nell'header "Stato iscrizioni" e rimuovere l'intera sezione dedicata "Prossima tappa ufficiale" dalla landing.
