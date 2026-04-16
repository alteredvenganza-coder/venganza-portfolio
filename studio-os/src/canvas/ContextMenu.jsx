export default function ContextMenu({ x, y, onAdd, onFit, onClear, onClose }) {
  if (x == null) return null;
  return (
    <>
      <div onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}
           style={{ position:'fixed', inset:0, zIndex:999 }} />
      <div style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 170), top: Math.min(y, window.innerHeight - 250),
        background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
        borderRadius: 9, boxShadow: 'var(--cv-shadow-lg)',
        padding: 5, zIndex: 1000, minWidth: 155,
      }}>
        <Item onClick={() => onAdd('note')}>📝 Note</Item>
        <Item onClick={() => onAdd('image')}>🖼 Image</Item>
        <Item onClick={() => onAdd('todo')}>✓ To-do</Item>
        <Item onClick={() => onAdd('board')}>▦ Board</Item>
        <Item onClick={() => onAdd('heading')}>T Title</Item>
        <Sep />
        <Item onClick={onFit}>⛶ Zoom Fit</Item>
        <Item onClick={onClear} danger>✕ Clear Canvas</Item>
      </div>
    </>
  );
}

function Item({ children, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      padding: '7px 11px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
      borderRadius: 5, color: danger ? 'var(--cv-red)' : 'var(--cv-text)',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cv-bg)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >{children}</div>
  );
}

function Sep() {
  return <div style={{ height: 1, background: 'var(--cv-border)', margin: '3px 0' }} />;
}
