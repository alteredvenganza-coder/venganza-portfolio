import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const ACCENT       = '#7b1f24';
const ACCENT_HOVER = '#9b2830';
const ACCENT_DIM   = 'rgba(123,31,36,0.07)';
const ACCENT_BORDER= 'rgba(123,31,36,0.15)';

export default function LandingPage() {
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const move = (x, y) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setCursor({ x, y }));
    };
    const onMouse = e => move(e.clientX, e.clientY);
    const onTouch = e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Inter', sans-serif",
      background: '#ffffff',
      position: 'relative',
      overflowX: 'hidden',
      color: '#1d1d1f',
    }}>

      {/* Subtle cursor glow */}
      <div style={{
        position: 'fixed',
        left: cursor.x - 250, top: cursor.y - 250,
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,31,36,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'multiply',
      }} />

      {/* ── Navigation ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 56px', height: '60px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1d1d1f', userSelect: 'none' }}>
          FOLIO
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link to="/login" style={{
            fontSize: '13px', fontWeight: '500', color: '#6e6e73',
            textDecoration: 'none', padding: '7px 14px', borderRadius: '10px',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; e.currentTarget.style.background = 'transparent'; }}
          >Sign In</Link>
          <Link to="/signup" style={{
            fontSize: '13px', fontWeight: '600', color: '#fff',
            textDecoration: 'none', padding: '8px 18px', borderRadius: '980px',
            background: ACCENT,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}
          >Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 24px 96px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            border: `1px solid ${ACCENT_BORDER}`,
            borderRadius: '980px', padding: '4px 12px 4px 7px',
            marginBottom: '36px',
            background: ACCENT_DIM,
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: ACCENT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', color: '#fff', fontWeight: '700',
            }}>✦</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: ACCENT, letterSpacing: '0.04em' }}>
              Creator Portfolio Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(48px, 7.5vw, 88px)', fontWeight: '700', lineHeight: '1.04', letterSpacing: '-0.04em', color: '#1d1d1f', marginBottom: '20px' }}>
            Your portfolio.<br />
            <span style={{ color: ACCENT }}>Live in 5 minutes.</span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: '19px', lineHeight: '1.6', color: '#6e6e73', maxWidth: '420px', margin: '0 auto 44px', letterSpacing: '-0.01em' }}>
            Connect Instagram. Set your brand. Start selling — no code, no friction.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <Link to="/signup" style={{
              fontSize: '15px', fontWeight: '600', color: '#fff',
              textDecoration: 'none', padding: '14px 32px', borderRadius: '980px',
              background: ACCENT,
              boxShadow: '0 4px 20px rgba(123,31,36,0.25)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(123,31,36,0.32)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,31,36,0.25)'; }}
            >Create your free portfolio</Link>
            <Link to="/login" style={{
              fontSize: '15px', fontWeight: '500', color: '#6e6e73',
              textDecoration: 'none', padding: '14px 24px', borderRadius: '980px',
              border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >Sign in →</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 80px' }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '20px', overflow: 'hidden',
        }}>
          {[
            { stat: '5 min', label: 'Setup time' },
            { stat: '100%', label: 'No-code' },
            { stat: '∞',    label: 'Customizable' },
          ].map((item, i) => (
            <div key={item.stat} style={{
              padding: '28px 20px', textAlign: 'center',
              borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none',
            }}>
              <div style={{ fontSize: '34px', fontWeight: '700', letterSpacing: '-0.03em', color: ACCENT, marginBottom: '2px' }}>{item.stat}</div>
              <div style={{ fontSize: '13px', color: '#86868b' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#aeaeb2', marginBottom: '48px' }}>How it works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(0,0,0,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { number: '01', title: 'Connect Instagram', desc: 'Your feed becomes your portfolio — always fresh, always current.' },
              { number: '02', title: 'Set your brand',    desc: 'Colors, name, and pricing in minutes. Make it entirely yours.' },
              { number: '03', title: 'Go live',           desc: 'Share your link. Your audience is already waiting.' },
            ].map((step) => (
              <div key={step.number} style={{ padding: '36px 28px', background: '#ffffff', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', marginBottom: '18px',
                  background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', color: ACCENT, letterSpacing: '0.04em',
                }}>{step.number}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6e6e73' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#aeaeb2', marginBottom: '10px' }}>Everything you need</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', letterSpacing: '-0.03em', textAlign: 'center', color: '#1d1d1f', marginBottom: '44px', lineHeight: '1.1' }}>
            All the tools. None of the noise.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
            {[
              { symbol: '↗', title: 'Portfolio & shop in one', desc: 'One URL. Showcase work and sell services from a single cohesive link.' },
              { symbol: '⟳', title: 'Instagram auto-sync',     desc: 'Post on Instagram — your portfolio updates itself. Zero effort.' },
              { symbol: '$', title: 'Stripe payments',         desc: 'Accept payments from day one. No redirects, no friction.' },
              { symbol: '⬡', title: 'Render gallery',          desc: 'Show clients polished previews with curated render templates.' },
              { symbol: '◑', title: 'Brand customization',     desc: 'Your palette and typography, dialed in within seconds.' },
              { symbol: '⊞', title: 'Unified admin',           desc: 'Orders, inquiries, portfolio — one dashboard for creators.' },
            ].map((f) => (
              <div key={f.title} style={{
                padding: '24px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', gap: '8px',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_BORDER; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,31,36,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px',
                  background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', color: ACCENT,
                }}>{f.symbol}</div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.01em' }}>{f.title}</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#6e6e73' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 100px' }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto',
          border: `1px solid ${ACCENT_BORDER}`,
          borderRadius: '24px', padding: '64px 40px', textAlign: 'center',
          background: ACCENT_DIM,
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '700', letterSpacing: '-0.035em', color: '#1d1d1f', marginBottom: '16px', lineHeight: '1.1' }}>
            Ready to own your presence?
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#6e6e73', marginBottom: '36px' }}>
            Join fashion creators who use Folio to turn their work into a business.<br />
            Free to start — no credit card required.
          </p>
          <Link to="/signup" style={{
            display: 'inline-block', fontSize: '15px', fontWeight: '600', color: '#fff',
            textDecoration: 'none', padding: '14px 32px', borderRadius: '980px',
            background: ACCENT,
            boxShadow: '0 4px 20px rgba(123,31,36,0.25)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(123,31,36,0.32)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,31,36,0.25)'; }}
          >Create your free portfolio</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(0,0,0,0.07)',
        padding: '24px 56px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aeaeb2' }}>FOLIO</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[{ label: 'Sign In', to: '/login' }, { label: 'Get Started', to: '/signup' }].map(link => (
              <Link key={link.to} to={link.to} style={{ fontSize: '13px', color: '#aeaeb2', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1d1d1f')}
                onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}
              >{link.label}</Link>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#aeaeb2' }}>Built for fashion creators</span>
        </div>
      </footer>

    </div>
  );
}
