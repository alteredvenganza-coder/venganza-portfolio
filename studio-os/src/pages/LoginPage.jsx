import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
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

        <div className="glass-strong rounded-lg p-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? '…' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
