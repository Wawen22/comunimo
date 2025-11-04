# dashboard Specification

## Purpose
TBD - created by archiving change add-dashboard-insights. Update Purpose after archive.
## Requirements
### Requirement: Admin Dashboard Insights
La dashboard amministrativa MUST mostrare KPI sintetici aggiornati per stato piattaforma.

#### Scenario: Vista generale
- **GIVEN** un admin apre la dashboard principale
- **WHEN** i widget vengono renderizzati
- **THEN** i widget MUST includere almeno il numero di società attive, nuovi membri nelle ultime 2 settimane e eventi imminenti entro 30 giorni

#### Scenario: Aggiornamento periodico
- **GIVEN** è passato il periodo di refresh configurato (es. 5 minuti)
- **WHEN** la dashboard rimane aperta
- **THEN** i widget MUST revalidare i dati per riflettere cambi recenti

#### Scenario: Responsività
- **GIVEN** l'admin usa un dispositivo mobile
- **WHEN** visualizza gli insight
- **THEN** i widget MUST adattarsi a layout a colonna mantenendo leggibilità dei KPI principali

