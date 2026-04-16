const ITEMS = [
  { type: 'note',    label: 'Note',  icon: '📝' },
  { type: 'image',   label: 'Image', icon: '🖼' },
  { type: 'board',   label: 'Board', icon: '▦' },
  { type: 'todo',    label: 'To-Do', icon: '✓' },
  { type: 'heading', label: 'Title', icon: 'T' },
  { type: 'link',    label: 'Link',  icon: '🔗' },
];

export default function AddPopup({ x, y, onPick, onClose }) {
  if (x == null) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999 }} />
      <div style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 215), top: Math.min(y, window.innerHeight - 200),
        background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
        borderRadius: 10, boxShadow: 'var(--cv-shadow-lg)',
        padding: 8, zIndex: 1000, width: 196,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--cv-muted2)',
          padding: '2px 4px 6px',
        }}>Aggiungi Elemento</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }}>
          {ITEMS.map(it => (
            <button key={it.type} onClick={() => onPick(it.type)}
              style={{
                border: 'none', background: 'transparent', borderRadius: 6,
                padding: '7px 3px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 14 }}>{it.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--cv-muted)' }}>{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
