import { useState } from 'react';
import CardShell from './CardShell';

export default function BoardCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const subCards = data.subCards || [];
  const [draft, setDraft] = useState('');

  function add() {
    if (!draft.trim()) return;
    onUpdate({ data: { ...data, subCards: [...subCards, draft.trim()] } });
    setDraft('');
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'Board'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {subCards.map((s, i) => (
          <div key={i} style={{
            background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
            padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 500,
            color: 'var(--cv-text)',
          }}>{s}</div>
        ))}
      </div>
      <input
        type="text" placeholder="+ chip"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 11, color: 'var(--cv-muted)', marginTop: 8,
          fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}
      />
    </CardShell>
  );
}
