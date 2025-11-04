## ADDED Requirements
### Requirement: Admin Onboarding Journey
La piattaforma DEVE guidare i nuovi amministratori attraverso gli step iniziali fondamentali e tracciare i progressi.

#### Scenario: Checklist step iniziali
- **GIVEN** un admin accede per la prima volta
- **WHEN** apre la dashboard
- **THEN** DEVE vedere una checklist con step principali (crea società, invita utenti, importa membri) e poterli marcare completati automaticamente o manualmente

#### Scenario: Tooltip contestuali
- **GIVEN** un admin visita una pagina chiave per la prima volta (es. Società)
- **WHEN** la pagina viene caricata
- **THEN** DEVE apparire un tooltip/breve guida che spiega l'azione primaria e può essere dismessa

#### Scenario: Persistenza avanzamento
- **GIVEN** l'admin completa uno step onboarding
- **WHEN** torna successivamente sulla dashboard
- **THEN** lo stato completato DEVE essere persistito e non riproposto, salvo reset esplicito
