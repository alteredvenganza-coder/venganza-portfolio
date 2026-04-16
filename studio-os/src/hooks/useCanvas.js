import { useEffect, useRef, useState, useCallback } from 'react';
import * as db from '../lib/db';

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

  // Pending patches keyed by entity id. Flushed on debounce timer.
  const pendingCardPatches    = useRef(new Map());
  const pendingCanvasPatch    = useRef(null);
  const flushTimer            = useRef(null);

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
    }, 300);
  }, [canvasId]);

  // Flush on unmount
  useEffect(() => () => {
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
    return created;
  }

  function updateCard(id, patch) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    const merged = { ...(pendingCardPatches.current.get(id) || {}), ...patch };
    pendingCardPatches.current.set(id, merged);
    scheduleFlush();
  }

  async function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(cn => cn.fromCard !== id && cn.toCard !== id));
    pendingCardPatches.current.delete(id);
    try { await db.removeCanvasCard(id); }
    catch (e) { console.error('[useCanvas] deleteCard failed', e); }
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

  return {
    canvas, cards, connections,
    loading, error,
    addCard, updateCard, deleteCard,
    addConnection, deleteConnection,
    updateCanvas,
  };
}
