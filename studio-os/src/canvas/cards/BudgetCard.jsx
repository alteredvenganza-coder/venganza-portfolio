import { useState } from 'react';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';

export default function BudgetCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;
  const [editing, setEditing] = useState(false);

  // If no project linked, show picker
  if (!project) {
    return (
      <CardShell
        card={card}
        title="💰 Budget"
        onTitleChange={() => {}}
        {...ctx}
      >
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>
          Collega un progetto:
        </div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ refId: e.target.value })}
          defaultValue=""
          style={{
            width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5,
            padding: '5px 8px', fontSize: 11, background: 'var(--cv-white)',
          }}
        >
          <option value="">— Scegli progetto —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </CardShell>
    );
  }

  const total     = Number(project.price)      || 0;
  const paid      = Number(project.paidAmount) || 0;
  const remaining = Math.max(0, total - paid);
  const pct       = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <CardShell
      card={card}
      title={`💰 ${project.title}`}
      onTitleChange={() => {}}
      {...ctx}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row label="Totale" value={fmtEur(total)} />
        <Row label="Pagato" value={fmtEur(paid)} bold />
        <Row label="Resto"  value={fmtEur(remaining)} muted />

        <div style={{ height: 6, background: 'var(--cv-bg)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
          <div style={{
            height: '100%', width: pct + '%',
            background: pct >= 100 ? 'var(--cv-sage)' : 'var(--cv-gold)',
            borderRadius: 3, transition: 'width .3s',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--cv-muted2)', textAlign: 'right' }}>{pct}%</div>

        {editing ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <input
              type="number"
              defaultValue={paid}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateProject(project.id, { paidAmount: Number(e.target.value) || 0 });
                  setEditing(false);
                }
              }}
              placeholder="Nuovo pagato"
              style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--cv-border)' }}
            />
            <button onClick={() => setEditing(false)} style={miniBtn}>×</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{
            ...miniBtn, marginTop: 6, alignSelf: 'flex-start',
          }}>Aggiorna pagato</button>
        )}
      </div>
    </CardShell>
  );
}

function Row({ label, value, bold, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
      <span style={{ color: 'var(--cv-muted)' }}>{label}</span>
      <span style={{ fontWeight: bold ? 600 : 400, color: muted ? 'var(--cv-muted2)' : 'var(--cv-text)' }}>{value}</span>
    </div>
  );
}

function fmtEur(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
}

const miniBtn = {
  padding: '4px 10px', fontSize: 10.5, borderRadius: 4,
  border: '1px solid var(--cv-border)', background: 'var(--cv-white)',
  color: 'var(--cv-text)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
};
