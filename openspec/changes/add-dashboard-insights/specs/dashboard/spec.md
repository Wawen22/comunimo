## ADDED Requirements
### Requirement: Admin Dashboard Insights
La dashboard amministrativa DEVE mostrare KPI sintetici aggiornati per stato piattaforma.

#### Scenario: Vista generale
- **GIVEN** un admin apre la dashboard principale
- **WHEN** i widget vengono renderizzati
- **THEN** DEVONO includere almeno il numero di società attive, nuovi membri nelle ultime 2 settimane e eventi imminenti entro 30 giorni

#### Scenario: Aggiornamento periodico
- **GIVEN** è passato il periodo di refresh configurato (es. 5 minuti)
- **WHEN** la dashboard rimane aperta
- **THEN** i widget DEVONO revalidare i dati per riflettere cambi recenti

#### Scenario: Responsività
- **GIVEN** l'admin usa un dispositivo mobile
- **WHEN** visualizza gli insight
- **THEN** i widget DEVONO adattarsi a layout a colonna mantenendo leggibilità dei KPI principali
