import { useRef, useState } from 'react';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';
import * as db from '../../lib/db';

export default function FilesCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  if (!project) {
    return (
      <CardShell card={card} title="📎 Files" onTitleChange={() => {}} {...ctx}>
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>Collega progetto:</div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => onUpdate({ refId: e.target.value })}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </CardShell>
    );
  }

  const files = project.files || [];

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const meta = await db.uploadProjectFile(project.id, file);
      await updateProject(project.id, { files: [...files, meta] });
    } catch (err) {
      alert('Upload fallito: ' + err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <CardShell card={card} title={`📎 ${project.title}`} onTitleChange={() => {}} {...ctx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {files.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--cv-muted2)' }}>Nessun file.</div>
        )}
        {files.map((f, i) => (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
             onClick={(e) => e.stopPropagation()}
             style={{
               display: 'flex', alignItems: 'center', gap: 6,
               padding: '4px 6px', background: 'var(--cv-bg)', borderRadius: 4,
               fontSize: 11, color: 'var(--cv-text)', textDecoration: 'none',
             }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            <span style={{ fontSize: 9, color: 'var(--cv-muted2)' }}>{Math.round((f.size || 0) / 1024)}KB</span>
          </a>
        ))}
      </div>
      <button onClick={() => fileRef.current?.click()} disabled={busy}
        style={{
          marginTop: 8, padding: '5px 10px', fontSize: 11, borderRadius: 5,
          border: '1px dashed var(--cv-border)', background: 'transparent',
          color: 'var(--cv-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}>{busy ? 'Caricamento…' : '+ Aggiungi file'}</button>
      <input ref={fileRef} type="file" onChange={onUpload} style={{ display: 'none' }} />
    </CardShell>
  );
}
