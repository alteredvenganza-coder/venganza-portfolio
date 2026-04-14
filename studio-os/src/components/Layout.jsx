import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, TrendingUp, X, Settings } from 'lucide-react';
import { useClients, useProjects, useGoals } from '../hooks/useStore';
import SettingsModal from './SettingsModal';

const NAV = [
  { to: '/',        label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clienti',   icon: Users },
  { to: '/pricing', label: 'Prezzi',    icon: TrendingUp },
];

export default function Layout({ children }) {
  const { clients }  = useClients();
  const { projects } = useProjects();
  const { goals }    = useGoals();
  const navigate     = useNavigate();

  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [settings, setSettings] = useState(false);

  const q = query.trim().toLowerCase();

  const resultClients = q
    ? clients.filter(
        c =>
          c.name?.toLowerCase().includes(q) ||
          c.brand?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      )
    : [];

  const resultProjects = q
    ? projects.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    : [];

  const hasResults = resultClients.length > 0 || resultProjects.length > 0;

  function handleSelect(path) {
    setQuery('');
    setFocused(false);
    navigate(path);
  }

  const hasBg = Boolean(goals.appBackground);

  return (
    <div
      className="min-h-screen"
      style={hasBg ? {
        backgroundImage:      `url(${goals.appBackground})`,
        backgroundSize:       'cover',
        backgroundPosition:   'center',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {/* Dark overlay when custom bg is set */}
      {hasBg && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)', zIndex: 0 }}
        />
      )}
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 border-x-0 border-t-0" style={{ position: 'sticky' }}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="font-display text-base font-semibold text-ink tracking-tight">
              Venganza <span className="text-burgundy-muted">OS</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-burgundy/20 text-burgundy-muted border border-burgundy/20 font-medium'
                      : 'text-muted hover:text-ink hover:bg-white/8'
                  }`
                }
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Settings icon */}
          <button
            onClick={() => setSettings(true)}
            className="ml-auto shrink-0 p-1.5 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors"
            title="Impostazioni"
          >
            <Settings size={16} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block relative">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                type="text"
                placeholder="Cerca clienti, progetti…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                className="w-full pl-9 pr-8 py-1.5 text-sm rounded-md"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle hover:text-ink"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {focused && q && (
              <div className="absolute top-full mt-1 w-full glass-strong rounded-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
                {!hasResults && (
                  <p className="px-4 py-3 text-xs text-subtle">Nessun risultato per "{q}"</p>
                )}

                {resultClients.length > 0 && (
                  <div>
                    <p className="label-meta px-4 pt-3 pb-1">Clienti</p>
                    {resultClients.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => handleSelect(`/clients/${c.id}`)}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/8 transition-colors"
                      >
                        <Users size={13} className="text-subtle shrink-0" />
                        <span className="text-ink">{c.name}</span>
                        {c.brand && <span className="text-subtle text-xs">· {c.brand}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {resultProjects.length > 0 && (
                  <div>
                    <p className="label-meta px-4 pt-3 pb-1">Progetti</p>
                    {resultProjects.slice(0, 4).map(p => (
                      <button
                        key={p.id}
                        onMouseDown={() => handleSelect(`/projects/${p.id}`)}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/8 transition-colors"
                      >
                        <FolderKanban size={13} className="text-subtle shrink-0" />
                        <span className="text-ink">{p.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative" style={{ zIndex: 1 }}>
        {children}
      </main>

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
