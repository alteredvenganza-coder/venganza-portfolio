import { Link } from 'react-router-dom';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';
import { STAGE_LABELS, PAYMENT_LABELS } from '../../lib/constants';

export default function ProjectOverviewCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;

  if (!project) {
    return (
      <CardShell card={card} title="📋 Project" onTitleChange={() => {}} {...ctx}>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => onUpdate({ refId: e.target.value })}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli progetto —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </CardShell>
    );
  }

  return (
    <CardShell card={card} title={`📋 ${project.title}`} onTitleChange={() => {}} {...ctx}>
      <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
        <Row label="Stage" >
          <select
            value={project.stage || ''}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => updateProject(project.id, { stage: e.target.value })}
            style={selectStyle}
          >
            {Object.entries(STAGE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
        <Row label="Pagamento" >
          <select
            value={project.paymentStatus || 'unpaid'}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => updateProject(project.id, { paymentStatus: e.target.value })}
            style={selectStyle}
          >
            {Object.entries(PAYMENT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
        {project.deadline && <Row label="Deadline"><span>{project.deadline}</span></Row>}
        <Link
          to={`/projects/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 6, fontSize: 11, color: 'var(--cv-purple)',
            textDecoration: 'none', alignSelf: 'flex-start',
          }}
        >Apri scheda completa →</Link>
      </div>
    </CardShell>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:6 }}>
      <span style={{ color:'var(--cv-muted)' }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

const selectStyle = {
  border: '1px solid var(--cv-border)', borderRadius: 4,
  padding: '2px 5px', fontSize: 11, background: 'var(--cv-white)',
  color: 'var(--cv-text)',
};
