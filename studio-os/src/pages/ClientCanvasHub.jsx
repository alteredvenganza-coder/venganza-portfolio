import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useClients, useCanvases, useProjects } from '../hooks/useStore';
import { Plus, ArrowLeft, FolderOpen, Trash2, Pencil } from 'lucide-react';

export default function ClientCanvasHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClient } = useClients();
  const { canvases, addCanvas, deleteCanvas, updateCanvasMeta, getCanvasesByClient } = useCanvases();
  const { getProjectsByClient } = useProjects();

  const client = getClient(id);
  const clientCanvases = getCanvasesByClient(id);
  const clientProjects = getProjectsByClient(id);
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-sm text-ink/60">Cliente non trovato.</p>
        <Link to="/clients" className="text-burgundy text-sm">← Torna ai clienti</Link>
      </div>
    );
  }

  async function newCanvas() {
    const c = await addCanvas({ name: 'Untitled Canvas', clientId: id });
    navigate(`/clients/${id}/canvas/${c.id}`);
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <Link to="/clients" className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink mb-2">
            <ArrowLeft size={12} /> Tutti i clienti
          </Link>
          <h1 className="text-3xl font-display tracking-wide">{client.name}</h1>
          {client.brand && <p className="text-sm text-ink/60 mt-1">{client.brand}</p>}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink/60">
            {client.email && <span>📧 {client.email}</span>}
            {client.phone && <span>📞 {client.phone}</span>}
            {client.language && <span>🗣 {client.language}</span>}
          </div>
        </div>
        <button onClick={newCanvas}
          className="bg-burgundy text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-burgundy/90">
          <Plus size={14} /> Nuovo Canvas
        </button>
      </div>

      {/* Canvases grid */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3">Canvases</h2>
        {clientCanvases.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center">
            <FolderOpen size={32} className="mx-auto mb-2 text-ink/30" />
            <p className="text-sm text-ink/60 mb-3">Nessun canvas per questo cliente.</p>
            <button onClick={newCanvas} className="bg-burgundy text-white px-4 py-2 rounded-md text-xs">
              Crea il primo canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clientCanvases.map(cv => (
              <div key={cv.id} className="glass rounded-lg overflow-hidden hover:shadow-card transition group">
                <Link to={`/clients/${id}/canvas/${cv.id}`} className="block">
                  <div className="h-28 bg-gradient-to-br from-cream/10 to-paper/5 flex items-center justify-center text-ink/30">
                    <FolderOpen size={28} />
                  </div>
                  <div className="p-3">
                    {renameId === cv.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onClick={(e) => e.preventDefault()}
                        onBlur={() => {
                          if (renameVal.trim()) updateCanvasMeta(cv.id, { name: renameVal.trim() });
                          setRenameId(null);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setRenameId(null); }}
                        className="text-sm font-medium bg-transparent border-b border-ink/30 outline-none w-full"
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">{cv.name}</p>
                    )}
                    <p className="text-[10px] text-ink/40 mt-1">
                      {new Date(cv.updatedAt || cv.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </Link>
                <div className="px-3 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setRenameId(cv.id); setRenameVal(cv.name); }}
                    className="text-[10px] text-ink/50 hover:text-ink flex items-center gap-1">
                    <Pencil size={10} /> Rinomina
                  </button>
                  <button
                    onClick={() => { if (confirm('Eliminare questo canvas?')) deleteCanvas(cv.id); }}
                    className="text-[10px] text-burgundy/70 hover:text-burgundy flex items-center gap-1 ml-auto">
                    <Trash2 size={10} /> Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
          Progetti ({clientProjects.length})
        </h2>
        {clientProjects.length === 0 ? (
          <p className="text-sm text-ink/40">Nessun progetto.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {clientProjects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="glass rounded-md p-3 hover:shadow-card transition flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-[10px] text-ink/40 mt-1">
                    {p.stage} · {p.paymentStatus || 'unpaid'}
                  </p>
                </div>
                {p.price && <span className="text-xs text-ink/60">€{p.price}</span>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
