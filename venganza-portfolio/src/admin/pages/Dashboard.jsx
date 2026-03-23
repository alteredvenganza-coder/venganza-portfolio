import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Image, ArrowRight } from 'lucide-react';
import { listFiles } from '../lib/github';

export default function Dashboard() {
  const [stats, setStats] = useState({ premades: 0, media: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [premadeFiles, mediaFiles] = await Promise.all([
          listFiles('venganza-portfolio/content/premades'),
          listFiles('venganza-portfolio/public/premades'),
        ]);
        setStats({
          premades: premadeFiles.filter(f => f.name?.endsWith('.md')).length,
          media: mediaFiles.filter(f => !f.name?.startsWith('.')).length,
        });
      } catch (e) {
        console.error('Dashboard load error:', e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Premades', value: stats.premades, icon: Layers, to: '/admin/premades', color: 'bg-red-900/30 text-red-400' },
    { label: 'Media Files', value: stats.media, icon: Image, to: '/admin/media', color: 'bg-blue-900/30 text-blue-400' },
  ];

  return (
    <div>
      <h1 className="heading-font text-4xl tracking-widest text-white mb-2">Dashboard</h1>
      <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-10">Altered Venganza Admin</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={to} to={to} className="group bg-white/5 border border-white/5 rounded-xl p-6 hover:border-white/10 hover:bg-white/[0.07] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
            <p className="text-3xl font-semibold text-white mb-1">
              {loading ? '—' : value}
            </p>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
