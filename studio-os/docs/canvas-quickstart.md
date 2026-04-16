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
| `Ctrl/Cmd + D` | Duplica card selezionata |
| `Ctrl/Cmd + K` | Apre Command Palette |
| `Alt + drag` | Muovi card fuori dalla griglia (disattiva snap) |
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

## In Arrivo

- Multi-select + group drag
- Collaborazione real-time (Supabase Realtime o Yjs)
- Versioning/history dei canvas
- Canvas mobile (touch pinch-zoom)
- Test E2E
