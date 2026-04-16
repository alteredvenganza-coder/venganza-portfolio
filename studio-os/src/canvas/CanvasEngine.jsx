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
  children, svgChildren,
}) {
  const wrapRef = useRef(null);
  const [isPanning, setIsPanning]   = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

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
    if (tool === 'pan' || isBackground) {
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
      <div style={{
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
    </div>
  );
}

export { WORLD_SIZE, MIN_ZOOM, MAX_ZOOM };
