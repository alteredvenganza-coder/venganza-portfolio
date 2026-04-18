import { useEffect, useRef, useState, useCallback } from 'react';
import * as db from '../lib/db';
import { generateThumbnail } from '../lib/canvas-thumbnail';

/**
 * Single-canvas hook. Loads canvas metadata + cards + connections by id,
 * exposes mutations with debounced Supabase sync.
 */
export function useCanvas(canvasId) {
  const [canvas, setCanvas]           = useState(null);
  const [cards, setCards]             = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [saveState, setSaveState]     = useState('idle'); // idle | saving | saved

  // Pending patches keyed by entity id. Flushed on debounce timer.
  const pendingCardPatches    = useRef(new Map());
  const pendingCanvasPatch    = useRef(null);
  const flushTimer            = useRef(null);
  const thumbTimer            = useRef(null);
  const cardsRef              = useRef([]);

  // Undo/redo stacks. Each entry is { undo: () => void, redo: () => void }.
  // Scope (Option A): move/resize only. addCard/deleteCard clear both stacks.
  const undoStack             = useRef([]);
  const redoStack             = useRef([]);

  const mutationCount         = useRef(0);
  const AUTO_SNAPSHOT_EVERY   = 50;

  // ─── Load on mount / id change ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      db.fetchCanvasById(canvasId),
      db.fetchCanvasCards(canvasId),
      db.fetchCanvasConnections(canvasId),
    ]).then(([cv, cs, cn]) => {
      if (cancelled) return;
      setCanvas(cv);
      setCards(cs);
      setConnections(cn);
    }).catch(err => {
      if (!cancelled) setError(err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [canvasId]);

  // ─── Debounced flush ───────────────────────────────────────────────────────
  const scheduleFlush = useCallback(() => {
    setSaveState('saving');
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(async () => {
      flushTimer.current = null;
      // Cards
      const entries = Array.from(pendingCardPatches.current.entries());
      pendingCardPatches.current.clear();
      for (const [id, patch] of entries) {
        try { await db.patchCanvasCard(id, patch); }
        catch (e) { console.error('[useCanvas] patchCard failed', e); }
      }
      // Canvas metadata
      const cvPatch = pendingCanvasPatch.current;
      pendingCanvasPatch.current = null;
      if (cvPatch && canvasId) {
        try { await db.patchCanvas(canvasId, cvPatch); }
        catch (e) { console.error('[useCanvas] patchCanvas failed', e); }
      }
      setSaveState('saved');
      setTimeout(() => setSaveState(s => s === 'saved' ? 'idle' : s), 1500);
    }, 300);
  }, [canvasId]);

  // Keep a ref to current cards so the thumb timer reads fresh state.
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  // ─── Auto-snapshot every N mutations ─────────────────────────────────────
  async function maybeAutoSnapshot() {
    mutationCount.current += 1;
    if (mutationCount.current < AUTO_SNAPSHOT_EVERY) return;
    mutationCount.current = 0;
    try {
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      if (!user || !canvasId) return;
      await db.insertCanvasSnapshot(canvasId, user.id, {
        label: 'Auto ' + new Date().toLocaleString('it-IT'),
        cards: cardsRef.current,
        connections: [],
        thumbnail: null,
        kind: 'auto',
      });
    } catch (e) { console.error('[useCanvas] auto-snapshot failed', e); }
  }

  // ─── Thumbnail (debounced 2s) ─────────────────────────────────────────────
  const scheduleThumb = useCallback(() => {
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    thumbTimer.current = setTimeout(() => {
      thumbTimer.current = null;
      const thumb = generateThumbnail(cardsRef.current);
      if (!thumb) return;
      setCanvas(prev => prev ? { ...prev, thumbnail: thumb } : prev);
      pendingCanvasPatch.current = { ...(pendingCanvasPatch.current || {}), thumbnail: thumb };
      scheduleFlush();
    }, 2000);
  }, [scheduleFlush]);

  // Flush on unmount
  useEffect(() => () => {
    if (thumbTimer.current) { clearTimeout(thumbTimer.current); thumbTimer.current = null; }
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      // Fire-and-forget final flush
      const entries = Array.from(pendingCardPatches.current.entries());
      pendingCardPatches.current.clear();
      entries.forEach(([id, patch]) =>
        db.patchCanvasCard(id, patch).catch(e => console.error(e)));
      const cvPatch = pendingCanvasPatch.current;
      pendingCanvasPatch.current = null;
      if (cvPatch && canvasId) db.patchCanvas(canvasId, cvPatch).catch(e => console.error(e));
    }
  }, [canvasId]);

  // ─── Card mutations ────────────────────────────────────────────────────────
  async function addCard(partial) {
    const created = await db.insertCanvasCard(canvasId, partial);
    setCards(prev => [...prev, created]);
    // Add invalidates undo history (re-inserting a deleted card is out of scope A).
    undoStack.current = [];
    redoStack.current = [];
    maybeAutoSnapshot();
    scheduleThumb();
    return created;
  }

  function updateCard(id, patch) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    const merged = { ...(pendingCardPatches.current.get(id) || {}), ...patch };
    pendingCardPatches.current.set(id, merged);
    scheduleFlush();
    if ('x' in patch || 'y' in patch || 'w' in patch || 'h' in patch) scheduleThumb();
  }

  function moveCards(updates) {
    // updates: Array<{ id, x, y }>
    setCards(prev => {
      const map = new Map(updates.map(u => [u.id, u]));
      return prev.map(c => map.has(c.id) ? { ...c, x: map.get(c.id).x, y: map.get(c.id).y } : c);
    });
    for (const u of updates) {
      const merged = { ...(pendingCardPatches.current.get(u.id) || {}), x: u.x, y: u.y };
      pendingCardPatches.current.set(u.id, merged);
    }
    scheduleFlush();
    scheduleThumb();
  }

  async function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(cn => cn.fromCard !== id && cn.toCard !== id));
    pendingCardPatches.current.delete(id);
    try { await db.removeCanvasCard(id); }
    catch (e) { console.error('[useCanvas] deleteCard failed', e); }
    // Delete invalidates undo history (same reasoning as addCard).
    undoStack.current = [];
    redoStack.current = [];
    maybeAutoSnapshot();
    scheduleThumb();
  }

  // ─── Undo / redo (move/resize commits) ───────────────────────────────────
  // Caller captures the card's before-state at drag start and calls this
  // after the drag ends. The forward change is already applied by incremental
  // updateCard calls; we just register the reversible pair.
  function commitCardPatch(id, prevPatch, nextPatch) {
    const eq = (a, b) => Object.keys({ ...a, ...b }).every(k => a[k] === b[k]);
    if (eq(prevPatch, nextPatch)) return;
    maybeAutoSnapshot();
    const apply = (patch) => {
      setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
      const merged = { ...(pendingCardPatches.current.get(id) || {}), ...patch };
      pendingCardPatches.current.set(id, merged);
      scheduleFlush();
      if ('x' in patch || 'y' in patch || 'w' in patch || 'h' in patch) scheduleThumb();
    };
    undoStack.current.push({
      undo: () => apply(prevPatch),
      redo: () => apply(nextPatch),
    });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  }

  function commitGroupMove(prevPositions, nextPositions) {
    // prev/nextPositions: Array<{ id, x, y }>
    undoStack.current.push({
      undo: () => moveCards(prevPositions),
      redo: () => moveCards(nextPositions),
    });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  }

  function undo() {
    const entry = undoStack.current.pop();
    if (!entry) return;
    entry.undo();
    redoStack.current.push(entry);
  }

  function redo() {
    const entry = redoStack.current.pop();
    if (!entry) return;
    entry.redo();
    undoStack.current.push(entry);
  }

  // ─── Connection mutations ──────────────────────────────────────────────────
  async function addConnection(fromCard, toCard) {
    if (fromCard === toCard) return null;
    const exists = connections.some(cn => cn.fromCard === fromCard && cn.toCard === toCard);
    if (exists) return null;
    const created = await db.insertCanvasConnection(canvasId, fromCard, toCard);
    setConnections(prev => [...prev, created]);
    return created;
  }

  async function deleteConnection(id) {
    setConnections(prev => prev.filter(c => c.id !== id));
    try { await db.removeCanvasConnection(id); }
    catch (e) { console.error('[useCanvas] deleteConnection failed', e); }
  }

  // ─── Canvas metadata mutations ─────────────────────────────────────────────
  function updateCanvas(patch) {
    setCanvas(prev => prev ? { ...prev, ...patch } : prev);
    pendingCanvasPatch.current = { ...(pendingCanvasPatch.current || {}), ...patch };
    scheduleFlush();
  }

  // ─── Snapshot restore ──────────────────────────────────────────────────────
  async function restoreSnapshot(snapshot) {
    // Replace current cards/connections with snapshot data.
    // Strategy: delete existing rows, insert snapshot rows fresh.
    // Returns { ok, deleteFails, insertFails, connectionFails } so callers can warn on partial failure.
    if (!canvasId) return { ok: false, deleteFails: 0, insertFails: 0, connectionFails: 0 };
    // Drop pending debounced patches — they're about to be obsolete and would
    // otherwise race against the restore (patching ids that no longer exist).
    if (flushTimer.current) { clearTimeout(flushTimer.current); flushTimer.current = null; }
    pendingCardPatches.current.clear();
    let deleteFails = 0, insertFails = 0, connectionFails = 0;
    const existingCards = cardsRef.current;
    for (const c of existingCards) {
      try { await db.removeCanvasCard(c.id); }
      catch (e) { deleteFails++; console.error('[restoreSnapshot] delete failed', e); }
    }
    const newCards = [];
    for (const c of snapshot.cards) {
      try {
        const created = await db.insertCanvasCard(canvasId, {
          type: c.type, x: c.x, y: c.y, w: c.w, h: c.h, data: c.data, refId: c.refId,
        });
        newCards.push({ ...created, _oldId: c.id });
      } catch (e) { insertFails++; console.error('[restoreSnapshot] insert failed', e); }
    }
    setCards(newCards);
    const idMap = new Map(newCards.map(c => [c._oldId, c.id]));
    const newConns = [];
    for (const cn of snapshot.connections) {
      const from = idMap.get(cn.fromCard);
      const to   = idMap.get(cn.toCard);
      if (!from || !to) { connectionFails++; continue; }
      try {
        const created = await db.insertCanvasConnection(canvasId, from, to);
        newConns.push(created);
      } catch (e) { connectionFails++; console.error('[restoreSnapshot] connection failed', e); }
    }
    setConnections(newConns);
    undoStack.current = [];
    redoStack.current = [];
    scheduleThumb();
    return { ok: deleteFails === 0 && insertFails === 0 && connectionFails === 0, deleteFails, insertFails, connectionFails };
  }

  return {
    canvas, cards, connections,
    loading, error, saveState,
    addCard, updateCard, deleteCard,
    addConnection, deleteConnection,
    updateCanvas,
    commitCardPatch, undo, redo,
    moveCards, commitGroupMove,
    restoreSnapshot,
  };
}
