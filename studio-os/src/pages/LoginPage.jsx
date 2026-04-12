import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [confirm,  setConfirm]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setConfirm(false);
    setLoading(true);

    if (mode === 'signup') {
      const err = await signUp(email, password);
      setLoading(false);
      if (err) { setError(err.message); return; }
      // Supabase may require email confirmation — try signing in immediately
      const loginErr = await signIn(email, password);
      if (loginErr) {
        // Confirmation required
        setConfirm(true);
        return;
      }
      navigate('/');
      return;
    }

    const err = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink">Venganza OS</h1>
          <p className="label-meta mt-1">CRM interno · Altered Venganza</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-meta block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label-meta block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-burgundy">{error}</p>
            )}

            {confirm && (
              <p className="text-sm text-[#7a6010] bg-[#fff8e1] border border-[#f0d060] rounded px-3 py-2">
                Account creato. Controlla la tua email e clicca il link di conferma prima di accedere.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? '…' : mode === 'login' ? 'Accedi' : 'Crea account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            {mode === 'login' ? (
              <>Prima volta?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-burgundy hover:underline bg-transparent border-none p-0"
                >
                  Crea account
                </button>
              </>
            ) : (
              <>Hai già un account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-burgundy hover:underline bg-transparent border-none p-0"
                >
                  Accedi
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
