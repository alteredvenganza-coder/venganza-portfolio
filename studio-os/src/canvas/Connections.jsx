import { useEffect, useState } from 'react';

/**
 * Renders SVG paths for each connection. Reads card positions from the DOM
 * (since cards are absolute-positioned by id) so it's always in sync.
 */
export default function Connections({ connections, cards, refresh, selectedConnectionId, onSelectConnection }) {
  const [tick, setTick] = useState(0);

  // Re-render when refresh changes (called on drag/zoom)
  useEffect(() => { setTick(t => t + 1); }, [refresh]);

  // Build paths from card x/y/w in props (more reliable than DOM)
  const paths = connections.map(conn => {
    const a = cards.find(c => c.id === conn.fromCard);
    const b = cards.find(c => c.id === conn.toCard);
    if (!a || !b) return null;
    const ax = a.x + a.w / 2;
    const ay = a.y + 60;
    const bx = b.x + b.w / 2;
    const by = b.y + 60;
    const cx = (ax + bx) / 2;
    const selected = selectedConnectionId === conn.id;
    const d = `M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`;
    return (
      <g key={conn.id} style={{ cursor: 'pointer' }}
         onClick={(e) => { e.stopPropagation(); onSelectConnection && onSelectConnection(conn.id); }}>
        {/* Invisible wide hit-area for easy click */}
        <path d={d} fill="none" stroke="transparent" strokeWidth="14" />
        <path
          d={d}
          fill="none"
          stroke={selected ? 'rgba(154,115,16,1)' : 'rgba(154,115,16,0.5)'}
          strokeWidth={selected ? 2.5 : 1.5}
          strokeDasharray="5 3"
          markerEnd="url(#cv-arr)"
        />
      </g>
    );
  }).filter(Boolean);

  return (
    <>
      <defs>
        <marker id="cv-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(154,115,16,0.6)" />
        </marker>
      </defs>
      {paths}
    </>
  );
}
