## MODIFIED Requirements
### Requirement: Vista Archivio Campionati
La lista campionati MUST mostrare di default i campionati in corso e consentire di passare alla vista archivio in base alla data di fine.

#### Scenario: vista predefinita
- **GIVEN** un utente apre la lista campionati
- **WHEN** la pagina viene caricata
- **THEN** MUST vedere solo i campionati con `end_date` nullo o >= data odierna e il filtro "In corso" selezionato

#### Scenario: accesso all'archivio
- **GIVEN** un utente vuole consultare i campionati archiviati
- **WHEN** seleziona il filtro "Archivio"
- **THEN** la lista MUST mostrare solo i campionati con `end_date` < data odierna e resettare la paginazione alla prima pagina

#### Scenario: ricerca con filtro attivo
- **GIVEN** l'utente ha selezionato un filtro ("In corso" o "Archivio")
- **WHEN** inserisce una ricerca per nome
- **THEN** i risultati MUST rispettare il filtro selezionato
