import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';
import { listFiles, getFile, deleteFile } from '../lib/github';
import { useToast } from '../lib/toast';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    fm[key] = val;
  });
  return fm;
}

export default function PremadesList() {
  const [premades, setPremades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  async function loadPremades() {
    setLoading(true);
    try {
      const files = await listFiles('venganza-portfolio/content/premades');
      const mdFiles = files.filter(f => f.name?.endsWith('.md'));

      const items = await Promise.all(
        mdFiles.map(async (f) => {
          const file = await getFile(f.path);
          if (!file) return null;
          const data = parseFrontmatter(file.content);
          return { ...data, _filename: f.name, _path: f.path, _sha: file.sha };
        })
      );

      setPremades(items.filter(Boolean).sort((a, b) => {
        const na = parseInt(a.number) || 0;
        const nb = parseInt(b.number) || 0;
        return na - nb;
      }));
    } catch (e) {
      console.error(e);
      toast('Failed to load premades', 'error');
    }
    setLoading(false);
  }

  useEffect(() => { loadPremades(); }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete Premade #${item.number}?`)) return;
    try {
      await deleteFile(item._path, item._sha, `Delete premade ${item.number}`);
      toast(`Premade #${item.number} deleted`);
      loadPremades();
    } catch (e) {
      toast('Delete failed: ' + e.message, 'error');
    }
  };

  const filtered = premades.filter(p =>
    !search || (p.number || '').includes(search) || (p.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-font text-4xl tracking-widest text-white mb-1">Premades</h1>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{premades.length} total</p>
        </div>
        <Link
          to="/admin/premades/new"
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest hover:bg-white/90 transition-colors"
        >
          <Plus size={14} /> New Premade
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by number or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 font-mono text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">No premades found</p>
          <Link to="/admin/premades/new" className="font-mono text-xs text-white/60 underline underline-offset-4 hover:text-white transition-colors">
            Create your first premade
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">Image</th>
                <th className="text-left font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">#</th>
                <th className="text-left font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">Title</th>
                <th className="text-left font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">Price</th>
                <th className="text-left font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">Status</th>
                <th className="text-right font-mono text-[10px] text-white/30 uppercase tracking-widest px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._path} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-white/80">{item.number}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{item.title || `Premade #${item.number}`}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/80">${item.price || 200}</td>
                  <td className="px-4 py-3">
                    {item.available !== false ? (
                      <span className="inline-flex items-center gap-1.5 text-green-400 font-mono text-[10px] uppercase tracking-widest">
                        <Eye size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-white/30 font-mono text-[10px] uppercase tracking-widest">
                        <EyeOff size={12} /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/premades/edit/${encodeURIComponent(item._filename)}`)}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
