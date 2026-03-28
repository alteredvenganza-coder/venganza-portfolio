// Temporary cookie banner — replace inner content with iubenda embed when ready.
// Acceptance stored in localStorage under 'cookie_consent' = 'accepted' | 'rejected'
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'showp_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 32px)',
        maxWidth: '560px',
        backgroundColor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '18px',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,1) inset',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontFamily: "-apple-system, 'SF Pro Text', 'Inter', sans-serif",
      }}
      role="dialog"
      aria-label="Cookie consent"
    >
      {/* Text */}
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>
          🍪 We use cookies
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', lineHeight: '1.5' }}>
          We use essential cookies to keep you logged in and analytics cookies to improve the platform.
          By clicking "Accept" you consent to our{' '}
          <a
            href="https://www.iubenda.com/privacy-policy/your-id"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0071e3', textDecoration: 'none' }}
          >
            Privacy Policy
          </a>.
          {/* TODO: replace this banner with iubenda embed */}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={reject}
          style={{
            padding: '9px 18px',
            borderRadius: '980px',
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: '500',
            color: '#6e6e73',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.color = '#1d1d1f'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = '#6e6e73'; }}
        >
          Essential only
        </button>
        <button
          onClick={accept}
          style={{
            padding: '9px 18px',
            borderRadius: '980px',
            border: 'none',
            background: '#1d1d1f',
            fontSize: '13px',
            fontWeight: '500',
            color: '#ffffff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3a3a3c'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1d1d1f'; }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
