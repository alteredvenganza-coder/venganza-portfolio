import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Image, Settings, LogOut, PenTool, Layers, Palette, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useEditor } from '../lib/editor-context';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/theme', icon: Palette, label: 'Theme' },
  { to: '/admin/premades', icon: Layers, label: 'Premades' },
  { to: '/admin/media', icon: Image, label: 'Media' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { enterEditMode } = useEditor();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleEditSite = () => {
    enterEditMode();
    navigate('/p');
  };

  const SidebarContent = ({ onNav }) => (
    <>
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="heading-font text-xl tracking-widest text-white">ADMIN</span>
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-1">Altered Venganza</p>
        </div>
        {onNav && (
          <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white/60 md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-white/5">
          <button
            onClick={() => { handleEditSite(); onNav?.(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-all w-full"
          >
            <PenTool size={16} />
            Edit Site
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono uppercase text-white/60">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-white/60 truncate">{user?.email || 'Admin'}</p>
          </div>
          <button onClick={logout} className="text-white/30 hover:text-white/60 transition-colors" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">

      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 bg-[#111] border-r border-white/5 flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 bg-[#111] flex flex-col h-full shadow-2xl">
            <SidebarContent onNav={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 md:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Hamburger on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white/40 hover:text-white/70 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block" />
          <a href="/p" target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors">
            View Site →
          </a>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
