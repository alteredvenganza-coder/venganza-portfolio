import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

export default function GuestLayout({ children }) {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 border-x-0 border-t-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/send" className="shrink-0">
            <span className="font-display text-base font-semibold text-ink tracking-tight">
              Venganza <span className="text-burgundy-muted">Transfer</span>
            </span>
          </Link>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:inline">
              {profile?.display_name || 'Ospite'}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted hover:text-ink hover:bg-white/8 transition-colors"
              title="Esci"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
