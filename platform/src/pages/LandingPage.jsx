import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#1d1d1f',
      }}
    >

      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid #d2d2d7',
          padding: '0 48px',
          height: '52px',
        }}
      >
        <span
          style={{
            fontSize: '17px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            color: '#1d1d1f',
            userSelect: 'none',
          }}
        >
          Folio
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: '#6e6e73',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.target.style.color = '#1d1d1f')}
            onMouseLeave={e => (e.target.style.color = '#6e6e73')}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: '#0071e3',
              textDecoration: 'none',
              padding: '7px 16px',
              borderRadius: '980px',
              letterSpacing: '-0.01em',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#0077ed')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#0071e3')}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          backgroundColor: '#ffffff',
          textAlign: 'center',
          padding: '120px 24px 128px',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Eyebrow label */}
          <p
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#0071e3',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            Introducing Folio
          </p>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(48px, 7vw, 80px)',
              fontWeight: '700',
              lineHeight: '1.05',
              letterSpacing: '-0.04em',
              color: '#1d1d1f',
              marginBottom: '24px',
            }}
          >
            <span style={{ display: 'block' }}>Your portfolio.</span>
            <span style={{ display: 'block', color: '#6e6e73' }}>Live in 5 minutes.</span>
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontSize: '19px',
              fontWeight: '400',
              lineHeight: '1.6',
              color: '#6e6e73',
              letterSpacing: '-0.01em',
              maxWidth: '480px',
              margin: '0 auto 44px',
            }}
          >
            Connect Instagram. Set your brand. Start selling.
            No code. No friction. Just you and your work.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <Link
              to="/signup"
              style={{
                display: 'inline-block',
                fontSize: '17px',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: '#0071e3',
                textDecoration: 'none',
                padding: '14px 28px',
                borderRadius: '980px',
                letterSpacing: '-0.01em',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.target.style.backgroundColor = '#0077ed')}
              onMouseLeave={e => (e.target.style.backgroundColor = '#0071e3')}
            >
              Create your free portfolio
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '17px',
                fontWeight: '400',
                color: '#0071e3',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.target.style.color = '#0077ed')}
              onMouseLeave={e => (e.target.style.color = '#0071e3')}
            >
              Already have an account <span style={{ fontSize: '20px', lineHeight: 1 }}>›</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Tagline strip ── */}
      <section
        style={{
          backgroundColor: '#f5f5f7',
          borderTop: '1px solid #d2d2d7',
          borderBottom: '1px solid #d2d2d7',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: '600',
            letterSpacing: '-0.025em',
            color: '#1d1d1f',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.3',
          }}
        >
          The only portfolio platform built for fashion creators.
        </p>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '112px 48px',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#86868b',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '72px',
            }}
          >
            How it works
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0',
            }}
          >
            {[
              {
                number: '01',
                title: 'Connect Instagram',
                desc: 'We pull your latest work automatically. Your feed becomes your portfolio — always fresh, always current.',
              },
              {
                number: '02',
                title: 'Set your brand',
                desc: 'Choose your colors, name, and pricing in minutes. Make it unmistakably, entirely yours.',
              },
              {
                number: '03',
                title: 'Go live',
                desc: 'Share your link and start taking orders. Your audience is already waiting for you.',
              },
            ].map((step, i) => (
              <div
                key={step.number}
                style={{
                  padding: '0 40px',
                  borderLeft: i > 0 ? '1px solid #d2d2d7' : 'none',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#86868b',
                    letterSpacing: '0.08em',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '16px',
                  }}
                >
                  {step.number}
                </span>
                <h3
                  style={{
                    fontSize: '19px',
                    fontWeight: '600',
                    letterSpacing: '-0.02em',
                    color: '#1d1d1f',
                    marginBottom: '12px',
                    lineHeight: '1.3',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    lineHeight: '1.65',
                    color: '#6e6e73',
                    letterSpacing: '-0.005em',
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Features grid ── */}
      <section
        style={{
          backgroundColor: '#f5f5f7',
          borderTop: '1px solid #d2d2d7',
          padding: '112px 48px',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#86868b',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            Everything you need
          </p>

          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              letterSpacing: '-0.035em',
              color: '#1d1d1f',
              textAlign: 'center',
              marginBottom: '72px',
              lineHeight: '1.1',
            }}
          >
            All the tools. None of the noise.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2px',
              backgroundColor: '#d2d2d7',
              borderRadius: '18px',
              overflow: 'hidden',
            }}
          >
            {[
              {
                symbol: '↗',
                title: 'Portfolio & shop in one',
                desc: 'Showcase your work and sell your services from a single, cohesive link. One URL, full story.',
              },
              {
                symbol: '⟳',
                title: 'Instagram auto-sync',
                desc: 'Your portfolio stays fresh without lifting a finger. Post on Instagram — your portfolio updates itself.',
              },
              {
                symbol: '$',
                title: 'Stripe payments built-in',
                desc: 'Accept payments securely from day one. No third-party setup, no redirects, no friction.',
              },
              {
                symbol: '◻',
                title: 'Render gallery',
                desc: 'Show clients polished, finished-look previews with a curated library of render templates.',
              },
              {
                symbol: '◑',
                title: 'Custom brand & fonts',
                desc: 'Your brand, your rules. Dial in your palette and typography in seconds, not hours.',
              },
              {
                symbol: '⊞',
                title: 'Unified admin panel',
                desc: 'Orders, inquiries, portfolio — all in one clean dashboard designed for working creators.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f7',
                    fontSize: '16px',
                    color: '#1d1d1f',
                    fontWeight: '400',
                    marginBottom: '4px',
                    flexShrink: 0,
                  }}
                >
                  {feature.symbol}
                </span>
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    letterSpacing: '-0.02em',
                    color: '#1d1d1f',
                    lineHeight: '1.3',
                  }}
                >
                  {feature.title}
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    lineHeight: '1.65',
                    color: '#6e6e73',
                    letterSpacing: '-0.003em',
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #d2d2d7',
          padding: '120px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          <h2
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: '700',
              letterSpacing: '-0.04em',
              color: '#1d1d1f',
              lineHeight: '1.08',
              marginBottom: '24px',
            }}
          >
            Ready to own your presence?
          </h2>

          <p
            style={{
              fontSize: '19px',
              fontWeight: '400',
              lineHeight: '1.6',
              color: '#6e6e73',
              letterSpacing: '-0.01em',
              marginBottom: '44px',
            }}
          >
            Join fashion creators who use Folio to turn their work into a business.
            Free to start — no credit card required.
          </p>

          <Link
            to="/signup"
            style={{
              display: 'inline-block',
              fontSize: '17px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: '#0071e3',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '980px',
              letterSpacing: '-0.01em',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#0077ed')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#0071e3')}
          >
            Create your free portfolio
          </Link>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: '#f5f5f7',
          borderTop: '1px solid #d2d2d7',
          padding: '32px 48px',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#86868b',
              letterSpacing: '-0.01em',
            }}
          >
            Folio — Creator Portfolio Platform
          </span>

          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Sign In', to: '/login' },
              { label: 'Get Started', to: '/signup' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '13px',
                  color: '#6e6e73',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => (e.target.style.color = '#1d1d1f')}
                onMouseLeave={e => (e.target.style.color = '#6e6e73')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <span
            style={{
              fontSize: '12px',
              color: '#86868b',
              letterSpacing: '-0.005em',
            }}
          >
            Built for fashion creators
          </span>
        </div>
      </footer>

    </div>
  );
}
