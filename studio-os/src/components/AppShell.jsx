import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ShoppingBag, Users, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/overview', icon: LayoutDashboard, label: 'Overview'  },
  { to: '/projects',  icon: FolderKanban,   label: 'Projects'  },
  { to: '/orders',    icon: ShoppingBag,    label: 'Orders'    },
  { to: '/clients',   icon: Users,          label: 'Clients'   },
  { to: '/content',   icon: CalendarDays,   label: 'Content'   },
];

export default function AppShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-[#2a2a2a] bg-[#131313]">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#2a2a2a]">
          <p className="font-display text-xl tracking-widest text-white leading-none">ALTERED</p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#7b1f24] uppercase mt-0.5">Studio OS</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#7b1f24]/20 text-white'
                    : 'text-[#888] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-6 py-4 text-sm text-[#555] hover:text-white border-t border-[#2a2a2a] transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
