import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, TrendingUp, Wallet, X, Settings, FolderKanban, Send } from 'lucide-react';
import { useClients, useProjects, useGoals } from '../hooks/useStore';
import SettingsModal from './SettingsModal';

const NAV = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients',   label: 'Clienti',   icon: Users },
  { to: '/pricing',   label: 'Prezzi',    icon: TrendingUp },
  { to: '/cashflow',  label: 'Finanze',   icon: Wallet },
  { to: '/send',      label: 'Invia File', icon: Send },
];

export default function Layout({ children }) {
  const { clients }  = useClients();
  const { projects } = useProjects();
  const { goals }    = useGoals();
  const navigate     = useNavigate();

  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [settings, setSettings] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setFocused(false);
      setQuery('');
      e.target.blur();
    }
  }, []);

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
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded text-sm transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${
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

          {/* Search */}
          <div ref={searchRef} className="ml-auto flex-1 max-w-xs hidden sm:block relative">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                type="text"
                placeholder="Cerca clienti, progetti…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-8 py-1.5 text-sm rounded-md"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setFocused(false); }}
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
                  <p className="px-4 py-3 text-xs text-subtle">Nessun risultato per &ldquo;{q}&rdquo;</p>
                )}

                {resultClients.length > 0 && (
                  <div>
                    <p className="label-meta px-4 pt-3 pb-1">Clienti</p>
                    {resultClients.slice(0, 5).map(c => (
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
                    {resultProjects.slice(0, 5).map(p => (
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

          {/* Settings icon */}
          <button
            onClick={() => setSettings(true)}
            className="shrink-0 p-2.5 sm:p-1.5 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="Impostazioni"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative" style={{ zIndex: 1 }}>
        {children}
      </main>

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
