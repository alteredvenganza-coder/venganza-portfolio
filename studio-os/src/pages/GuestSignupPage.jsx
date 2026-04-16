import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function GuestSignupPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [displayName, setDisplayName] = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [inviteCode,  setInviteCode]  = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  // Pre-fill invite code from URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) setInviteCode(code);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/guest-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          inviteCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante la registrazione.');
        setLoading(false);
        return;
      }

      // Auto-login after signup
      setSuccess(true);
      const signInErr = await signIn(email, password);
      if (signInErr) {
        setError('Account creato ma errore login: ' + signInErr.message);
        setLoading(false);
        return;
      }

      navigate('/send');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 overflow-hidden">
      {/* Full-screen background image */}
      <img
        src="/login-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl text-white drop-shadow-lg">Venganza Transfer</h1>
          <p className="label-meta mt-1 text-white/60">Registrazione ospite</p>
        </div>

        <div className="glass-strong rounded-lg p-4 sm:p-6">
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-400 text-sm font-medium">Account creato con successo!</p>
              <p className="text-white/60 text-xs mt-1">Reindirizzamento...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="label-meta block mb-1.5">Nome</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Il tuo nome"
                  required
                  autoFocus
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="label-meta block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="label-meta block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimo 6 caratteri"
                  required
                  minLength={6}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="label-meta block mb-1.5">Codice Invito</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  required
                  className="w-full font-mono tracking-widest uppercase text-sm"
                />
              </div>

              {error && (
                <p className="text-xs sm:text-sm text-burgundy">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-burgundy hover:bg-burgundy-light text-white py-3 sm:py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 mt-1 min-h-[44px]"
              >
                {loading ? 'Creazione account...' : 'Registrati'}
              </button>

              <p className="text-center text-xs text-white/40 mt-1">
                Hai gia un account?{' '}
                <a href="/login" className="text-burgundy-muted hover:text-burgundy-light underline">
                  Accedi
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
