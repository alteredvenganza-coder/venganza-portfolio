import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../lib/auth';

// ─── Shared style tokens ────────────────────────────────────────────────────
const inputBase = {
  width: '100%',
  border: '1px solid #d2d2d7',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '15px',
  color: '#1d1d1f',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const onFocus = (e) => {
  e.target.style.borderColor = '#0071e3';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.15)';
};

const onBlur = (e) => {
  e.target.style.borderColor = '#d2d2d7';
  e.target.style.boxShadow = 'none';
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h1
            style={{
              fontSize: '34px',
              fontWeight: '700',
              letterSpacing: '0.2em',
              color: '#1d1d1f',
              marginBottom: '8px',
              marginTop: 0,
              fontFamily: 'var(--font-heading, -apple-system, "SF Pro Display", sans-serif)',
            }}
          >
            FOLIO
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#6e6e73',
              margin: 0,
              fontFamily: '-apple-system, "SF Pro Text", sans-serif',
            }}
          >
            Welcome back
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              placeholder="you@example.com"
              style={inputBase}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              placeholder="••••••••"
              style={inputBase}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: '13px', color: '#ff3b30', textAlign: 'center', margin: '0' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#0071e3',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '500',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 0.15s, opacity 0.15s',
              marginTop: '4px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0077ed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0071e3'; }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ height: '1px', backgroundColor: '#d2d2d7', margin: '28px 0' }} />

        {/* ── Signup link ───────────────────────────────────────────────── */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6e6e73', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '400' }}
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
