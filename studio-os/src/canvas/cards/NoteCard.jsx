import CardShell from './CardShell';

export default function NoteCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'Note'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <textarea
        value={data.text ?? ''}
        placeholder="Scrivi qui…"
        onChange={(e) => onUpdate({ data: { ...data, text: e.target.value } })}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', resize: 'none',
          width: '100%', minHeight: 60, fontFamily: 'DM Sans, sans-serif',
          fontSize: 12.5, fontWeight: 300, color: 'var(--cv-text)',
          outline: 'none', lineHeight: 1.55,
        }}
      />
    </CardShell>
  );
}
