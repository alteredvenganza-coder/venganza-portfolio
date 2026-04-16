import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients, useProjects, useCanvases } from '../hooks/useStore';

/**
 * Ctrl/Cmd+K command palette. Searches canvases, clients, projects
 * and exposes quick navigation actions.
 */
export default function CommandPalette() {
  const navigate = useNavigate();
  const { canvases } = useCanvases();
  const { clients } = useClients();
  const { projects } = useProjects();

  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState('');
  const [sel, setSel]   = useState(0);
  const inputRef        = useRef(null);
  const listRef         = useRef(null);

  // Global shortcut
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [open]);

  const results = useMemo(() => {
    const items = [];
    // Actions
    items.push({ kind: 'action', label: '+ Nuovo canvas',     hint: 'Crea e apri',   run: () => navigate('/canvas/new') });
    items.push({ kind: 'action', label: '→ Home canvas',      hint: 'Launcher',       run: () => navigate('/canvas-home') });
    items.push({ kind: 'action', label: '→ Dashboard',        hint: 'CRM',            run: () => navigate('/') });
    items.push({ kind: 'action', label: '→ Clienti',          hint: '',               run: () => navigate('/clients') });
    items.push({ kind: 'action', label: '→ Pricing memory',   hint: '',               run: () => navigate('/pricing') });
    items.push({ kind: 'action', label: '→ Cashflow',         hint: '',               run: () => navigate('/cashflow') });
    items.push({ kind: 'action', label: '→ Calendario',       hint: '',               run: () => navigate('/calendario') });

    canvases.forEach(cv => {
      items.push({
        kind: 'canvas',
        label: cv.name || 'Untitled Canvas',
        hint: 'Canvas',
        run: () => navigate(cv.clientId ? `/clients/${cv.clientId}/canvas/${cv.id}` : `/canvas/${cv.id}`),
      });
    });
    clients.forEach(c => {
      items.push({
        kind: 'client',
        label: c.name,
        hint: c.brand || 'Cliente',
        run: () => navigate(`/clients/${c.id}`),
      });
    });
    projects.forEach(p => {
      items.push({
        kind: 'project',
        label: p.name || 'Progetto',
        hint: 'Progetto',
        run: () => navigate(`/projects/${p.id}`),
      });
    });

    const qq = q.trim().toLowerCase();
    if (!qq) return items.slice(0, 40);
    return items.filter(it => it.label.toLowerCase().includes(qq) || it.hint.toLowerCase().includes(qq)).slice(0, 50);
  }, [q, canvases, clients, projects, navigate]);

  useEffect(() => { setSel(0); }, [q]);

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') {
      const r = results[sel];
      if (r) { r.run(); setOpen(false); }
    }
  }

  if (!open) return null;

  return (
    <div onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(26,24,22,0.35)', backdropFilter: 'blur(2px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        paddingTop: '12vh',
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxWidth: '92vw',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 20px 60px rgba(26,24,22,0.25)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Cerca canvas, clienti, progetti… o un'azione"
          style={{
            border: 'none', outline: 'none', padding: '14px 16px',
            fontSize: 14, borderBottom: '1px solid #ede6d6',
          }}
        />
        <div ref={listRef} style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {results.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: '#9a9589' }}>Nessun risultato.</div>
          )}
          {results.map((r, i) => (
            <div key={r.kind + i}
              onMouseEnter={() => setSel(i)}
              onClick={() => { r.run(); setOpen(false); }}
              style={{
                padding: '9px 16px', fontSize: 13, cursor: 'pointer',
                background: i === sel ? '#faf4e5' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth: 0 }}>
                <span style={{
                  fontSize: 9, textTransform: 'uppercase',
                  letterSpacing: 1, color: '#9a7310', minWidth: 52,
                }}>{r.kind}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
              </div>
              {r.hint && <span style={{ fontSize: 10, color: '#9a9589' }}>{r.hint}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: '7px 12px', fontSize: 10, color: '#9a9589', borderTop: '1px solid #ede6d6', display: 'flex', gap: 14 }}>
          <span>↑↓ naviga</span><span>⏎ apri</span><span>Esc chiudi</span>
        </div>
      </div>
    </div>
  );
}
