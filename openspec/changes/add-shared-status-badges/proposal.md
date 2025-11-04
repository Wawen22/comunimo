## Why
- Status indicators (es. "Attiva"/"Inattiva") sono implementati con classi Tailwind replicate in più viste.
- L'incoerenza visiva aumenta il debito UI e rende costoso introdurre nuovi stati o varianti.
- Un componente/UI pattern condiviso semplifica la manutenzione e previene regressioni cromatiche/accessibilità.

## What Changes
- Introdurre un componente UI condiviso per badge di stato con palette approvate (successo, warning, danger, neutral).
- Documentare gli stati supportati e regole d'uso nel design system interno.
- Aggiornare le viste principali (società, utenti, iscrizioni) a usare il nuovo componente condiviso.

## Impact
- Riduzione di codice duplicato e design inconsistenze.
- Migliore accessibilità (contrasto garantito) e riconoscibilità degli stati.
- Perf inalterata; richiede refactor UI mirati.
