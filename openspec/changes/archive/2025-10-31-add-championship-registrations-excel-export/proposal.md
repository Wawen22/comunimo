## Why
Le società vogliono esportare gli atleti già iscritti a un campionato in un file Excel per inviarlo a FIDAL/UISP. Al momento esiste solo l'esportazione CSV generica della lista atleti, ma l'organizzazione chiede un file strutturato con colonne specifiche (gara, specialità, tessera, società, ecc.) basato sulle iscrizioni confermate.

## What Changes
- Aggiungere l'azione di esportazione in Excel nell'elenco iscritti di un campionato.
- Creare un generatore `.xlsx` che produce le colonne richieste partendo dai dati delle iscrizioni confermate.
- Mappare i valori formattati (es. "ENTE: numero tessera", "Cognome, Nome (anno)", codici società) e gestire i campi opzionali come le scadenze.

## Impact
- Nuovo punto d'azione UI nella pagina iscrizioni campionato.
- Nuova utility per generare file Excel lato client con `xlsx`.
- Nessun impatto sulle API o sul database.
