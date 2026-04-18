import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvases } from '../hooks/useStore';
import CanvasEngine from '../canvas/CanvasEngine';
import CanvasToolbar from '../canvas/CanvasToolbar';
import CanvasSidebar from '../canvas/CanvasSidebar';
import { renderCard } from '../canvas/cards';
import Connections from '../canvas/Connections';
import TemplatePanel from '../canvas/TemplatePanel';
import AddPopup from '../canvas/AddPopup';
import ContextMenu from '../canvas/ContextMenu';
import CanvasMinimap from '../canvas/CanvasMinimap';
import AiPanel from '../canvas/AiPanel';
import SnapshotsPanel from '../canvas/SnapshotsPanel';
import { exportCanvasPng } from '../canvas/exportCanvas';

export default function CanvasView() {
  const { canvasId, id: clientId } = useParams();
  const navigate = useNavigate();
  const { addCanvas } = useCanvases();
  const [resolvedId, setResolvedId] = useState(canvasId === 'new' ? null : canvasId);

  // If canvasId is "new", create a fresh canvas and redirect
  useEffect(() => {
    if (canvasId !== 'new' || resolvedId) return;
    addCanvas({ name: 'Untitled Canvas', clientId: clientId || null })
      .then(c => {
        const target = clientId
          ? `/clients/${clientId}/canvas/${c.id}`
          : `/canvas/${c.id}`;
        navigate(target, { replace: true });
        setResolvedId(c.id);
      });
  }, [canvasId, clientId, addCanvas, navigate, resolvedId]);

  const { canvas, cards, connections, loading, saveState, updateCanvas, addCard, updateCard, deleteCard, addConnection, deleteConnection, commitCardPatch, undo, redo, moveCards, commitGroupMove, restoreSnapshot } = useCanvas(resolvedId);
  const dragBeforeRef = useRef(null); // { id, patch }
  const [tool, setTool] = useState('select');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Backwards-compat helpers used by callers below
  const selectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;
  function setSelectedId(id) {
    setSelectedIds(id ? new Set([id]) : new Set());
  }
  function toggleSelected(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [addPopup, setAddPopup] = useState(null); // { x, y, refCard? }
  const [ctxMenu,  setCtxMenu]  = useState(null); // { x, y, worldX, worldY }

  useEffect(() => { if (tool !== 'connect') setConnectFrom(null); }, [tool]);

  useEffect(() => {
    function onKey(e) {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (isCtrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }
      if (isCtrl && (e.key === 'd' || e.key === 'D') && selectedIds.size) {
        e.preventDefault();
        const ids = [...selectedIds];
        ids.forEach(id => {
          const c = cards.find(cd => cd.id === id);
          if (c) addCard({ type: c.type, x: c.x + 20, y: c.y + 20, w: c.w, data: c.data });
        });
        return;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'h' || e.key === 'H') setTool('pan');
      if (e.key === 'c' || e.key === 'C') setTool('connect');
      if (e.key === 'Escape') { setTool('select'); setSelectedId(null); setSelectedConnId(null); setAddPopup(null); setCtxMenu(null); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnId) { deleteConnection(selectedConnId); setSelectedConnId(null); return; }
        if (selectedIds.size === 0) return;
        const ids = [...selectedIds];
        ids.forEach(id => deleteCard(id));
        setSelectedIds(new Set());
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, selectedConnId, cards, addCard, deleteCard, deleteConnection, undo, redo]);

  if (!resolvedId || loading) {
    return (
      <div className="canvas-root" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color: 'var(--cv-muted)', fontSize: 12 }}>Caricamento canvas…</p>
      </div>
    );
  }

  return (
    <div className="canvas-root">
      <CanvasSidebar
        onHome={() => navigate(clientId ? `/clients/${clientId}` : '/')}
        onTemplates={() => setShowTemplates(true)}
        onAi={() => setShowAi(v => !v)}
        onExport={() => exportCanvasPng(cards, canvas?.name)}
        onSnapshots={() => setShowSnapshots(v => !v)}
      />
      <CanvasEngine
        panX={canvas?.panX ?? 0}
        panY={canvas?.panY ?? 0}
        zoom={canvas?.zoom ?? 1}
        tool={tool}
        onViewportChange={({ panX, panY, zoom }) => updateCanvas({ panX, panY, zoom })}
        onDrop={(type, x, y) => {
          const defaults = {
            note:    { data: { title: 'Note',  text: '' } },
            image:   { data: { title: 'Image' } },
            link:    { data: { title: 'Link',  url: '' } },
            todo:    { data: { title: 'To-do', items: [] } },
            board:   { data: { title: 'Board', subCards: [] } },
            heading: { data: { title: 'NEW HEADING' } },
            budget:             { data: {} },
            tasks:              { data: { filter: 'open' } },
            files:              { data: {} },
            'project-overview': { data: {} },
          };
          addCard({ type, x: x - 110, y: y - 30, w: 230, ...(defaults[type] || {}) });
        }}
        svgChildren={<Connections connections={connections} cards={cards} refresh={cards}
                                   selectedConnectionId={selectedConnId}
                                   onSelectConnection={(id) => { setSelectedConnId(id); setSelectedId(null); }} />}
        onContextMenu={(cx, cy, wx, wy) => setCtxMenu({ x: cx, y: cy, worldX: wx, worldY: wy })}
        onBackgroundClick={() => { setSelectedId(null); setSelectedConnId(null); }}
        onMarqueeEnd={(box) => {
          const hits = cards.filter(c => {
            const cx0 = c.x, cy0 = c.y;
            const cx1 = c.x + c.w, cy1 = c.y + (c.h ?? 220);
            return cx0 < box.maxX && cx1 > box.minX && cy0 < box.maxY && cy1 > box.minY;
          });
          setSelectedIds(new Set(hits.map(h => h.id)));
        }}
      >
        {cards.map(c => renderCard(c, {
          ctx: {
            zoom: canvas?.zoom ?? 1,
            selected: selectedIds.has(c.id),
            tool,
            onSelect: (e) => {
              if (e && (e.shiftKey || e.metaKey || e.ctrlKey)) toggleSelected(c.id);
              else setSelectedId(c.id);
            },
            onMoveStart: (before) => { dragBeforeRef.current = { id: c.id, patch: before }; },
            onMove: (x, y) => updateCard(c.id, { x, y }),
            onMoveEnd: (final) => {
              const b = dragBeforeRef.current;
              dragBeforeRef.current = null;
              if (b && final && b.id === c.id) commitCardPatch(c.id, b.patch, final);
            },
            groupIds: selectedIds.has(c.id) && selectedIds.size > 1 ? [...selectedIds] : null,
            groupBasePositions: selectedIds.has(c.id) && selectedIds.size > 1
              ? [...selectedIds].map(id => {
                  const cc = cards.find(cd => cd.id === id);
                  return cc ? { id: cc.id, x: cc.x, y: cc.y } : null;
                }).filter(Boolean)
              : null,
            onGroupMoveStart: (positions) => { dragBeforeRef.current = { groupPositions: positions }; },
            onGroupMove: (deltaX, deltaY, basePositions) => {
              moveCards(basePositions.map(p => ({ id: p.id, x: p.x + deltaX, y: p.y + deltaY })));
            },
            onGroupMoveEnd: (basePositions, deltaX, deltaY) => {
              const before = dragBeforeRef.current?.groupPositions;
              dragBeforeRef.current = null;
              if (!before) return; // interrupted drag — no-op rather than commit a no-op undo entry
              const after = basePositions.map(p => ({ id: p.id, x: p.x + deltaX, y: p.y + deltaY }));
              commitGroupMove(before, after);
            },
            onResizeStart: (before) => { dragBeforeRef.current = { id: c.id, patch: before }; },
            onResize: (w) => updateCard(c.id, { w }),
            onResizeEnd: (final) => {
              const b = dragBeforeRef.current;
              dragBeforeRef.current = null;
              if (b && final && b.id === c.id) commitCardPatch(c.id, b.patch, final);
            },
            onDelete: () => deleteCard(c.id),
            onDuplicate: () => addCard({
              type: c.type, x: c.x + 20, y: c.y + 20, w: c.w, data: c.data,
            }),
            onConnectStart: () => { setTool('connect'); setConnectFrom(c.id); },
            onConnectFinish: () => {
              if (connectFrom && connectFrom !== c.id) {
                addConnection(connectFrom, c.id);
                setConnectFrom(null);
                setTool('select');
              }
            },
            onPlusClick: (cx, cy) => setAddPopup({ x: cx, y: cy, refCard: c }),
          },
          onUpdate: (patch) => updateCard(c.id, patch),
        }))}
      </CanvasEngine>
      <CanvasToolbar
        tool={tool}
        onToolChange={setTool}
        zoom={canvas?.zoom ?? 1}
        onZoomChange={(z) => updateCanvas({ zoom: z })}
        onFit={() => {
          if (!cards.length) return;
          const minX = Math.min(...cards.map(c => c.x));
          const minY = Math.min(...cards.map(c => c.y));
          const maxX = Math.max(...cards.map(c => c.x + c.w));
          const maxY = Math.max(...cards.map(c => c.y + 220));
          const pad = 120;
          const w = maxX - minX + pad * 2;
          const h = maxY - minY + pad * 2;
          const z = Math.min(window.innerWidth / w, window.innerHeight / h, 1);
          updateCanvas({
            zoom: z,
            panX: (window.innerWidth  - w * z) / 2 - minX * z + pad * z,
            panY: (window.innerHeight - h * z) / 2 - minY * z + pad * z,
          });
        }}
      />
      <CanvasMinimap
        panX={canvas?.panX ?? 0}
        panY={canvas?.panY ?? 0}
        zoom={canvas?.zoom ?? 1}
        cards={cards}
      />
      <TemplatePanel
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={(tmpl) => {
          const z  = canvas?.zoom ?? 1;
          const px = canvas?.panX ?? 0;
          const py = canvas?.panY ?? 0;
          const centerWorldX = (window.innerWidth  / 2 - px) / z;
          const centerWorldY = (window.innerHeight / 2 - py) / z;
          const dx = centerWorldX - 3000;
          const dy = centerWorldY - 3000;

          const SMART = ['budget', 'tasks', 'files', 'project-overview'];

          tmpl.cards.forEach((c) => {
            const { type, x, y, w, ...rest } = c;
            const isSmart = SMART.includes(type);
            const data    = isSmart ? (rest.data || {}) : rest;
            const refId   = isSmart ? (rest.refId || null) : undefined;
            addCard({
              type,
              x: x + dx,
              y: y + dy,
              w: w || 230,
              ...(refId !== undefined ? { refId } : {}),
              data,
            });
          });
          setShowTemplates(false);
        }}
      />

      <AddPopup
        x={addPopup?.x} y={addPopup?.y}
        onClose={() => setAddPopup(null)}
        onPick={(type) => {
          const ref = addPopup.refCard;
          const x = ref ? ref.x + ref.w + 20 : 3000;
          const y = ref ? ref.y : 3000;
          const defaults = {
            note:    { data: { title: 'Note',  text: '' } },
            image:   { data: { title: 'Image' } },
            link:    { data: { title: 'Link',  url: '' } },
            todo:    { data: { title: 'To-do', items: [] } },
            board:   { data: { title: 'Board', subCards: [] } },
            heading: { data: { title: 'NEW HEADING' } },
            budget:             { data: {} },
            tasks:              { data: { filter: 'open' } },
            files:              { data: {} },
            'project-overview': { data: {} },
          };
          addCard({ type, x, y, w: 230, ...(defaults[type] || {}) });
          setAddPopup(null);
        }}
      />

      {/* Save indicator */}
      <div style={{
        position: 'absolute', top: 12, right: 16, zIndex: 50,
        fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase',
        color: saveState === 'saving' ? 'var(--cv-muted)' : saveState === 'saved' ? 'var(--cv-gold2)' : 'transparent',
        transition: 'color .3s ease, opacity .3s ease',
        opacity: saveState === 'idle' ? 0 : 1,
        padding: '4px 10px', borderRadius: 5,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}>
        {saveState === 'saving' ? 'Salvando…' : saveState === 'saved' ? 'Salvato ✓' : ''}
      </div>

      <AiPanel
        open={showAi}
        onClose={() => setShowAi(false)}
        onAddCard={(payload) => {
          const z  = canvas?.zoom ?? 1;
          const px = canvas?.panX ?? 0;
          const py = canvas?.panY ?? 0;
          const cx = (window.innerWidth  / 2 - px) / z;
          const cy = (window.innerHeight / 2 - py) / z;
          addCard({
            type: payload.type || 'note',
            x: cx - 115,
            y: cy - 40,
            w: 230,
            data: payload.data || { title: '✨ MAT AI', text: '' },
          });
        }}
      />

      <SnapshotsPanel
        open={showSnapshots}
        onClose={() => setShowSnapshots(false)}
        canvasId={resolvedId}
        cards={cards}
        connections={connections}
        thumbnail={canvas?.thumbnail}
        onRestore={restoreSnapshot}
      />

      <ContextMenu
        x={ctxMenu?.x} y={ctxMenu?.y}
        onClose={() => setCtxMenu(null)}
        onAdd={(type) => {
          const defaults = {
            note: { data: { title:'Note', text:'' } },
            image: { data: { title:'Image' } },
            todo: { data: { title:'To-do', items:[] } },
            board: { data: { title:'Board', subCards:[] } },
            heading: { data: { title:'NEW HEADING' } },
          };
          addCard({ type, x: ctxMenu.worldX - 110, y: ctxMenu.worldY - 30, w: 230, ...(defaults[type] || {}) });
          setCtxMenu(null);
        }}
        onFit={() => { setCtxMenu(null); }}
        onClear={() => {
          if (confirm('Svuotare il canvas?')) {
            cards.forEach(c => deleteCard(c.id));
          }
          setCtxMenu(null);
        }}
      />
    </div>
  );
}
