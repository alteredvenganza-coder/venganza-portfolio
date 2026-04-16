import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvases } from '../hooks/useStore';
import CanvasEngine from '../canvas/CanvasEngine';
import CanvasToolbar from '../canvas/CanvasToolbar';
import CanvasSidebar from '../canvas/CanvasSidebar';
import { renderCard } from '../canvas/cards';
import Connections from '../canvas/Connections';

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

  const { canvas, cards, connections, loading, updateCanvas, addCard, updateCard, deleteCard, addConnection } = useCanvas(resolvedId);
  const [tool, setTool] = useState('select');
  const [connectFrom, setConnectFrom] = useState(null);

  useEffect(() => { if (tool !== 'connect') setConnectFrom(null); }, [tool]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'h' || e.key === 'H') setTool('pan');
      if (e.key === 'c' || e.key === 'C') setTool('connect');
      if (e.key === 'Escape') setTool('select');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
        onTemplates={() => {/* TODO: open template panel */}}
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
          };
          addCard({ type, x: x - 110, y: y - 30, w: 230, ...(defaults[type] || {}) });
        }}
        svgChildren={<Connections connections={connections} cards={cards} refresh={cards} />}
      >
        {cards.map(c => renderCard(c, {
          ctx: {
            zoom: canvas?.zoom ?? 1,
            selected: false,
            tool,
            onSelect: () => {},
            onMove: (x, y) => updateCard(c.id, { x, y }),
            onMoveEnd: () => {},
            onResize: (w) => updateCard(c.id, { w }),
            onResizeEnd: () => {},
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
            onPlusClick: () => {},
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
    </div>
  );
}
