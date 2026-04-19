# Canvas — Quickstart

Milanote-style infinite canvas integrato in Studio-OS. Ogni cliente avrà i suoi canvas (in Phase 2), per ora il canvas è studio-wide.

## Routes

- `/canvas/new` — auto-crea un canvas nuovo e redirige all'UUID
- `/canvas/:id` — apre canvas esistente (studio-wide)
- `/clients/:clientId/canvas/:id` — canvas associato a un cliente (Phase 2 wires the UI)

## Sidebar (sinistra)

Trascina sul canvas: **Note**, **Image**, **Link**, **To-do**, **Board**, **Title**.
**Templ** apre il pannello template laterale. **Home** torna al CRM.

## Toolbar in basso

- **↖ Select** (V) — seleziona / muovi / modifica
- **✋ Pan** (H) — sposta il viewport
- **→ Connect** (C) — clicca due card per collegarle con curva tratteggiata
- **− % +** — zoom in/out
- **⛶ Fit** — adatta tutti i contenuti al viewport

## Card

Hover su una card mostra:
- **Action buttons** sopra (connect ↔, duplicate ⎘, delete ×)
- **+ button** in basso a destra → popup per aggiungere card collegata

Drag dall'header per spostare. Drag dall'angolo basso-destra per ridimensionare.

## Keyboard

| Tasto | Azione |
|-------|--------|
| `V` | Select tool |
| `H` | Pan tool |
| `C` | Connect tool |
| `Esc` | Reset tool / chiudi popup / deselect |
| `Delete` / `Backspace` | Elimina card selezionata |
| `Ctrl/Cmd + Wheel` | Zoom |
| `Wheel` | Pan |
| `Ctrl/Cmd + Z` | Undo (move/resize) |
| `Ctrl/Cmd + Shift + Z` / `Ctrl+Y` | Redo |
| `Ctrl/Cmd + D` | Duplica card selezionata (funziona anche su selezione multipla) |
| `Ctrl/Cmd + K` | Apre Command Palette |
| `Alt + drag` | Muovi card fuori dalla griglia (disattiva snap) |
| `Shift + Click card` | Aggiungi/togli dalla selezione multipla |
| `Drag su sfondo` | Marquee selection (rubber-band) |
| Click su connessione → `Backspace` | Elimina connessione |
| Right-click | Menu contestuale (add elements, fit, clear) |

## Templates (Phase 1)

5 starter template disponibili in `Templ`:
- **Moodboard SS/AW** (fashion)
- **Tech Pack** (production)
- **Brainstorm Board** (planning)
- **Instagram Content Plan** (social)
- **Brand Identity** (branding)

Apply inserisce le card del template al centro del viewport corrente. Template è additivo (non cancella le card esistenti).

## Persistenza

Tutto salvato su Supabase:
- `canvases` — metadata + viewport
- `canvas_cards` — posizioni + dati
- `canvas_connections` — link tra card

Modifiche live (digitazione, drag, resize) → debounced (300ms) sync su Supabase. Pan/zoom salvati a fine drag/wheel.

## Fatto

- **Phase 2** — Smart cards (Budget, Tasks, Files, Project Overview) collegate ai dati CRM esistenti, ClientCanvasHub sostituisce ClientDetail — ✅
- **Phase 3** — HomePage rinnovata + MAT AI panel + undo/redo (move/resize) + thumbnail — ✅
- **Phase 3.5 (polish)** — bundle splitting, command palette Ctrl+K, delete connessioni, Ctrl+D duplicate, export PNG, snap-to-grid, save indicator, AI panel su endpoint Claude reale — ✅
- **Phase 4 (polish)** — multi-select + marquee + group drag, snapshot versioning (manuale + auto ogni 50 mutazioni), touch (pinch-zoom / pan / tap-drag), Playwright E2E smoke — ✅

## Fatto (Phase 4)

- **Multi-select** — `Shift + Click` + marquee (drag su sfondo). Group drag, delete e duplicate su selezione multipla con undo singolo.
- **Versioning** — pannello `Vers` in sidebar: salva snapshot manuale, lista ultime 50, ripristina con ↺. Snapshot automatici ogni 50 mutazioni (`kind: 'auto'`).
- **Touch** — pinch-zoom a due dita, pan a un dito su sfondo, tap-drag sulle card. Testato su iPad / Chrome touch emulator.
- **E2E** — `npm run test:e2e`. Richiede `E2E_EMAIL` / `E2E_PASSWORD` in `.env.local` (utente Supabase dedicato). Senza env vars il test si salta.

## In Arrivo

- Collaborazione real-time (Supabase Realtime o Yjs) — rinviata
- Canvas mobile UI dedicata (toolbar/sidebar adattive)
- Snapshot diff viewer
