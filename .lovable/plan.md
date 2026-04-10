

## Plan: Poll-systeem + Update-banner + Skeleton Score Bug

### 1. Skeleton Score Bug Fix
De score-teller in het skelet-spel lijkt correct geïmplementeerd (`Object.values(results).filter(Boolean).length`). Het probleem kan zijn dat de vergelijking te strikt is, waardoor correcte antwoorden niet worden herkend. Fix: de `normalize`-functie verbeteren en een visuele bevestiging toevoegen (kort groen/rood kleuren van de score na elk antwoord) zodat het duidelijk is dat de score bijwerkt.

### 2. Poll-systeem
**Database:**
- Nieuwe tabel `update_polls` (id, question, options jsonb, created_by, is_active, created_at)
- Nieuwe tabel `poll_votes` (id, poll_id, user_id, selected_option, created_at) met unique constraint op (poll_id, user_id)
- RLS: iedereen kan actieve polls lezen, ingelogde users kunnen stemmen, admins/owners kunnen polls aanmaken/verwijderen

**UI:**
- In `SettingsDialog`: nieuwe knop "Stem op volgende update" die opent naar een poll-pagina/dialog
- Poll toont de vraag + opties als knoppen, na stemmen zie je de resultaten (staafdiagram)
- In Owner/Admin dashboard: sectie om polls te maken (vraag + opties invoeren) en te verwijderen/stoppen

### 3. Update-banner op Homepage
**Database:**
- Nieuwe tabel `update_announcements` (id, message text, image_url text nullable, is_active boolean, created_by uuid, created_at)
- RLS: iedereen kan actieve announcements lezen, owners kunnen CRUD

**Storage:**
- Gebruik bestaande of nieuwe storage bucket voor announcement-afbeeldingen

**UI:**
- Op de homepage linksboven (desktop): compact kaartje met update-bericht + optionele afbeelding
- Op mobiel: boven de game-knoppen als volledige breedte banner
- In Owner dashboard: nieuwe sectie met tekstveld voor bericht, optionele afbeelding-upload, en aan/uit toggle

### Technische details
- 2 database migraties (polls + announcements tabellen met RLS)
- Nieuwe componenten: `PollDialog.tsx`, `UpdateBanner.tsx`
- Aanpassingen aan: `SettingsDialog.tsx` (poll-knop), `Index.tsx` (banner), `Owner.tsx` (poll/banner beheer)
- `SkeletonLabel.tsx`: verbeterde normalisatie + visuele score feedback

