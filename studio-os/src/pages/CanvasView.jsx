import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvases } from '../hooks/useStore';
import CanvasEngine from '../canvas/CanvasEngine';
import CanvasToolbar from '../canvas/CanvasToolbar';
import { renderCard } from '../canvas/cards';

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

  const { canvas, cards, loading, updateCanvas, addCard, updateCard, deleteCard } = useCanvas(resolvedId);
  const [tool, setTool] = useState('select');

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
      <CanvasEngine
        panX={canvas?.panX ?? 0}
        panY={canvas?.panY ?? 0}
        zoom={canvas?.zoom ?? 1}
        tool={tool}
        onViewportChange={({ panX, panY, zoom }) => updateCanvas({ panX, panY, zoom })}
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
            onConnectStart: () => {},
            onConnectFinish: () => {},
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
      {/* Top-left back button */}
      <button
        onClick={() => navigate(clientId ? `/clients/${clientId}` : '/')}
        style={{
          position:'absolute', top:14, left:14, zIndex:50,
          padding:'6px 12px', border:'1px solid var(--cv-border)',
          borderRadius:6, background:'var(--cv-white)', color:'var(--cv-text)',
          fontSize:11, fontFamily:'DM Sans', cursor:'pointer',
        }}
      >← Indietro</button>
      <button
        onClick={() => addCard({ type: 'note', x: 3000, y: 3000, w: 230, data: { title: 'Note', text: '' } })}
        style={{
          position:'absolute', top:14, left:120, zIndex:50,
          padding:'6px 12px', border:'1px solid var(--cv-border)',
          borderRadius:6, background:'var(--cv-white)', color:'var(--cv-text)',
          fontSize:11, fontFamily:'DM Sans', cursor:'pointer',
        }}
      >+ Note</button>
    </div>
  );
}
