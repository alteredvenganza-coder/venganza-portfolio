const ITEMS = [
  { type: 'note',    label: 'Note',  icon: '📝' },
  { type: 'image',   label: 'Image', icon: '🖼' },
  { type: 'link',    label: 'Link',  icon: '🔗' },
  { type: 'todo',    label: 'To-do', icon: '✓' },
  { type: 'board',   label: 'Board', icon: '▦' },
  { type: 'heading', label: 'Title', icon: 'T' },
];

const SMART_ITEMS = [
  { type: 'budget',           label: 'Budget',  icon: '💰' },
  { type: 'tasks',            label: 'Tasks',   icon: '✓' },
  { type: 'files',            label: 'Files',   icon: '📎' },
  { type: 'project-overview', label: 'Project', icon: '📋' },
];

export default function CanvasSidebar({ onHome, onTemplates, onAi }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: 60,
      background: 'var(--cv-white)', borderRight: '1px solid var(--cv-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 2, zIndex: 40,
    }}>
      {ITEMS.map(it => (
        <SideBtn key={it.type} icon={it.icon} label={it.label} draggable type={it.type} />
      ))}
      <div style={{ width: 32, height: 1, background: 'var(--cv-border2)', margin: '6px 0' }} />
      {SMART_ITEMS.map(it => (
        <SideBtn key={it.type} icon={it.icon} label={it.label} draggable type={it.type} />
      ))}
      <div style={{ width: 32, height: 1, background: 'var(--cv-border2)', margin: '6px 0' }} />
      <SideBtn icon="▦" label="Templ" onClick={onTemplates} />
      <SideBtn icon="✨" label="AI" onClick={onAi} />
      <div style={{ flex: 1 }} />
      <SideBtn icon="⌂" label="Home" onClick={onHome} />
    </div>
  );
}

function SideBtn({ icon, label, onClick, draggable, type }) {
  return (
    <button
      onClick={onClick}
      draggable={!!draggable}
      onDragStart={draggable ? (e) => e.dataTransfer.setData('cardType', type) : undefined}
      style={{
        width: 44, minHeight: 38, borderRadius: 7, border: 'none',
        background: 'transparent', cursor: draggable ? 'grab' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2.5, color: 'var(--cv-muted2)',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 8.5, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
