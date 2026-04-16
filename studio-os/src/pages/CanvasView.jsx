import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvases } from '../hooks/useStore';
import CanvasEngine from '../canvas/CanvasEngine';
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
        onViewportChange={({ panX, panY, zoom }) => updateCanvas({ panX, panY, zoom })}
      >
        {cards.map(c => renderCard(c, {
          ctx: {
            zoom: canvas?.zoom ?? 1,
            selected: false,
            tool: 'select',
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
