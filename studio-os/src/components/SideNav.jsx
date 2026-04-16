import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SideNav({ open, onClose, navItems, t }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] glass-strong z-50 flex flex-col"
            style={{ borderRight: '1px solid rgba(255,255,255,0.12)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-display text-base font-semibold text-ink tracking-tight">
                Venganza <span className="text-burgundy-muted">OS</span>
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">
              {navItems.map(({ to, i18nKey, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-burgundy/20 text-burgundy-muted border border-burgundy/20 font-medium'
                        : 'text-muted hover:text-ink hover:bg-white/8'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{i18nKey ? t(i18nKey) : label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer — user + logout */}
            <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-subtle font-mono uppercase tracking-wide mb-0.5">Account</p>
                <p className="text-xs text-ink truncate">{user?.email ?? ''}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded text-muted hover:text-burgundy-muted hover:bg-white/8 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
