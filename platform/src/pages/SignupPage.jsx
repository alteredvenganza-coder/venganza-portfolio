import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../lib/auth';

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
export default function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({ displayName, email, password });
      setSentTo(email);
      setEmailSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>

          {/* Email icon */}
          <div style={{ fontSize: '64px', marginBottom: '24px', lineHeight: 1 }}>✉️</div>

          {/* Heading */}
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1d1d1f', marginBottom: '12px', marginTop: 0, fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}>
            Check your email
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: '15px', color: '#6e6e73', marginBottom: '32px', lineHeight: '1.5', fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}>
            We sent a confirmation link to<br />
            <strong style={{ color: '#1d1d1f' }}>{sentTo}</strong>.<br />
            Click it to activate your account.
          </p>

          {/* Open Mail button */}
          <a
            href="mailto:"
            style={{ display: 'block', width: '100%', backgroundColor: '#0071e3', color: '#ffffff', fontSize: '15px', fontWeight: '500', padding: '14px 16px', borderRadius: '12px', textDecoration: 'none', marginBottom: '16px', boxSizing: 'border-box', fontFamily: 'inherit' }}
          >
            Open Mail App
          </a>

          {/* Resend */}
          {resent ? (
            <p style={{ fontSize: '14px', color: '#34c759', margin: '0 0 8px' }}>Email resent!</p>
          ) : (
            <button
              onClick={async () => {
                try {
                  await signUp({ displayName, email, password });
                  setResent(true);
                } catch {}
              }}
              style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '14px', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              Didn&apos;t get it? Resend
            </button>
          )}

          {/* Spam note */}
          <p style={{ fontSize: '12px', color: '#aeaeb2', marginTop: '16px' }}>
            Check your spam folder if you don&apos;t see it.
          </p>
        </div>
      </div>
    );
  }

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
            Get your portfolio live in 5&nbsp;minutes
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              placeholder="Your Studio Name"
              style={inputBase}
            />
          </div>

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

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ height: '1px', backgroundColor: '#d2d2d7', margin: '28px 0' }} />

        {/* ── Login link ────────────────────────────────────────────────── */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6e6e73', margin: 0 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '400' }}
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
