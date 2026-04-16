import { useState } from 'react';
import CardShell from './CardShell';

export default function TodoCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const items = data.items || [];
  const [draft, setDraft] = useState('');

  function setItems(next) { onUpdate({ data: { ...data, items: next } }); }
  function addItem() {
    if (!draft.trim()) return;
    setItems([...items, { text: draft.trim(), done: false }]);
    setDraft('');
  }
  function toggle(i) {
    setItems(items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it));
  }
  function update(i, text) {
    setItems(items.map((it, idx) => idx === i ? { ...it, text } : it));
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'To-do'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div
              onClick={(e) => { e.stopPropagation(); toggle(i); }}
              style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                border: '1.5px solid ' + (it.done ? 'var(--cv-sage)' : 'var(--cv-border)'),
                background: it.done ? 'var(--cv-sage)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9,
              }}
            >{it.done ? '✓' : ''}</div>
            <input
              type="text" value={it.text}
              onChange={(e) => update(i, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12, flex: 1,
                color: 'var(--cv-text)',
                textDecoration: it.done ? 'line-through' : 'none',
                opacity: it.done ? 0.55 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <input
        type="text" placeholder="+ Aggiungi elemento"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 11.5, color: 'var(--cv-muted)', marginTop: 6,
          fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}
      />
    </CardShell>
  );
}
