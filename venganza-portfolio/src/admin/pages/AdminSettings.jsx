import { useState } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '../lib/toast';
import { useAuth } from '../lib/auth';

export default function AdminSettings() {
  const { user } = useAuth();
  const toast = useToast();
  const [defaultPrice, setDefaultPrice] = useState(200);

  return (
    <div className="max-w-2xl">
      <h1 className="heading-font text-4xl tracking-widest text-white mb-2">Settings</h1>
      <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-10">Site configuration</p>

      <div className="space-y-6">
        {/* Account */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
          <h2 className="font-mono text-xs text-white/60 uppercase tracking-widest mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-mono text-lg text-white/40 uppercase">
              {user?.email?.[0] || '?'}
            </div>
            <div>
              <p className="font-mono text-sm text-white">{user?.email || 'Admin'}</p>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>

        {/* Default price */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
          <h2 className="font-mono text-xs text-white/60 uppercase tracking-widest mb-4">Premade Defaults</h2>
          <div>
            <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Default Price (USD)</label>
            <input
              type="number"
              value={defaultPrice}
              onChange={e => setDefaultPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Links */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
          <h2 className="font-mono text-xs text-white/60 uppercase tracking-widest mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-white/50 hover:text-white transition-colors">
              Netlify Dashboard &rarr;
            </a>
            <a href="https://github.com/alteredvenganza-coder/venganza-portfolio" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-white/50 hover:text-white transition-colors">
              GitHub Repository &rarr;
            </a>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-white/50 hover:text-white transition-colors">
              Stripe Dashboard &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
