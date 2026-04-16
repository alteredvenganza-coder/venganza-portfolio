import { useState } from 'react';

const PLUGINS = [
  { id:'render',  icon:'📸', color:'#FFF3E0', name:'MAT Render',   desc:'Visual concept descriptions', styles:['Foto Prodotto','Editorial','Sketch','Moodboard'] },
  { id:'copy',    icon:'✍️', color:'#F3E5F5', name:'Copy Creator', desc:'Marketing copy & captions',  styles:['Instagram','Prodotto','Email','TikTok'] },
  { id:'palette', icon:'🎨', color:'#E8F5E9', name:'Palette AI',   desc:'Palette colori con HEX',     styles:['Abbigliamento','Branding','Digital'] },
  { id:'naming',  icon:'🏷️', color:'#FCE4EC', name:'Naming AI',   desc:'Naming brand / prodotto',    styles:['Collection','Product','Campaign'] },
];

export default function AiPlugins({ onAddCard }) {
  const [open, setOpen]     = useState(null);
  const [busy, setBusy]     = useState(null);
  const [styleSel, setStyle] = useState({});
  const [prompts, setPrompts] = useState({});

  async function run(plug) {
    const p = (prompts[plug.id] || '').trim();
    if (!p) return alert('Inserisci una descrizione.');
    setBusy(plug.id);
    try {
      const sys = `Sei MAT AI. Genera contenuto plugin=${plug.id}, stile=${styleSel[plug.id] || plug.styles[0]}. Sii conciso e creativo. Italiano.`;
      const res = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: p, system: sys }),
      });
      const data = await res.json().catch(() => ({}));
      const text = data?.text || data?.response || data?.analysis
        || `[MAT AI offline] Plugin ${plug.name} su: "${p.slice(0,60)}"`;
      onAddCard({ data: { title: `${plug.icon} ${plug.name}`, text } });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
      {PLUGINS.map(plug => (
        <div key={plug.id} style={{
          border: '1px solid var(--cv-border)', borderRadius: 8,
          background: 'var(--cv-white)', overflow: 'hidden',
        }}>
          <div onClick={() => setOpen(o => o === plug.id ? null : plug.id)}
            style={{
              padding: '10px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'space-between',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 5, background: plug.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
              }}>{plug.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{plug.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--cv-muted)' }}>{plug.desc}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--cv-muted2)' }}>{open === plug.id ? '−' : '+'}</span>
          </div>

          {open === plug.id && (
            <div style={{ padding: '0 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              <select
                value={styleSel[plug.id] || plug.styles[0]}
                onChange={(e) => setStyle(s => ({ ...s, [plug.id]: e.target.value }))}
                style={{
                  padding: '6px 8px', border: '1px solid var(--cv-border)', borderRadius: 5,
                  fontSize: 11.5, background: 'var(--cv-bg)', color: 'var(--cv-text)',
                }}>
                {plug.styles.map(s => <option key={s}>{s}</option>)}
              </select>
              <textarea
                value={prompts[plug.id] || ''}
                onChange={(e) => setPrompts(p => ({ ...p, [plug.id]: e.target.value }))}
                placeholder="Descrivi la tua idea…"
                style={{
                  padding: '6px 8px', border: '1px solid var(--cv-border)', borderRadius: 5,
                  fontSize: 11.5, background: 'var(--cv-bg)', color: 'var(--cv-text)',
                  resize: 'vertical', minHeight: 52,
                }}
              />
              <button onClick={() => run(plug)} disabled={busy === plug.id}
                style={{
                  background: 'var(--cv-text)', color: '#fff', border: 'none', borderRadius: 6,
                  padding: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                }}>{busy === plug.id ? 'Generazione…' : 'Genera con MAT AI →'}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
