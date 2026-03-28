import React, { useState, useEffect } from 'react';

// ── Toast component ──────────────────────────────────────────────────────────
function SaleToast({ closing, onDismiss }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const visible = mounted && !closing;

  const toastStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 320,
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
    zIndex: 9999,
  };

  return (
    <div style={toastStyle}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(123,31,36,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 20,
        }}>
          💸
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3 }}>
            New sale 🎉
          </div>
          <div style={{ fontSize: 13, color: '#6e6e73', marginTop: 2, lineHeight: 1.4 }}>
            Premade Vol.3 — Noir Set
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7b1f24', marginTop: 1 }}>
            €49.00
          </div>
          <div style={{ fontSize: 11, color: '#aeaeb2', marginTop: 3 }}>
            via Stripe · just now
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#aeaeb2', fontSize: 16, lineHeight: 1,
            padding: '2px 4px', flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: '#f0f0f0' }}>
        <div style={{
          height: '100%',
          background: '#7b1f24',
          animation: 'progressShrink 4s linear forwards',
        }} />
      </div>

      <style>{`
        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ── Static preview (no animation) ────────────────────────────────────────────
function StaticToastPreview() {
  return (
    <div style={{
      width: 320,
      background: 'rgba(255,255,255,0.96)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 20,
      boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(123,31,36,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 20,
        }}>
          💸
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3 }}>
            New sale 🎉
          </div>
          <div style={{ fontSize: 13, color: '#6e6e73', marginTop: 2, lineHeight: 1.4 }}>
            Premade Vol.3 — Noir Set
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7b1f24', marginTop: 1 }}>
            €49.00
          </div>
          <div style={{ fontSize: 11, color: '#aeaeb2', marginTop: 3 }}>
            via Stripe · just now
          </div>
        </div>
        <span style={{ color: '#aeaeb2', fontSize: 16, padding: '2px 4px' }}>✕</span>
      </div>
      <div style={{ height: 2, background: '#f0f0f0' }}>
        <div style={{ height: '100%', width: '60%', background: '#7b1f24' }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationDemoPage() {
  const [showToast, setShowToast] = useState(false);
  const [closing, setClosing] = useState(false);

  const triggerDemo = () => {
    setClosing(false);
    setShowToast(true);
    try { new Audio('/sounds/sale-notification.mp3').play(); } catch {}
    setTimeout(() => {
      setClosing(true);
      setTimeout(() => setShowToast(false), 400);
    }, 4000);
  };

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => setShowToast(false), 400);
  };

  const testSound = () => {
    try { new Audio('/sounds/sale-notification.mp3').play(); } catch {}
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {/* Header */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px' }}>
          Notification Preview
        </h1>
        <p style={{ fontSize: 15, color: '#6e6e73', margin: '0 0 32px' }}>
          This is how your sale notification will look.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={triggerDemo}
            style={{
              background: '#7b1f24',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Trigger demo
          </button>
          <button
            onClick={testSound}
            style={{
              background: 'transparent',
              color: '#1d1d1f',
              border: '1px solid #d1d1d6',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Test sound
          </button>
        </div>

        {/* Sound note */}
        <p style={{ fontSize: 12, color: '#aeaeb2', fontStyle: 'italic', margin: '12px 0 40px' }}>
          Add your sound file to <code>public/sounds/sale-notification.mp3</code> to enable audio.
        </p>

        {/* Static preview */}
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6e6e73', margin: '0 0 10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Preview:
          </p>
          <StaticToastPreview />
        </div>
      </div>

      {/* Live toast */}
      {showToast && <SaleToast closing={closing} onDismiss={dismiss} />}
    </div>
  );
}
