import { useRef } from 'react';
import CardShell from './CardShell';

export default function ImageCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ data: { ...data, imgUrl: ev.target.result } });
    reader.readAsDataURL(file);
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'Image'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      {data.imgUrl ? (
        <img src={data.imgUrl} alt="" style={{ width: '100%', borderRadius: 5, display: 'block' }} />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', background: 'var(--cv-bg)', borderRadius: 5,
            cursor: 'pointer', color: 'var(--cv-muted)', fontSize: 11,
            gap: 6, minHeight: 80, padding: 16,
          }}
        >
          <span>📷</span>
          Clicca per aggiungere immagine
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </CardShell>
  );
}
