import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #0d1f3c 60%, #0a0a1a 100%)',
        position: 'relative',
        overflowX: 'hidden',
        color: '#ffffff',
      }}
    >

      {/* ── Background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '20%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120, 60, 255, 0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 120, 255, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 60, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: '50%',
          width: '700px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 200, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px', height: '64px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{
          fontSize: '18px', fontWeight: '700',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          userSelect: 'none',
        }}>
          FOLIO
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none', padding: '8px 16px', borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Sign In
          </Link>
          <Link to="/signup" style={{
            fontSize: '14px', fontWeight: '500',
            color: '#ffffff', textDecoration: 'none',
            padding: '9px 20px', borderRadius: '980px',
            background: 'linear-gradient(135deg, rgba(120,80,255,0.9), rgba(0,120,255,0.9))',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(120,80,255,0.3)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 30px rgba(120,80,255,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(120,80,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', padding: '140px 24px 120px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '980px', padding: '6px 16px',
            marginBottom: '32px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              boxShadow: '0 0 8px rgba(168,85,247,0.8)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Creator Portfolio Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: '800',
            lineHeight: '1.0',
            letterSpacing: '-0.04em',
            marginBottom: '28px',
          }}>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Your portfolio.</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(59,130,246,0.9) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Live in 5 minutes.</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: '18px', lineHeight: '1.65',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '460px', margin: '0 auto 48px',
            letterSpacing: '-0.01em',
          }}>
            Connect Instagram. Set your brand. Start selling.
            No code, no friction — just your work, live.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/signup" style={{
              display: 'inline-block',
              fontSize: '16px', fontWeight: '600', color: '#ffffff',
              textDecoration: 'none', padding: '16px 36px', borderRadius: '980px',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
            >
              Create your free portfolio
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '16px', color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none', padding: '16px 24px', borderRadius: '980px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              Sign in <span>›</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Tagline glass strip ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          backdropFilter: 'blur(20px)',
          padding: '40px 48px',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <p style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: '600',
            letterSpacing: '-0.025em',
            lineHeight: '1.35',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            The only portfolio platform built for fashion creators.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p style={{
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', textAlign: 'center',
            color: 'rgba(255,255,255,0.35)', marginBottom: '64px',
          }}>
            How it works
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { number: '01', title: 'Connect Instagram', desc: 'We pull your latest work automatically. Your feed becomes your portfolio — always fresh, always live.' },
              { number: '02', title: 'Set your brand', desc: 'Pick your colors, name, and pricing in minutes. Make it unmistakably, entirely yours.' },
              { number: '03', title: 'Go live', desc: 'Share your link and start taking orders. Your audience is already waiting.' },
            ].map((step, i) => (
              <div key={step.number} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '20px',
                backdropFilter: 'blur(16px)',
                padding: '36px 32px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '10px', marginBottom: '20px',
                  background: `linear-gradient(135deg, ${i===0 ? 'rgba(124,58,237,0.4), rgba(37,99,235,0.4)' : i===1 ? 'rgba(37,99,235,0.4), rgba(0,180,200,0.4)' : 'rgba(180,60,255,0.4), rgba(124,58,237,0.4)'})`,
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '0.05em',
                }}>
                  {step.number}
                </span>
                <h3 style={{
                  fontSize: '17px', fontWeight: '600',
                  letterSpacing: '-0.02em', color: '#ffffff',
                  marginBottom: '10px', lineHeight: '1.3',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '14px', lineHeight: '1.65',
                  color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.005em',
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p style={{
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', textAlign: 'center',
            color: 'rgba(255,255,255,0.35)', marginBottom: '16px',
          }}>
            Everything you need
          </p>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: '700',
            letterSpacing: '-0.035em', textAlign: 'center',
            marginBottom: '56px', lineHeight: '1.1',
            background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.65))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            All the tools. None of the noise.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {[
              { symbol: '↗', title: 'Portfolio & shop in one', desc: 'Showcase your work and sell from a single cohesive link. One URL, full story.', gradient: 'rgba(124,58,237,0.25), rgba(37,99,235,0.15)' },
              { symbol: '⟳', title: 'Instagram auto-sync', desc: 'Post on Instagram — your portfolio updates itself. Always fresh, zero effort.', gradient: 'rgba(37,99,235,0.25), rgba(0,180,200,0.15)' },
              { symbol: '$', title: 'Stripe payments built-in', desc: 'Accept payments from day one. No third-party setup, no redirects.', gradient: 'rgba(0,180,200,0.2), rgba(0,120,255,0.15)' },
              { symbol: '⬡', title: 'Render gallery', desc: 'Show clients polished previews with a curated library of render templates.', gradient: 'rgba(180,60,255,0.25), rgba(124,58,237,0.15)' },
              { symbol: '◑', title: 'Custom brand & fonts', desc: 'Your brand, your rules. Dial in your palette and typography in seconds.', gradient: 'rgba(124,58,237,0.2), rgba(180,60,255,0.15)' },
              { symbol: '⊞', title: 'Unified admin panel', desc: 'Orders, inquiries, portfolio — all in one dashboard built for creators.', gradient: 'rgba(37,99,235,0.25), rgba(124,58,237,0.15)' },
            ].map((feature) => (
              <div key={feature.title} style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '20px',
                backdropFilter: 'blur(20px)',
                padding: '32px 28px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `linear-gradient(135deg, ${feature.gradient})`,
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '17px', color: 'rgba(255,255,255,0.85)',
                  marginBottom: '4px', flexShrink: 0,
                }}>
                  {feature.symbol}
                </span>
                <h4 style={{
                  fontSize: '15px', fontWeight: '600',
                  letterSpacing: '-0.02em', color: '#ffffff', lineHeight: '1.3',
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '13px', lineHeight: '1.65',
                  color: 'rgba(255,255,255,0.42)', letterSpacing: '-0.003em',
                }}>
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
          maxWidth: '700px', margin: '0 auto',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '28px',
          backdropFilter: 'blur(24px)',
          padding: '72px 48px',
          textAlign: 'center',
          boxShadow: '0 16px 60px rgba(124,58,237,0.15), 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.08',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.75))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Ready to own your presence?
          </h2>
          <p style={{
            fontSize: '17px', lineHeight: '1.65',
            color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.01em', marginBottom: '40px',
          }}>
            Join fashion creators who use Folio to turn their work into a business.
            <br />Free to start — no credit card required.
          </p>
          <Link to="/signup" style={{
            display: 'inline-block', fontSize: '16px', fontWeight: '600',
            color: '#ffffff', textDecoration: 'none', padding: '16px 36px', borderRadius: '980px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
          >
            Create your free portfolio
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '32px 48px',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <span style={{
            fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          }}>
            Folio
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[{ label: 'Sign In', to: '/login' }, { label: 'Get Started', to: '/signup' }].map(link => (
              <Link key={link.to} to={link.to} style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none', transition: 'color 0.15s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
            Built for fashion creators
          </span>
        </div>
      </footer>

    </div>
  );
}
