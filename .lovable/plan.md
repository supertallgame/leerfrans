

## Analyse

**Hoofdprobleem:** Je account is momenteel ingesteld met auto-confirm, waardoor verificatie-e-mails worden overgeslagen. De backend bevestigt accounts automatisch bij registratie (je account toont `email_confirmed_at` op exact dezelfde seconde als `created_at`).

**Code-status:**
- `AuthDialog.tsx`: Signup en wachtwoord-reset code is correct — roept de juiste backend-methodes aan
- `ResetPassword.tsx`: Reset-pagina en route (`/reset-password`) zijn correct ingesteld
- Geen eigen e-maildomein geconfigureerd — standaard systeemmails worden gebruikt

## Plan

### Stap 1: Auto-confirm uitschakelen
De backend-instelling voor automatische e-mailbevestiging moet worden uitgeschakeld. Dit zorgt ervoor dat:
- Bij **registratie** een verificatie-e-mail wordt verstuurd
- De gebruiker pas kan inloggen na bevestiging

### Stap 2: Wachtwoord-reset flow testen
De wachtwoord-reset code gebruikt `supabase.auth.resetPasswordForEmail` met redirect naar `/reset-password` — dit is correct. Na stap 1 zou de reset-e-mail ook via de standaard e-mailservice verstuurd moeten worden.

### Stap 3: Gebruikersfeedback verbeteren
Een kleine verbetering: na het aanvragen van een wachtwoord-reset, de gebruiker expliciet informeren dat de e-mail in de **spam/ongewenste map** kan belanden (aangezien er geen eigen domein is).

### Belangrijk om te weten
- Zonder eigen e-maildomein komen standaard systeemmails soms in de **spam-map** terecht. Dit is normaal gedrag.
- De e-mails worden verstuurd vanuit een generiek adres — niet vanuit je eigen merk.

### Technisch detail
- Gebruik `configure_auth` tool om `auto_confirm_email: false` in te stellen
- Kleine tekstwijziging in `AuthDialog.tsx` bij de forgot-password flow om spam-waarschuwing toe te voegen

