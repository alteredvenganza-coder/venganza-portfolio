import { useState } from 'react';
import CardShell from './CardShell';
import { useCalendarTasks, useStore, useProjects } from '../../hooks/useStore';

/**
 * Smart card showing calendar_tasks scoped to a project (refId = projectId)
 * OR to a client (data.clientId) — picker shown if neither set.
 */
export default function TasksCard({ card, ctx, onUpdate }) {
  const { calendarTasks, updateCalendarTask, addCalendarTask } = useCalendarTasks();
  const { projects } = useProjects();
  const { clients } = useStore();
  const data = card.data || {};
  const filter = data.filter || 'open';
  const [draft, setDraft] = useState('');

  const scoped = calendarTasks.filter(t => {
    if (card.refId && t.projectId !== card.refId) return false;
    if (data.clientId && t.clientId !== data.clientId) return false;
    if (filter === 'open' && t.isDone) return false;
    if (filter === 'done' && !t.isDone) return false;
    return true;
  });

  const titleLabel = card.refId
    ? `✓ Tasks · ${projects.find(p => p.id === card.refId)?.title ?? '?'}`
    : data.clientId
      ? `✓ Tasks · ${clients.find(c => c.id === data.clientId)?.name ?? '?'}`
      : '✓ Tasks';

  if (!card.refId && !data.clientId) {
    return (
      <CardShell card={card} title={titleLabel} onTitleChange={() => {}} {...ctx}>
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>
          Scegli scope:
        </div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith('p:')) onUpdate({ refId: v.slice(2) });
            else if (v.startsWith('c:')) onUpdate({ data: { ...data, clientId: v.slice(2) } });
          }}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli —</option>
          <optgroup label="Progetti">
            {projects.map(p => <option key={p.id} value={'p:' + p.id}>{p.title}</option>)}
          </optgroup>
          <optgroup label="Clienti">
            {clients.map(c => <option key={c.id} value={'c:' + c.id}>{c.name}</option>)}
          </optgroup>
        </select>
      </CardShell>
    );
  }

  async function add() {
    if (!draft.trim()) return;
    const today = new Date().toISOString().slice(0,10);
    await addCalendarTask({
      title: draft.trim(),
      date: today,
      isDone: false,
      color: '#6B5EA8',
      projectId: card.refId || null,
      clientId: data.clientId || null,
    });
    setDraft('');
  }

  return (
    <CardShell card={card} title={titleLabel} onTitleChange={() => {}} {...ctx}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {['open','all','done'].map(f => (
          <button key={f} onClick={() => onUpdate({ data: { ...data, filter: f } })}
            style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: filter === f ? 'var(--cv-text)' : 'transparent',
              color:      filter === f ? '#fff' : 'var(--cv-muted)',
              border: '1px solid var(--cv-border)', cursor: 'pointer',
            }}>{f === 'open' ? 'Aperti' : f === 'done' ? 'Fatti' : 'Tutti'}</button>
        ))}
      </div>

      <div>
        {scoped.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--cv-muted2)', padding: '6px 0' }}>Nessun task.</div>
        )}
        {scoped.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
            <div onClick={(e) => { e.stopPropagation(); updateCalendarTask(t.id, { isDone: !t.isDone }); }}
              style={{
                width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                border: '1.5px solid ' + (t.isDone ? 'var(--cv-sage)' : 'var(--cv-border)'),
                background: t.isDone ? 'var(--cv-sage)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 8,
              }}
            >{t.isDone ? '✓' : ''}</div>
            <span style={{
              fontSize: 11.5, color: 'var(--cv-text)',
              textDecoration: t.isDone ? 'line-through' : 'none',
              opacity: t.isDone ? 0.5 : 1, flex: 1,
            }}>{t.title}</span>
            <span style={{ fontSize: 9.5, color: 'var(--cv-muted2)' }}>{t.date?.slice(5)}</span>
          </div>
        ))}
      </div>

      <input
        placeholder="+ Nuovo task" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
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
