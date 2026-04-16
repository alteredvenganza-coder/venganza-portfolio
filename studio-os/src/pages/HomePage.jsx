import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvases, useClients } from '../hooks/useStore';
import { Plus, FolderOpen, Sparkles, Layers } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { canvases, addCanvas } = useCanvases();
  const { clients } = useClients();
  const [showSoon, setShowSoon] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno ☀️' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera 🌙';

  async function newStudioCanvas() {
    const c = await addCanvas({ name: 'Untitled Canvas', clientId: null });
    navigate(`/canvas/${c.id}`);
  }

  const recentCanvases = canvases.slice(0, 6);
  const recentClients  = clients.slice(0, 6);

  return (
    <div className="p-2 sm:p-6">
      {/* Greeting */}
      <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">{greeting}</p>
          <h1 className="text-4xl sm:text-5xl font-display tracking-wide">ALTERED STUDIOS</h1>
          <p className="text-sm text-ink/50 mt-1">Materializing Ideas — il tuo creative OS.</p>
        </div>
        <button onClick={newStudioCanvas}
          className="bg-burgundy text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 hover:opacity-90">
          <Plus size={14} /> Nuovo Canvas
        </button>
      </div>

      {/* Module launcher */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FCard icon={Sparkles} name="MAT-IDEAS RENDERS"
            desc="Hyper-realistic 3D garment rendering. (In arrivo)" cta="Coming soon" disabled />
          <FCard icon={Layers} name="ALTERED TECH PACKS"
            desc="Generate technical CAD flats and factory PDFs. (In arrivo)" cta="Coming soon" disabled />
          <FCard icon={FolderOpen} name="MAT IDEAS CANVAS"
            desc="Infinite creative workspace per cliente, con template e AI."
            cta="Apri Canvas →" onClick={newStudioCanvas} />
        </div>

        <button onClick={() => setShowSoon(s => !s)}
          className="mt-3 text-xs text-ink/50 hover:text-ink flex items-center gap-2">
          <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full border border-ink/20 transition ${showSoon ? 'rotate-45 bg-ink text-white border-ink' : ''}`}>+</span>
          {showSoon ? 'Nascondi tool in arrivo' : 'Tool in arrivo'}
        </button>

        {showSoon && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {['Pattern AI','Fit Simulator','Fabric Sourcing','Pricing AI','Campaign Builder','Size Grading'].map(name => (
              <div key={name} className="glass rounded-md p-3 opacity-70">
                <p className="text-[10px] uppercase tracking-wider text-ink/40 mb-1">In sviluppo</p>
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent canvases */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-ink/50">Canvases recenti</h2>
        </div>
        {recentCanvases.length === 0 ? (
          <div className="glass rounded-lg p-6 text-center">
            <p className="text-sm text-ink/60 mb-3">Nessun canvas ancora.</p>
            <button onClick={newStudioCanvas} className="bg-burgundy text-white px-4 py-2 rounded-md text-xs">
              Crea il primo canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentCanvases.map(cv => {
              const client = clients.find(c => c.id === cv.clientId);
              const target = cv.clientId ? `/clients/${cv.clientId}/canvas/${cv.id}` : `/canvas/${cv.id}`;
              return (
                <button key={cv.id} onClick={() => navigate(target)}
                  className="glass rounded-lg overflow-hidden hover:shadow-card transition text-left">
                  {cv.thumbnail ? (
                    <img src={cv.thumbnail} alt="" className="h-20 w-full object-cover" />
                  ) : (
                    <div className="h-20 bg-gradient-to-br from-cream/10 to-paper/5 flex items-center justify-center text-ink/30">
                      <FolderOpen size={22} />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{cv.name}</p>
                    <p className="text-[9px] text-ink/40 mt-0.5 truncate">
                      {client?.name || 'Studio'} · {timeAgo(cv.updatedAt || cv.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent clients */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-ink/50">Clienti recenti</h2>
          <button onClick={() => navigate('/clients')} className="text-xs text-ink/50 hover:text-ink">Vedi tutti →</button>
        </div>
        {recentClients.length === 0 ? (
          <p className="text-sm text-ink/40">Nessun cliente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentClients.map(c => (
              <button key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
                className="glass rounded-lg p-3 hover:shadow-card transition text-left">
                <div className="w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center text-burgundy text-xs font-medium mb-2">
                  {(c.name || '?').slice(0,1).toUpperCase()}
                </div>
                <p className="text-xs font-medium truncate">{c.name}</p>
                {c.brand && <p className="text-[10px] text-ink/40 truncate">{c.brand}</p>}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FCard({ icon: Icon, name, desc, cta, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`glass rounded-lg p-4 text-left transition relative ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-card hover:-translate-y-0.5'}`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-burgundy" />
      <Icon size={20} className="text-burgundy mb-3" />
      <p className="text-[10px] uppercase tracking-wider font-bold mb-1">{name}</p>
      <p className="text-[11px] text-ink/55 leading-snug mb-3">{desc}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-burgundy">{cta}</p>
    </button>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'ora';
  if (diff < 3600) return Math.floor(diff/60) + 'm fa';
  if (diff < 86400) return Math.floor(diff/3600) + 'h fa';
  if (diff < 86400*7) return Math.floor(diff/86400) + 'g fa';
  return new Date(iso).toLocaleDateString('it-IT');
}
