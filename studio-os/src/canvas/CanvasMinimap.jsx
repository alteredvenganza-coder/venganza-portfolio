import { WORLD_SIZE } from './CanvasEngine';

export default function CanvasMinimap({ panX, panY, zoom, cards }) {
  const W = 120, H = 80;
  const scaleX = W / WORLD_SIZE;
  const scaleY = H / WORLD_SIZE;

  // Viewport rect in world coords
  const vw = window.innerWidth  / zoom;
  const vh = window.innerHeight / zoom;
  const vx = (-panX / zoom);
  const vy = (-panY / zoom);

  return (
    <div style={{
      position: 'absolute', bottom: 18, right: 16, width: W, height: H,
      background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
      borderRadius: 7, boxShadow: 'var(--cv-shadow)', zIndex: 30, overflow: 'hidden',
    }}>
      {cards.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: c.x * scaleX, top: c.y * scaleY,
          width: Math.max(2, c.w * scaleX), height: 4,
          background: 'var(--cv-muted2)', borderRadius: 1,
        }} />
      ))}
      <div style={{
        position: 'absolute',
        left: vx * scaleX, top: vy * scaleY,
        width:  Math.max(4, vw * scaleX),
        height: Math.max(4, vh * scaleY),
        border: '1.5px solid var(--cv-gold2)',
        background: 'rgba(212,184,112,.08)', pointerEvents: 'none',
      }} />
    </div>
  );
}
