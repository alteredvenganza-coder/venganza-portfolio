import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, FolderKanban, X } from 'lucide-react';
import { useClients } from '../hooks/useStore';
import { useProjects } from '../hooks/useStore';

const NAV = [
  { to: '/',        label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clienti',   icon: Users },
];

export default function Layout({ children }) {
  const { clients }  = useClients();
  const { projects } = useProjects();
  const navigate     = useNavigate();

  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);

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

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="font-display text-base font-semibold text-ink tracking-tight">
              Venganza <span className="text-burgundy">OS</span>
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
                      ? 'bg-burgundy-pale text-burgundy font-medium'
                      : 'text-muted hover:text-ink hover:bg-paper'
                  }`
                }
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block relative ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                type="text"
                placeholder="Cerca clienti, progetti…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-border rounded-md focus:border-burgundy-muted bg-cream placeholder-subtle"
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
              <div className="absolute top-full mt-1 w-full bg-white border border-border rounded-lg shadow-modal overflow-hidden z-50 max-h-72 overflow-y-auto">
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
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-paper transition-colors"
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
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-paper transition-colors"
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
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
