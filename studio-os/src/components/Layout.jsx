import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, TrendingUp, Wallet, X, Settings, FolderKanban, Send, CalendarDays, Gift, Menu, Globe } from 'lucide-react';
import { useClients, useProjects, useGoals } from '../hooks/useStore';
import { useI18n } from '../lib/i18n';
import { useUserProfile } from '../hooks/useUserProfile';
import SettingsModal from './SettingsModal';
import SideNav from './SideNav';

const NAV = [
  { to: '/',           i18nKey: 'nav.dashboard',  icon: LayoutDashboard, end: true },
  { to: '/clients',    i18nKey: 'nav.clients',    icon: Users },
  { to: '/pricing',    i18nKey: 'nav.pricing',    icon: TrendingUp },
  { to: '/cashflow',   i18nKey: 'nav.cashflow',   icon: Wallet },
  { to: '/calendario', i18nKey: 'nav.calendar',   icon: CalendarDays },
  { to: '/site',       i18nKey: 'nav.site',       icon: Globe, adminOnly: true },
  { to: '/send',       i18nKey: 'nav.sendFile',   icon: Send },
  { to: '/inviti',     label: 'Inviti',           icon: Gift, adminOnly: true },
];

export default function Layout({ children }) {
  const { clients }  = useClients();
  const { projects } = useProjects();
  const { goals }    = useGoals();
  const { t }        = useI18n();
  const { isAdmin }  = useUserProfile();
  const navigate     = useNavigate();

  // Filter nav: admin-only items hidden for non-admins
  const navItems = NAV.filter(item => !item.adminOnly || isAdmin);

  const [query, setQuery]         = useState('');
  const [focused, setFocused]     = useState(false);
  const [settings, setSettings]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef  = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setFocused(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search when opening on mobile
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdown on Escape key
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setFocused(false);
      setSearchOpen(false);
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
    setSearchOpen(false);
    navigate(path);
  }

  const hasBg = Boolean(goals.appBackground);

  return (
    <div className="min-h-screen relative">
      {/* Blurred background image — works on mobile */}
      {hasBg && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <div
            style={{
              position:           'absolute',
              inset:              '-5%',
              backgroundImage:    `url(${goals.appBackground})`,
              backgroundSize:     'cover',
              backgroundPosition: 'center',
              filter:             'blur(24px)',
              WebkitFilter:       'blur(24px)',
              transform:          'scale(1.1)',
            }}
          />
        </div>
      )}
      {/* Dark overlay when custom bg is set */}
      {hasBg && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1 }}
        />
      )}

      {/* ── Side drawer nav (mobile + medium) ── */}
      <SideNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        t={t}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 glass border-b border-white/10 border-x-0 border-t-0" style={{ position: 'sticky' }}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-3 lg:gap-6">

          {/* Hamburger — below lg */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden shrink-0 p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="font-display text-base font-semibold text-ink tracking-tight">
              Venganza <span className="text-burgundy-muted">OS</span>
            </span>
          </Link>

          {/* Desktop Nav (lg+) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, i18nKey, label, icon: Icon, end }) => (
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
                <span>{i18nKey ? t(i18nKey) : label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Search — desktop (always visible) */}
          <div ref={searchRef} className="ml-auto flex-1 max-w-xs hidden sm:block relative">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
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
                  <p className="px-4 py-3 text-xs text-subtle">{t('empty.noResults')} &ldquo;{q}&rdquo;</p>
                )}

                {resultClients.length > 0 && (
                  <div>
                    <p className="label-meta px-4 pt-3 pb-1">{t('search.clients')}</p>
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
                    <p className="label-meta px-4 pt-3 pb-1">{t('search.projects')}</p>
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

          {/* Search icon — mobile (< sm) */}
          <div ref={searchOpen ? searchRef : null} className="sm:hidden ml-auto relative">
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            ) : (
              <div className="absolute top-0 right-0 w-[calc(100vw-1.5rem)] max-w-xs">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-9 pr-8 py-1.5 text-sm rounded-md"
                  />
                  <button
                    onClick={() => { setQuery(''); setFocused(false); setSearchOpen(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle hover:text-ink"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Results dropdown (mobile) */}
                {focused && q && (
                  <div className="absolute top-full mt-1 w-full glass-strong rounded-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
                    {!hasResults && (
                      <p className="px-4 py-3 text-xs text-subtle">{t('empty.noResults')} &ldquo;{q}&rdquo;</p>
                    )}

                    {resultClients.length > 0 && (
                      <div>
                        <p className="label-meta px-4 pt-3 pb-1">{t('search.clients')}</p>
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
                        <p className="label-meta px-4 pt-3 pb-1">{t('search.projects')}</p>
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
            )}
          </div>

          {/* Settings icon */}
          <button
            onClick={() => setSettings(true)}
            className={`shrink-0 p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${searchOpen ? 'hidden sm:flex' : ''}`}
            title={t('label.settings')}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative" style={{ zIndex: 2 }}>
        {children}
      </main>

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
