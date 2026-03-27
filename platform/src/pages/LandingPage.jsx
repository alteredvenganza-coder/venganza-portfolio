import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0a0a0a' }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{
          background: 'rgba(10, 10, 10, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <span
          className="text-xl tracking-widest font-bold uppercase select-none"
          style={{ fontFamily: 'var(--font-heading, serif)', letterSpacing: '0.25em' }}
        >
          FOLIO
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-white/70 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-white text-black px-5 py-2 hover:bg-white/90 transition-colors duration-200"
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden"
        style={{ minHeight: '90vh' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'rgba(255, 240, 220, 0.04)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1
            className="text-6xl md:text-8xl font-bold uppercase leading-none tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-heading, serif)' }}
          >
            <span className="block">Your portfolio.</span>
            <span className="block text-white/50">Live in 5 minutes.</span>
          </h1>

          <p className="text-base md:text-lg text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
            Connect Instagram. Set your brand. Start selling.
            <br />
            No code needed.
          </p>

          <Link
            to="/signup"
            className="inline-block bg-white text-black text-sm font-semibold px-8 py-4 hover:bg-white/90 transition-colors duration-200 tracking-wide"
          >
            Create Your Free Portfolio →
          </Link>

          <p className="mt-5 text-xs text-white/30">
            Already have an account?{' '}
            <Link to="/login" className="text-white/60 hover:text-white underline underline-offset-2 transition-colors duration-200">
              Login →
            </Link>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest text-white/30 uppercase mb-12 text-center">
            How it works
          </p>

          <div className="flex flex-col md:flex-row gap-12 md:gap-0">
            {[
              {
                number: '01',
                title: 'Connect Instagram',
                desc: 'We pull your latest work automatically. Your feed becomes your portfolio — always up to date.',
              },
              {
                number: '02',
                title: 'Set your brand',
                desc: 'Choose your colors, name, and pricing in minutes. Make it unmistakably yours.',
              },
              {
                number: '03',
                title: 'Go live',
                desc: 'Share your link and start taking orders. Your audience is already waiting.',
              },
            ].map((step, i) => (
              <div
                key={step.number}
                className="flex-1 flex flex-col md:items-start items-center text-center md:text-left relative"
              >
                {/* Connector line between steps (desktop only) */}
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-3 left-1/2 w-full h-px"
                    style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)' }}
                  />
                )}
                <span
                  className="text-xs tracking-widest text-white/20 mb-4 font-mono"
                >
                  {step.number}
                </span>
                <h3
                  className="text-lg font-semibold mb-3 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-heading, serif)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest text-white/30 uppercase mb-12 text-center">
            Everything you need
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/10">
            {[
              {
                icon: '◈',
                title: 'Portfolio & shop in one',
                desc: 'Showcase your work and sell your services from a single, cohesive link.',
              },
              {
                icon: '⟳',
                title: 'Instagram feed auto-sync',
                desc: 'Your portfolio stays fresh without lifting a finger. Post on Instagram, done.',
              },
              {
                icon: '⬡',
                title: 'Stripe payments built-in',
                desc: 'Accept payments securely from day one. No third-party setup required.',
              },
              {
                icon: '▦',
                title: 'Pre-made renders gallery',
                desc: 'Show clients finished-look previews with a curated gallery of render templates.',
              },
              {
                icon: '◐',
                title: 'Custom brand colors & fonts',
                desc: 'Your brand, your rules. Dial in your palette and typography in seconds.',
              },
              {
                icon: '⊞',
                title: 'Admin panel to manage everything',
                desc: 'Orders, inquiries, portfolio — all in one clean dashboard built for creators.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 p-8"
                style={{ backgroundColor: '#0a0a0a' }}
              >
                <span className="text-xl text-white/30">{feature.icon}</span>
                <h4
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-heading, serif)' }}
                >
                  {feature.title}
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <span
            className="text-sm tracking-widest uppercase text-white/60"
            style={{ fontFamily: 'var(--font-heading, serif)' }}
          >
            FOLIO — Creator Portfolio Platform
          </span>
          <span className="text-xs text-white/30">
            Built with ♥ for fashion creators
          </span>
        </div>
      </footer>

    </div>
  );
}
