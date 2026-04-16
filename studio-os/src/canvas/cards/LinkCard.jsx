import CardShell from './CardShell';

export default function LinkCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'Link'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <input
        type="text" placeholder="https://"
        value={data.url ?? ''}
        onChange={(e) => onUpdate({ data: { ...data, url: e.target.value } })}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'var(--cv-bg)', borderRadius: 5,
          padding: '5px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11,
          color: 'var(--cv-text)', outline: 'none', marginBottom: 8, width: '100%',
        }}
      />
      {data.url && (
        <a href={data.url} target="_blank" rel="noopener noreferrer"
           onClick={(e) => e.stopPropagation()}
           style={{ fontSize: 11, color: 'var(--cv-sage)', wordBreak: 'break-all' }}>
          Apri →
        </a>
      )}
    </CardShell>
  );
}
