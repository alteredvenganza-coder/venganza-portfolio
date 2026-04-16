import { MIN_ZOOM, MAX_ZOOM } from './CanvasEngine';

const ICONS = {
  select:  '↖',
  pan:     '✋',
  connect: '→',
  fit:     '⛶',
};

export default function CanvasToolbar({ tool, onToolChange, zoom, onZoomChange, onFit }) {
  const z = Math.round(zoom * 100);
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
      borderRadius: 12, boxShadow: 'var(--cv-shadow-lg)',
      display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', zIndex: 30,
    }}>
      <ToolBtn active={tool==='select'}  onClick={() => onToolChange('select')}  title="Select (V)" >{ICONS.select}</ToolBtn>
      <ToolBtn active={tool==='pan'}     onClick={() => onToolChange('pan')}     title="Pan (H)"    >{ICONS.pan}</ToolBtn>
      <ToolBtn active={tool==='connect'} onClick={() => onToolChange('connect')} title="Connect (C)">{ICONS.connect}</ToolBtn>

      <div style={{ width: 1, height: 20, background: 'var(--cv-border2)', margin: '0 2px' }} />

      <div style={{ display:'flex', alignItems:'center', gap:1, background:'var(--cv-surface)', borderRadius:6, padding:'0 3px' }}>
        <ZoomBtn onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - 0.1))}>−</ZoomBtn>
        <span style={{ fontSize:11, fontWeight:500, color:'var(--cv-muted)', width:34, textAlign:'center' }}>{z}%</span>
        <ZoomBtn onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + 0.1))}>+</ZoomBtn>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--cv-border2)', margin: '0 2px' }} />
      <ToolBtn onClick={onFit} title="Fit">{ICONS.fit}</ToolBtn>
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 32, height: 32, borderRadius: 7,
        border: 'none', background: active ? 'var(--cv-purple)' : 'transparent',
        color: active ? '#fff' : 'var(--cv-muted)',
        cursor: 'pointer', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >{children}</button>
  );
}

function ZoomBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        width: 24, height: 24, border: 'none', background: 'transparent',
        cursor: 'pointer', borderRadius: 4, color: 'var(--cv-muted)',
        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >{children}</button>
  );
}
