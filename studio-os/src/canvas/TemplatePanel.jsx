import { useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/canvas-templates';

export default function TemplatePanel({ open, onClose, onApply }) {
  const [cat, setCat] = useState('all');
  const [q, setQ]     = useState('');

  const filtered = TEMPLATES.filter(t =>
    (cat === 'all' || t.cat === cat) &&
    (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.desc.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 280,
      background: 'var(--cv-surface)', borderLeft: '1px solid var(--cv-border)',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .32s cubic-bezier(.4,0,.2,1)',
      zIndex: 38, display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(26,24,22,.09)',
    }}>
      <div style={{ padding: '16px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2 }}>Templates</div>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--cv-muted)',
        }}>×</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--cv-muted)', padding: '5px 16px 10px' }}>
        Scegli un template per inserirlo nel canvas
      </div>

      <input
        placeholder="Cerca template…"
        value={q} onChange={(e) => setQ(e.target.value)}
        style={{
          margin: '0 12px 10px', padding: '7px 10px',
          border: '1px solid var(--cv-border)', borderRadius: 7,
          background: 'var(--cv-white)', fontSize: 12, color: 'var(--cv-text)',
          outline: 'none', width: 'calc(100% - 24px)',
        }}
      />

      <div style={{ display:'flex', gap:4, padding:'0 12px 10px', overflowX:'auto', flexShrink:0 }}>
        {TEMPLATE_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{
              height: 24, padding: '0 10px',
              border: '1px solid ' + (cat === c.key ? 'var(--cv-text)' : 'var(--cv-border)'),
              borderRadius: 20, fontSize: 10.5, fontWeight: 500,
              background: cat === c.key ? 'var(--cv-text)' : 'transparent',
              color: cat === c.key ? '#fff' : 'var(--cv-muted)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{c.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 12px 16px', display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--cv-muted2)', fontSize:12, padding:'30px 0' }}>
            Nessun template trovato
          </div>
        ) : filtered.map(t => (
          <div key={t.id}
            style={{
              background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
              borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
            }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--cv-border2)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--cv-muted)', lineHeight: 1.4, marginBottom: 7 }}>{t.desc}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      height: 16, padding: '0 6px', borderRadius: 3,
                      background: 'var(--cv-bg)', border: '1px solid var(--cv-border)',
                      fontSize: 9, fontWeight: 500, color: 'var(--cv-muted2)',
                      display: 'inline-flex', alignItems: 'center',
                    }}>{tag}</span>
                  ))}
                </div>
                <button onClick={() => onApply(t)}
                  style={{
                    height: 24, padding: '0 10px', background: 'var(--cv-text)',
                    color: '#fff', border: 'none', borderRadius: 5, fontSize: 10.5,
                    fontWeight: 600, cursor: 'pointer',
                  }}>Applica →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
