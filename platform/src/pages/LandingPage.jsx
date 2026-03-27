import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const move = (x, y) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setCursor({ x, y }));
    };
    const onMouse = e => move(e.clientX, e.clientY);
    const onTouch = e => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    };
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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      background: '#f2f4f8',
      position: 'relative',
      overflowX: 'hidden',
      color: '#1d1d1f',
    }}>

      {/* ── Ambient mesh background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Base */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #eef1f8 0%, #f5f0ff 40%, #e8f0fe 70%, #f0f6ff 100%)' }} />
        {/* Orbs */}
        <div style={{ position: 'absolute', top: '-8%', left: '15%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '30%', width: '800px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Mouse/touch spotlight */}
        <div style={{
          position: 'fixed',
          left: cursor.x - 300,
          top: cursor.y - 300,
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.1) 30%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          transition: 'left 0.08s ease-out, top 0.08s ease-out',
          mixBlendMode: 'multiply',
        }} />
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 56px', height: '60px',
        background: 'rgba(242, 244, 248, 0.72)',
        backdropFilter: 'saturate(200%) blur(28px)',
        WebkitBackdropFilter: 'saturate(200%) blur(28px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.8)',
      }}>
        <span style={{
          fontSize: '16px', fontWeight: '700', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#1d1d1f', userSelect: 'none',
        }}>
          FOLIO
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link to="/login" style={{
            fontSize: '13px', fontWeight: '500', color: '#6e6e73',
            textDecoration: 'none', padding: '7px 14px', borderRadius: '10px',
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; e.currentTarget.style.background = 'transparent'; }}
          >
            Sign In
          </Link>
          <Link to="/signup" style={{
            fontSize: '13px', fontWeight: '600', color: '#ffffff',
            textDecoration: 'none', padding: '8px 18px', borderRadius: '980px',
            background: 'linear-gradient(135deg, #6d28d9, #2563eb)',
            boxShadow: '0 2px 12px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 24px 100px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '980px', padding: '5px 14px 5px 8px',
            marginBottom: '36px',
            boxShadow: '0 2px 12px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              fontSize: '10px', color: '#fff', fontWeight: '700',
            }}>✦</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5', letterSpacing: '0.04em' }}>
              Creator Portfolio Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 8vw, 92px)', fontWeight: '800',
            lineHeight: '1.02', letterSpacing: '-0.04em', marginBottom: '24px',
          }}>
            <span style={{ display: 'block', color: '#1d1d1f' }}>Your portfolio.</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #6d28d9 0%, #2563eb 50%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Live in 5 minutes.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: '19px', lineHeight: '1.65', color: '#6e6e73',
            maxWidth: '460px', margin: '0 auto 48px', letterSpacing: '-0.01em',
          }}>
            Connect Instagram. Set your brand. Start selling.
            No code, no friction — just your work, live.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/signup" style={{
              fontSize: '15px', fontWeight: '600', color: '#fff',
              textDecoration: 'none', padding: '15px 32px', borderRadius: '980px',
              background: 'linear-gradient(135deg, #6d28d9, #2563eb)',
              boxShadow: '0 6px 24px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
            >
              Create your free portfolio
            </Link>
            <Link to="/login" style={{
              fontSize: '15px', fontWeight: '500', color: '#4f46e5',
              textDecoration: 'none', padding: '15px 28px', borderRadius: '980px',
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.65)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Sign in →
            </Link>
          </div>

        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 80px' }}>
        <div style={{
          maxWidth: '860px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderRadius: '24px',
          boxShadow: '0 4px 32px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.9) inset',
          overflow: 'hidden',
        }}>
          {[
            { stat: '5 min', label: 'Setup time' },
            { stat: '100%', label: 'No-code' },
            { stat: '∞', label: 'Customizable' },
          ].map((item, i) => (
            <div key={item.stat} style={{
              padding: '32px 24px', textAlign: 'center',
              borderLeft: i > 0 ? '1px solid rgba(99,102,241,0.1)' : 'none',
            }}>
              <div style={{
                fontSize: '36px', fontWeight: '800',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #6d28d9, #3b82f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '4px',
              }}>{item.stat}</div>
              <div style={{ fontSize: '13px', color: '#86868b', letterSpacing: '0.02em' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#86868b', marginBottom: '56px' }}>
            How it works
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {[
              { number: '01', title: 'Connect Instagram', desc: 'We pull your latest work automatically. Your feed becomes your portfolio — always fresh, always current.', accent: 'rgba(109,40,217,0.12)', accentBorder: 'rgba(109,40,217,0.2)' },
              { number: '02', title: 'Set your brand', desc: 'Choose your colors, name, and pricing in minutes. Make it unmistakably, entirely yours.', accent: 'rgba(37,99,235,0.1)', accentBorder: 'rgba(37,99,235,0.18)' },
              { number: '03', title: 'Go live', desc: 'Share your link and start taking orders. Your audience is already waiting for you.', accent: 'rgba(79,70,229,0.1)', accentBorder: 'rgba(79,70,229,0.18)' },
            ].map((step) => (
              <div key={step.number} style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderRadius: '20px', padding: '32px 28px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,1)',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,1)'; }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '10px', marginBottom: '20px',
                  background: step.accent, border: `1px solid ${step.accentBorder}`,
                  fontSize: '12px', fontWeight: '700', color: '#4f46e5', letterSpacing: '0.05em',
                }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '600', letterSpacing: '-0.02em', color: '#1d1d1f', marginBottom: '10px', lineHeight: '1.3' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: '#6e6e73', letterSpacing: '-0.005em' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#86868b', marginBottom: '12px' }}>
            Everything you need
          </p>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: '700',
            letterSpacing: '-0.035em', textAlign: 'center', marginBottom: '52px', lineHeight: '1.1', color: '#1d1d1f',
          }}>
            All the tools. None of the noise.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { symbol: '↗', title: 'Portfolio & shop in one', desc: 'One URL, full story. Showcase your work and sell your services from a single cohesive link.', color: '#6d28d9' },
              { symbol: '⟳', title: 'Instagram auto-sync', desc: 'Post on Instagram — your portfolio updates itself. Always fresh, zero effort.', color: '#2563eb' },
              { symbol: '$', title: 'Stripe payments', desc: 'Accept payments from day one. No third-party setup, no redirects, no friction.', color: '#0891b2' },
              { symbol: '⬡', title: 'Render gallery', desc: 'Show clients polished previews with a curated library of render templates.', color: '#7c3aed' },
              { symbol: '◑', title: 'Brand customization', desc: 'Your brand, your rules. Dial in your palette and typography in seconds.', color: '#4f46e5' },
              { symbol: '⊞', title: 'Unified admin', desc: 'Orders, inquiries, portfolio — one clean dashboard built for working creators.', color: '#2563eb' },
            ].map((feature) => (
              <div key={feature.title} style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                border: '1px solid rgba(255,255,255,0.88)',
                borderRadius: '18px', padding: '28px 24px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                boxShadow: '0 2px 16px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,1)`; e.currentTarget.style.borderColor = 'rgba(255,255,255,1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.88)'; }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: `${feature.color}14`,
                  border: `1px solid ${feature.color}28`,
                  fontSize: '16px', color: feature.color, flexShrink: 0, marginBottom: '2px',
                }}>
                  {feature.symbol}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '-0.02em', color: '#1d1d1f', lineHeight: '1.3' }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.65', color: '#6e6e73', letterSpacing: '-0.003em' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{
          maxWidth: '680px', margin: '0 auto',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'saturate(200%) blur(32px)',
          WebkitBackdropFilter: 'saturate(200%) blur(32px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: '28px', padding: '72px 48px', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(99,102,241,0.1), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.08', color: '#1d1d1f', marginBottom: '20px',
          }}>
            Ready to own your presence?
          </h2>
          <p style={{
            fontSize: '17px', lineHeight: '1.65', color: '#6e6e73',
            letterSpacing: '-0.01em', marginBottom: '40px',
          }}>
            Join fashion creators who use Folio to turn their work into a business.
            <br />Free to start — no credit card required.
          </p>
          <Link to="/signup" style={{
            display: 'inline-block', fontSize: '15px', fontWeight: '600', color: '#fff',
            textDecoration: 'none', padding: '15px 36px', borderRadius: '980px',
            background: 'linear-gradient(135deg, #6d28d9, #2563eb)',
            boxShadow: '0 6px 24px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
          >
            Create your free portfolio
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(99,102,241,0.1)',
        padding: '28px 56px',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#86868b' }}>FOLIO</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[{ label: 'Sign In', to: '/login' }, { label: 'Get Started', to: '/signup' }].map(link => (
              <Link key={link.to} to={link.to} style={{
                fontSize: '13px', color: '#86868b', textDecoration: 'none', transition: 'color 0.15s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1d1d1f')}
                onMouseLeave={e => (e.currentTarget.style.color = '#86868b')}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#86868b' }}>Built for fashion creators</span>
        </div>
      </footer>

    </div>
  );
}
