# Comment-to-sell — setup

Funzionalità tipo ManyChat. Quando un follower **commenta una keyword** su un post/reel, oppure **risponde a una storia** con una keyword, il sistema:

1. Risponde pubblicamente al commento (opzionale, solo `comment`)
2. Manda un DM con un testo + link

UI di gestione: `/automations` nel CRM (admin only).

## 1. Schema Supabase

Esegui in SQL Editor:

```bash
supabase/automations.sql
```

Crea tabelle: `ig_accounts`, `automation_rules`, `dm_queue`, `automation_logs` con RLS per `auth.uid() = user_id`.

## 2. Variabili d'ambiente

Su Vercel → project `os` → Settings → Environment Variables:

| Var | Note |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | già presenti |
| `SUPABASE_SERVICE_ROLE_KEY` | accesso server-side, bypass RLS |
| `META_APP_SECRET` | verifica firma `x-hub-signature-256` sui webhook |
| `IG_WEBHOOK_VERIFY_TOKEN` | challenge GET di Meta (stringa libera) |
| `CRON_SECRET` | già presente, usato anche da `dm-send` |

## 3. Setup Meta / Instagram

1. App in [developers.facebook.com](https://developers.facebook.com) con prodotto **Instagram Graph API** + **Webhooks**
2. Webhooks → Instagram, sottoscrivi:
   - `comments`
   - `messages` (per le story replies)
3. Callback URL: `https://os.altered-venganza.com/api/instagram-webhook`
4. Verify token: stesso valore di `IG_WEBHOOK_VERIFY_TOKEN`

## 4. Collegare un account

In `/automations` → "Collega account":

- Label
- IG user id (es. `17841...`)
- Page id (FB Page collegata all'IG business account)
- Page access token long-lived

Token long-lived: dal [Graph API Explorer](https://developers.facebook.com/tools/explorer/) o dal flow OAuth esistente.

## 5. Creare una regola

In `/automations` → "Nuova regola":

- **Trigger**: `comment` o `story_reply`
- **Post id** (solo comment, opzionale): vuoto = qualunque post
- **Keyword**: lista separata da virgola (case-insensitive)
- **Match**: `any` (basta una keyword) o `exact` (testo identico)
- **Risposta pubblica al commento**: opzionale, solo per `comment`
- **Testo DM** + **Link**: concatenati nel messaggio inviato

Le regole con `post_id` specifico hanno precedenza sulle generiche.

## 6. Cron DM

`vercel.json` schedula `/api/dm-send` ogni minuto. Processa fino a 25 job pending per esecuzione, max 3 tentativi.

Test manuale:

```bash
curl -X POST https://os.altered-venganza.com/api/dm-send \
  -H "Authorization: Bearer $CRON_SECRET"
```
