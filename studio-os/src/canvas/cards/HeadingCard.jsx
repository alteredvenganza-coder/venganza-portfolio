import CardShell from './CardShell';

export default function HeadingCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'NEW HEADING'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      showStrip={false}
      {...ctx}
    />
  );
}
