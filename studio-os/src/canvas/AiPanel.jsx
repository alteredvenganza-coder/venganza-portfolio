import { useState } from 'react';
import AiChat    from './ai/AiChat';
import AiPlugins from './ai/AiPlugins';

export default function AiPanel({ open, onClose, onAddCard }) {
  const [tab, setTab] = useState('chat');
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 320,
      background: 'var(--cv-surface)', borderLeft: '1px solid var(--cv-border)',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
      zIndex: 35, display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(26,24,22,.07)',
    }}>
      <div style={{ padding: '14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2 }}>MAT AI</div>
        <button onClick={onClose}
          style={{ width: 26, height: 26, borderRadius: 6, border: 'none',
                   background: 'transparent', cursor: 'pointer', color: 'var(--cv-muted)' }}>×</button>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--cv-border)', padding:'10px 16px 0' }}>
        {['chat','plugins'].map(t => (
          <div key={t} onClick={() => setTab(t)}
            style={{
              padding:'8px 14px', fontSize:11.5, fontWeight:600, cursor:'pointer',
              borderBottom:'2px solid ' + (tab === t ? 'var(--cv-gold2)' : 'transparent'),
              color: tab === t ? 'var(--cv-text)' : 'var(--cv-muted)',
            }}>{t === 'chat' ? 'Chat' : 'Plugins'}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'chat'    ? <AiChat onAddCard={onAddCard} />
                           : <AiPlugins onAddCard={onAddCard} />}
      </div>
    </div>
  );
}
