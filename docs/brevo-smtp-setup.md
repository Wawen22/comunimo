# Guida configurazione SMTP Brevo

Questa procedura attiva il relay SMTP di [Brevo (ex Sendinblue)](https://www.brevo.com) per l'invio delle e-mail automatiche di ComUniMo.

## 1. Creazione account Brevo
- Registrati su https://www.brevo.com con l'indirizzo istituzionale (es. info@comunimo.it).
- Completa il wizard iniziale: dati aziendali, telefono e verifica indirizzo e-mail.

## 2. Verifica dominio mittente
Le e-mail transazionali devono provenire da un dominio verificato per evitare lo spam.

1. Entra in **Settings → Your senders → Domains**.
2. Clicca **Add a domain** e inserisci il dominio (es. `comunimo.it`).
3. Segui la procedura guidata per aggiungere i record DNS:
   - **SPF**: record TXT con valore fornito da Brevo (di solito include `include:spf.brevo.com`).
   - **DKIM**: record CNAME con il selettore indicato (es. `mail._domainkey`).
   - **DMARC** (opzionale ma consigliato): record TXT `_dmarc` con politica `v=DMARC1; p=none; rua=mailto:...`.
4. Dopo la propagazione DNS (può richiedere fino a 24h) torna nella dashboard e clicca **Authenticate** per each entry finché risultano “Verified”.

> Suggerimento: usa https://www.whatsmydns.net/ o l’equivalente del tuo registrar per controllare che i record siano visibili.

## 3. Abilitare il server SMTP
1. Vai in **Transactional → SMTP & API**.
2. Nella sezione **SMTP** prendi nota di:
   - Host: `smtp-relay.brevo.com`
   - Porta: `587` (STARTTLS) o `465` (TLS implicito)
   - Login (SMTP user)
   - Password (clicca “Generate a new SMTP key” se non presente)
3. Conserva le credenziali in modo sicuro: serviranno per `.env.local`.

## 4. Configurare variabili d’ambiente
In `./.env.local` aggiungi/modifica le variabili:

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=il_login_forntito_da_brevo
SMTP_PASS=la_password_smtp_generata
SMTP_FROM="ComUniMo <notifiche@comunimo.it>"
SMTP_SECURE=false   # usa true solo se scegli la porta 465
```

Poi riavvia `npm run dev` (o ridistribuisci in produzione) affinché Next.js ricarichi la configurazione.

## 5. Test invio
1. Apri `/dashboard/communications` e invia un messaggio di prova.
2. Controlla i log in **Transactional → Logs**: ogni e-mail dovrebbe risultare “Delivered”.
3. Verifica la casella destinazione (inbox/test). Se finisce in spam, verifica SPF/DKIM/DMARC e aggiungi un indirizzo “from” reale.

## 6. Opzioni aggiuntive
- **Tasso giornaliero**: il piano gratuito limita a ~300 e-mail/giorno. Se serve di più valuta un piano a pagamento.
- **Template**: puoi creare template HTML dentro Brevo e inviare via API con `templateId` (utile per layout complessi).
- **Webhook**: abilitando gli eventi (aperture, bounce) puoi sincronizzare lo stato sul database.

Una volta completati tutti i passaggi puoi reimpostare `sendEmail` a `true` nel form di comunicazione o rimuovere il flag temporaneo nel codice. In caso di dubbi ti basta seguire i log SMTP per individuare eventuali problemi.
