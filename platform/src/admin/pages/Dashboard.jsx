import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Image, Palette, Settings, ArrowUpRight, ExternalLink, Camera, ShoppingBag } from 'lucide-react';
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

  const quickLinks = [
    { label: 'Theme Editor', desc: 'Edit colors, images & content', icon: Palette, to: '/admin/theme', accent: 'text-violet-400 bg-violet-400/10' },
    { label: 'Premades', desc: 'Manage premade listings', icon: Layers, to: '/admin/premades', accent: 'text-rose-400 bg-rose-400/10' },
    { label: 'Media Library', desc: 'Upload & manage assets', icon: Image, to: '/admin/media', accent: 'text-sky-400 bg-sky-400/10' },
    { label: 'Settings', desc: 'Site configuration', icon: Settings, to: '/admin/settings', accent: 'text-slate-400 bg-slate-400/10' },
  ];

  const externalLinks = [
    { label: 'Live Site', href: '/', icon: ExternalLink },
    { label: 'Instagram', href: 'https://www.instagram.com/rare______________________/', icon: Instagram },
    { label: 'Premades Shop', href: '/premades', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="heading-font text-5xl tracking-widest text-white mb-1">Studio</h1>
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest">Altered Venganza Admin</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white/4 border border-white/5 rounded-xl p-5">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Premades (local)</p>
          <p className="text-4xl font-semibold text-white">{loading ? '—' : stats.premades}</p>
        </div>
        <div className="bg-white/4 border border-white/5 rounded-xl p-5">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Media Files</p>
          <p className="text-4xl font-semibold text-white">{loading ? '—' : stats.media}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-4">Quick Access</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(({ label, desc, icon: Icon, to, accent }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 bg-white/4 border border-white/5 rounded-xl p-5 hover:border-white/10 hover:bg-white/6 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-white uppercase tracking-widest">{label}</p>
                <p className="font-mono text-[10px] text-white/35 mt-0.5">{desc}</p>
              </div>
              <ArrowUpRight size={14} className="text-white/15 group-hover:text-white/40 flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* External links */}
      <div>
        <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-4">Links</p>
        <div className="flex gap-3 flex-wrap">
          {externalLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border border-white/5 rounded-xl font-mono text-[10px] text-white/50 hover:text-white hover:border-white/10 hover:bg-white/6 transition-all uppercase tracking-widest"
            >
              <Icon size={12} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
