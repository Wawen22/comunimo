# ui Specification

## Purpose
TBD - created by archiving change add-shared-status-badges. Update Purpose after archive.
## Requirements
### Requirement: Status Badge Component
La UI MUST offrire un componente badge di stato riutilizzabile con varianti standardizzate.

#### Scenario: Stato attivo
- **GIVEN** una vista necessita di mostrare uno stato "attivo"
- **WHEN** viene usato il componente badge con variante `success`
- **THEN** il badge MUST visualizzare colori approvati (verde) con contrasto AA e testo "Attiva" di default

#### Scenario: Stato inattivo
- **GIVEN** una vista necessita di mostrare uno stato "inattivo"
- **WHEN** viene usato il componente badge con variante `inactive`
- **THEN** il badge MUST usare la palette neutro/rosa approvata e il testo "Inattiva" o equivalente fornito

#### Scenario: Stati estensibili
- **GIVEN** un nuovo stato richiede visualizzazione
- **WHEN** il componente riceve una variante registrata (es. `warning`, `error`)
- **THEN** il componente MUST applicare automaticamente le classi di stile e icona associate senza duplicare Tailwind nelle viste

