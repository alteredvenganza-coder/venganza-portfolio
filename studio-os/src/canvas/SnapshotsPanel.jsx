import { useEffect, useState } from 'react';
import * as db from '../lib/db';
import { useAuth } from '../hooks/useAuth';

export default function SnapshotsPanel({ open, onClose, canvasId, cards, connections, thumbnail, onRestore }) {
  const { user } = useAuth();
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!open || !canvasId) return;
    setLoading(true);
    db.fetchCanvasSnapshots(canvasId)
      .then(setList)
      .catch(err => console.error('[snapshots] fetch failed', err))
      .finally(() => setLoading(false));
  }, [open, canvasId]);

  async function snapshotNow() {
    if (!canvasId || !user) return;
    setSaving(true);
    try {
      const created = await db.insertCanvasSnapshot(canvasId, user.id, {
        label: new Date().toLocaleString('it-IT'),
        cards, connections, thumbnail, kind: 'manual',
      });
      setList(prev => [created, ...prev]);
    } catch (e) { console.error('[snapshots] insert failed', e); }
    finally { setSaving(false); }
  }

  async function handleRestore(snap) {
    if (!confirm(`Ripristinare lo snapshot "${snap.label || snap.createdAt}"? Le modifiche correnti vanno perse.`)) return;
    await onRestore(snap);
    onClose();
  }

  async function handleDelete(snap) {
    if (!confirm('Eliminare questo snapshot?')) return;
    try {
      await db.removeCanvasSnapshot(snap.id);
      setList(prev => prev.filter(s => s.id !== snap.id));
    } catch (e) { console.error('[snapshots] delete failed', e); }
  }

  if (!open) return null;

  return (
    <div style={{
      position:'absolute', top:0, right:0, bottom:0, width:320, zIndex:60,
      background:'var(--cv-white)', borderLeft:'1px solid var(--cv-border)',
      display:'flex', flexDirection:'column',
    }}>
      <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--cv-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'var(--cv-text)' }}>Versioni</span>
        <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:16, color:'var(--cv-muted)' }}>×</button>
      </div>
      <div style={{ padding:12, borderBottom:'1px solid var(--cv-border)' }}>
        <button
          onClick={snapshotNow}
          disabled={saving}
          style={{
            width:'100%', padding:'8px 12px', borderRadius:6,
            background:'var(--cv-gold2)', color:'#fff', border:'none',
            fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer',
          }}
        >
          {saving ? 'Salvataggio…' : 'Salva snapshot'}
        </button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:8 }}>
        {loading && <p style={{ padding:12, color:'var(--cv-muted)', fontSize:11 }}>Caricamento…</p>}
        {!loading && list.length === 0 && (
          <p style={{ padding:12, color:'var(--cv-muted)', fontSize:11 }}>
            Nessuno snapshot ancora. Premi "Salva snapshot" per creare la prima versione.
          </p>
        )}
        {list.map(s => (
          <div key={s.id} style={{
            display:'flex', alignItems:'center', gap:10, padding:8,
            borderRadius:6, marginBottom:4,
            background:'var(--cv-bg)', border:'1px solid var(--cv-border)',
          }}>
            {s.thumbnail
              ? <img src={s.thumbnail} alt="" style={{ width:46, height:34, objectFit:'cover', borderRadius:4 }} />
              : <div style={{ width:46, height:34, background:'var(--cv-border)', borderRadius:4 }} />
            }
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:11.5, color:'var(--cv-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {s.label || new Date(s.createdAt).toLocaleString('it-IT')}
              </p>
              <p style={{ margin:0, fontSize:9.5, color:'var(--cv-muted)' }}>
                {s.kind === 'auto' ? 'Auto' : 'Manuale'} · {(s.cards || []).length} card
              </p>
            </div>
            <button onClick={() => handleRestore(s)} title="Ripristina"
              style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:'var(--cv-gold2)' }}>↺</button>
            <button onClick={() => handleDelete(s)} title="Elimina"
              style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:'var(--cv-red)' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
