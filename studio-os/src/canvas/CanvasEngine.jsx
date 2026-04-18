import { useEffect, useRef, useState, useCallback } from 'react';

const WORLD_SIZE = 6000;
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 4;

/**
 * Stateless canvas viewport: handles pan/zoom and renders children
 * (cards, connections, etc.) inside a transformed world.
 *
 * Props:
 * - panX, panY, zoom: viewport state (controlled)
 * - onViewportChange({ panX, panY, zoom })
 * - tool: 'select' | 'pan' | 'connect'
 * - onBackgroundClick(worldX, worldY) — called on left-click on empty space
 * - onContextMenu(clientX, clientY, worldX, worldY)
 * - children — rendered inside the transformed world
 * - svgChildren — rendered inside the SVG layer (connections)
 */
export default function CanvasEngine({
  panX, panY, zoom, onViewportChange,
  tool = 'select',
  onBackgroundClick, onContextMenu, onDrop,
  onMarqueeEnd,
  children, svgChildren,
}) {
  const wrapRef = useRef(null);
  const [isPanning, setIsPanning]   = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [marquee, setMarquee] = useState(null); // { x0, y0, x1, y1 } in container px
  const marqueeStart = useRef(null);

  // ─── Wheel: zoom (with ctrl/meta) or pan ──────────────────────────────────
  const onWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = wrapRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
      const newPanX = cx - (cx - panX) * (newZoom / zoom);
      const newPanY = cy - (cy - panY) * (newZoom / zoom);
      onViewportChange({ panX: newPanX, panY: newPanY, zoom: newZoom });
    } else {
      onViewportChange({ panX: panX - e.deltaX, panY: panY - e.deltaY, zoom });
    }
  }, [panX, panY, zoom, onViewportChange]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.addEventListener('wheel', onWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ─── Mouse: pan on background or pan tool ─────────────────────────────────
  function onMouseDown(e) {
    if (e.button !== 0) return;
    const target = e.target;
    const isBackground = target === wrapRef.current || target.dataset.canvasBg === '1';
    if (tool === 'pan') {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      e.preventDefault();
      return;
    }
    if (isBackground && tool === 'select') {
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      marqueeStart.current = { x, y };
      setMarquee({ x0: x, y0: y, x1: x, y1: y });
      e.preventDefault();
      return;
    }
    if (isBackground) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      e.preventDefault();
    }
  }

  useEffect(() => {
    if (!isPanning) return;
    function move(e) {
      onViewportChange({
        panX: panStart.current.panX + (e.clientX - panStart.current.x),
        panY: panStart.current.panY + (e.clientY - panStart.current.y),
        zoom,
      });
    }
    function up() { setIsPanning(false); }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isPanning, zoom, onViewportChange]);

  useEffect(() => {
    if (!marquee) return;
    function move(e) {
      if (!marqueeStart.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      setMarquee({
        x0: marqueeStart.current.x,
        y0: marqueeStart.current.y,
        x1: e.clientX - rect.left,
        y1: e.clientY - rect.top,
      });
    }
    function up() {
      if (!marqueeStart.current) return;
      const m = marquee;
      marqueeStart.current = null;
      setMarquee(null);
      if (!onMarqueeEnd) return;
      const minX = Math.min(m.x0, m.x1);
      const minY = Math.min(m.y0, m.y1);
      const maxX = Math.max(m.x0, m.x1);
      const maxY = Math.max(m.y0, m.y1);
      if (maxX - minX < 4 && maxY - minY < 4) return; // treat as click
      const wMinX = (minX - panX) / zoom;
      const wMinY = (minY - panY) / zoom;
      const wMaxX = (maxX - panX) / zoom;
      const wMaxY = (maxY - panY) / zoom;
      onMarqueeEnd({ minX: wMinX, minY: wMinY, maxX: wMaxX, maxY: wMaxY });
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [marquee, panX, panY, zoom, onMarqueeEnd]);

  function onClick(e) {
    if (e.target !== wrapRef.current && e.target.dataset.canvasBg !== '1') return;
    if (!onBackgroundClick) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const wx = (e.clientX - rect.left - panX) / zoom;
    const wy = (e.clientY - rect.top  - panY) / zoom;
    onBackgroundClick(wx, wy);
  }

  function onContextMenuLocal(e) {
    e.preventDefault();
    if (!onContextMenu) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const wx = (e.clientX - rect.left - panX) / zoom;
    const wy = (e.clientY - rect.top  - panY) / zoom;
    onContextMenu(e.clientX, e.clientY, wx, wy);
  }

  const cursor = isPanning ? 'grabbing' : tool === 'pan' ? 'grab' : tool === 'connect' ? 'crosshair' : 'default';

  return (
    <div
      ref={wrapRef}
      data-canvas-bg="1"
      onMouseDown={onMouseDown}
      onClick={onClick}
      onContextMenu={onContextMenuLocal}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!onDrop) return;
        const type = e.dataTransfer.getData('cardType');
        if (!type) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const wx = (e.clientX - rect.left - panX) / zoom;
        const wy = (e.clientY - rect.top  - panY) / zoom;
        onDrop(type, wx, wy);
      }}
      style={{
        position: 'absolute',
        top: 0, left: 60, right: 0, bottom: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--cv-bg)',
        backgroundImage: 'radial-gradient(circle, var(--cv-dot) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        cursor,
      }}
    >
      <div data-canvas-world style={{
        position: 'absolute',
        top: 0, left: 0,
        width: WORLD_SIZE, height: WORLD_SIZE,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}>
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
        >
          {svgChildren}
        </svg>
        {children}
      </div>
      {marquee && (
        <div style={{
          position: 'absolute',
          left: Math.min(marquee.x0, marquee.x1),
          top:  Math.min(marquee.y0, marquee.y1),
          width:  Math.abs(marquee.x1 - marquee.x0),
          height: Math.abs(marquee.y1 - marquee.y0),
          border: '1px dashed var(--cv-gold2)',
          background: 'rgba(212,176,107,0.08)',
          pointerEvents: 'none',
          zIndex: 100,
        }} />
      )}
    </div>
  );
}

export { WORLD_SIZE, MIN_ZOOM, MAX_ZOOM };
