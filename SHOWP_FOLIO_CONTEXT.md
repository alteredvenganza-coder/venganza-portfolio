# SHOW'P FOLIO — Stato del Progetto

## Repository
- **`alteredvenganza-coder/Folio`** — repo GitHub, connesso a Vercel
- URL produzione: `https://venganza-portfolio-fy8d.vercel.app`
- Stack: React + Vite, Supabase (auth + db), Vercel serverless functions

## Accesso GitHub API
Token: salvato in `~/.folio_github_token` (non committare)
Usato via `curl` GitHub API perché il git server Windows (porta 32973) è irraggiungibile dal cloud.

Esempio lettura file:
```bash
GITHUB_TOKEN="$(cat ~/.folio_github_token)"
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/alteredvenganza-coder/Folio/contents/src/pages/DashboardPage.jsx"
```

Esempio scrittura file (richiede SHA corrente + contenuto base64):
```bash
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/payload.json \
  "https://api.github.com/repos/alteredvenganza-coder/Folio/contents/PATH"
```

## Struttura file chiave
```
src/pages/DashboardPage.jsx   ← dashboard creator (ripristinata da commit b08cdc5)
api/instagram-callback.js     ← OAuth callback Instagram
api/instagram-test.js         ← tester connessione Instagram
api/instagram-feed.js         ← feed pubblico
api/create-checkout.js        ← Stripe checkout
vercel.json                   ← solo rewrite SPA, NO rewrite /api/ (fixato)
```

## Database Supabase
- Progetto: `jlwdlfeypbybjciokpin.supabase.co`
- Tabelle esistenti: `creators`, `tos_acceptances`
- `creators` contiene: `id`, `instagram_token`, `instagram_handle`

### Migration da eseguire (Supabase SQL Editor)
```sql
-- Aggiungi piano ai creator
ALTER TABLE creators ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

-- Tabella ordini
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  service text NOT NULL,
  status text DEFAULT 'pending',
  tracking_notes text,
  file_url text,
  file_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator owns orders" ON orders
  USING (creator_id = auth.uid());
```

## Vercel ENV vars
| Variabile | Stato |
|-----------|-------|
| `VITE_SUPABASE_URL` | ✓ presente |
| `VITE_SUPABASE_ANON_KEY` | ✓ presente |
| `SUPABASE_URL` | ✓ presente |
| `SUPABASE_SERVICE_KEY` | da verificare |
| `META_APP_ID` | ✓ = `791460136961933` |
| `VITE_META_APP_ID` | ✓ = `791460136961933` |
| `META_APP_SECRET` | **MANCANTE** → Instagram callback rotto |
| `INSTAGRAM_TOKEN` | **MANCANTE** → feed pubblico rotto |
| `STRIPE_SECRET_KEY` | **MANCANTE** → checkout rotto |
| `VITE_APP_URL` | ✓ = `https://venganza-portfolio-fy8d.vercel.app` |

## Instagram OAuth
- App Meta: **ShowP Folio-IG**, App ID `791460136961933`
- Scope: `instagram_business_basic` (Basic Display API deprecato dic 2024)
- App ID hardcodato in `DashboardPage.jsx` riga 940 (commit `9f4cb5b`)
  - Motivo: `import.meta.env.VITE_META_APP_ID` non bakava correttamente nel bundle Vite
- Callback `/api/instagram-callback` → scambia code → token long-lived → salva in `creators`
- `api/instagram-callback.js` usa `upsert` (non `update`) per gestire nuovi creator

## Dashboard Creator — Sezioni
Il `DashboardPage.jsx` ha 9 sezioni nel sidebar:
`Overview · Portfolio · Premades · Orders · Instagram · Brand · Themes · Payments · Settings`

Variabili stato principali:
```js
const [user, setUser] = useState(null);          // utente Supabase
const [profile, setProfile] = useState({});      // tabella profiles
const [igHandle, setIgHandle] = useState('');    // instagram_handle
const [igToken, setIgToken] = useState('');      // instagram_token
const [igToast, setIgToast] = useState('');      // feedback OAuth
const [igTest, setIgTest] = useState(null);      // risultato Test Connection
```

Pattern rendering sezioni:
```js
const sections = { overview: () => <...>, portfolio: () => <...>, ... }
return sections[activeSection]?.()
```

## Prossimo Task — Ordini + Tracking + Digital Asset

### Obiettivo
Feature riservata ai creator con `plan === 'studio'`.

### Flusso
1. Creator crea ordine manualmente (nome, email, servizio del cliente)
2. Aggiorna stato: `pending → in_progress → ready → delivered`
3. Carica file digitale → Supabase Storage bucket `order-files`
4. Cliente apre link `/track/:orderId` → vede timeline stato + scarica file

### File da creare / modificare
| File | Azione |
|------|--------|
| `src/pages/TrackPage.jsx` | NUOVO — pagina pubblica cliente, no login |
| `src/pages/DashboardPage.jsx` | MODIFICA — sezione Orders con gate piano Studio |
| `src/App.jsx` (o router) | MODIFICA — aggiungere route `/track/:id` |
| `api/track.js` | NUOVO — restituisce dati ordine pubblici (no auth) |
| `api/orders.js` | NUOVO — CRUD ordini + upload file (creator autenticato) |

### UI Dashboard Orders (piano Studio)
- Lista ordini con stato colorato
- Form crea ordine (client name, email, service)
- Click su ordine → aggiorna stato + note + upload file
- Copia link tracking da condividere col cliente

### UI Orders (piano Free)
- Card grigia: "Upgrade to Studio to manage orders and deliver digital assets"

### Stripe (da integrare dopo)
- Piano Studio = abbonamento mensile
- Per ora: `plan` impostato manualmente in Supabase

## Note tecniche importanti
- `DashboardPage.jsx` usa `supabase` direttamente (non hook `useAuth`)
- Variabile utente: `user` (non `session`)
- `LiquidGlass` component usato per elementi UI
- Vercel gestisce `/api/*.js` come serverless functions automaticamente
- NON aggiungere rewrite `/api/(.*)` in `vercel.json` — causa conflitti
