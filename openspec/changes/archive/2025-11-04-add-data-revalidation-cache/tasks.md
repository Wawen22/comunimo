## 1. Selezione libreria e bootstrap
- [x] 1.1 Valutare React Query vs SWR (considerare supporto SSR/Next.js app router)
- [x] 1.2 Configurare provider globale nel layout principale
- [x] 1.3 Definire convenzioni di naming per hooks e chiavi cache

## 2. Implementazione hook condivisi
- [x] 2.1 Creare `useSocieties` con fetch e mutation helpers
- [x] 2.2 Migrare viste Società a usare l'hook condiviso
- [x] 2.3 Replicare pattern per membri/iscrizioni prioritari

## 3. Invalidazione e UX
- [x] 3.1 Collegare mutate/invalidation dopo create/update/delete
- [x] 3.2 Gestire optimistic updates dove utile (es. toggle attivo)
- [x] 3.3 QA: verificare che dati si aggiornino senza refresh manuale
