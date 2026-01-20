## Why
- I campionati conclusi risultano ancora "in corso" perché il filtro usa solo `is_active`.
- L'archivio deve riflettere i campionati con data fine precedente a oggi.

## What Changes
- Aggiornare il criterio archivio: `end_date < oggi`.
- La vista "In corso" include campionati con `end_date` assente o >= oggi.
- Mantenere il filtro `is_active = true` per escludere record disattivati.

## Impact
- Affected specs: `championships` (modifica requisiti archivio).
- Affected code: `components/races/ChampionshipsList.tsx` (query e copy).
- Nessuna migrazione database.
