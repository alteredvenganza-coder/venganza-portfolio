import { useEffect, useRef, useState } from 'react';
import './App.css';

/* ============================================================
   ALTERED VENGANZA — Design Studio by Nadir Martinez
   A clean, modern editorial one-page portfolio.
   Type: Bebas Neue (display) · Playfair Display (serif) · Space Mono (labels)
   Palette: off-white #FAF9F7 · near-black #131313 · oxblood #7B1F24
   ============================================================ */

const STUDIO = {
  name: 'Altered Venganza',
  full: 'Altered Venganza Design Studio',
  founder: 'Nadir Martinez',
  city: 'Trieste, IT',
  email: 'studio@alteredvenganza.com',
  instagram: 'alteredvenganza',
  tagline: 'We build brands worth defending.',
  intro:
    'An Italian creative studio shaping identity systems, apparel and tools for emerging brands. Strategic, editorial, made to outlast a single drop.',
};

const WORK = [
  {
    id: 'maali',
    title: 'Maali',
    year: '2026',
    tags: ['Identity', 'Apparel', 'Production'],
    brief: 'A clothing label searching for an identity that could survive across drops without losing tension.',
    result: 'A modular logo system and label set the brand can drop on for years without rebuilding.',
  },
  {
    id: 'studios04',
    title: '[04]-Studios',
    year: '2025',
    tags: ['Identity', 'Direction'],
    brief: 'A creative studio needing a confident logo and a quiet visual system to anchor it.',
    result: 'A typographic mark and a restrained palette that works across web, social and print.',
  },
  {
    id: 'rare',
    title: 'Rare',
    year: '2025',
    tags: ['Sub-brand', 'Art Direction'],
    brief: 'A rebellious sub-brand that needed its own voice without breaking from the parent studio.',
    result: 'A sharper, louder identity that lives next to Altered Venganza yet stands on its own.',
  },
];

const SERVICES = [
  { n: '01', title: 'Brand System', desc: 'Complete identity for clothing brands — strategy, logo system, visual language, label set.', meta: '€3,500 – €5,500' },
  { n: '02', title: 'Drop Starter', desc: 'For first-drop founders. Logo, palette, typography, social templates, print graphics.', meta: '€900 – €1,800' },
  { n: '03', title: 'Packaging Design', desc: 'Print-ready packaging built on top of an existing identity. Master and variant systems.', meta: '€900 – €2,000' },
  { n: '04', title: 'Retainer', desc: 'Ongoing creative continuity for brands that ship — graphics, social, ads, email.', meta: '€600 – €2,500 / mo' },
  { n: '05', title: 'Custom Apparel', desc: 'Tailored clothing graphics & techpacks built from your references and direction.', meta: '€190 – €5,500' },
];

const PRINCIPLES = [
  ['Editorial first', 'Design that reads like a considered magazine, not a template.'],
  ['Built to last', 'Systems engineered to outlive a single drop or season.'],
  ['Small & direct', 'You work with the studio, not a layer of account managers.'],
];

/* ---- Reveal-on-scroll (respects prefers-reduced-motion) ---- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const els = root.querySelectorAll('[data-reveal]');
    if (reduce) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const NAV = [
  ['Work', '#work'],
  ['Studio', '#studio'],
  ['Services', '#services'],
  ['Contact', '#contact'],
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`av-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="av-nav-inner">
        <a href="#top" className="av-word">{STUDIO.name}</a>
        <nav className="av-links">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
        <button className="av-burger" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      {open && (
        <nav className="av-links-mobile">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Eyebrow({ children, index }) {
  return (
    <div className="av-eyebrow" data-reveal>
      <span className="av-eyebrow-label">{children}</span>
      <span className="av-rule" />
      {index && <span className="av-eyebrow-index">{index}</span>}
    </div>
  );
}

function Hero() {
  return (
    <section className="av-hero" id="top">
      <div className="av-hero-grid">
        <div className="av-hero-copy">
          <div className="av-eyebrow" data-reveal>
            <span className="av-eyebrow-label">Italian Creative Studio · {STUDIO.city}</span>
            <span className="av-rule" />
            <span className="av-eyebrow-index">N° 01</span>
          </div>
          <h1 className="av-hero-title" data-reveal>
            <span>Altered</span>
            <span className="accent">Venganza</span>
          </h1>
          <p className="av-hero-tagline" data-reveal>{STUDIO.tagline}</p>
          <p className="av-hero-intro" data-reveal>{STUDIO.intro}</p>
          <div className="av-hero-cta" data-reveal>
            <a href="#contact" className="av-btn av-btn-primary">Schedule a consultation →</a>
            <a href="#work" className="av-btn av-btn-ghost">See selected work</a>
          </div>
        </div>
        <div className="av-hero-side" data-reveal>
          <div className="av-hero-card">
            <span className="av-hero-mark">AV</span>
            <div className="av-hero-meta">
              <span>Studio · 2026</span>
              <span>{STUDIO.city}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="av-section" id="work">
      <Eyebrow index="02">Selected Work</Eyebrow>
      <h2 className="av-h2" data-reveal>Case studies</h2>
      <div className="av-work-list">
        {WORK.map((w) => (
          <article className="av-work" data-reveal key={w.id}>
            <div className="av-work-head">
              <h3 className="av-work-title">{w.title}</h3>
              <span className="av-work-year">{w.year}</span>
            </div>
            <div className="av-work-body">
              <p className="av-work-brief">{w.brief}</p>
              <p className="av-work-result">{w.result}</p>
              <div className="av-tags">
                {w.tags.map((t) => (
                  <span className="av-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="av-section" id="services">
      <Eyebrow index="03">Strategic Engagements</Eyebrow>
      <h2 className="av-h2" data-reveal>What we build</h2>
      <div className="av-services" data-reveal>
        {SERVICES.map((s) => (
          <div className="av-service" key={s.n}>
            <span className="av-service-n">{s.n}</span>
            <h3 className="av-service-title">{s.title}</h3>
            <p className="av-service-desc">{s.desc}</p>
            <span className="av-service-meta">{s.meta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section className="av-section" id="studio">
      <Eyebrow index="04">The Studio</Eyebrow>
      <h2 className="av-h2" data-reveal>
        A small studio, <span className="accent-serif">by {STUDIO.founder}.</span>
      </h2>
      <p className="av-studio-lead" data-reveal>{STUDIO.intro}</p>
      <div className="av-principles" data-reveal>
        {PRINCIPLES.map(([t, d]) => (
          <div className="av-principle" key={t}>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="av-section av-contact" id="contact">
      <Eyebrow>Let's build it</Eyebrow>
      <h2 className="av-cta-title" data-reveal>
        If your brand is going to last,
        <br />
        <span className="accent-serif">it deserves a real foundation.</span>
      </h2>
      <p className="av-cta-sub" data-reveal>
        Tell us where you are. We'll tell you honestly what makes sense — premade, custom, or somewhere between.
      </p>
      <div className="av-hero-cta" data-reveal>
        <a href={`mailto:${STUDIO.email}`} className="av-btn av-btn-primary">{STUDIO.email} →</a>
        <a href={`https://instagram.com/${STUDIO.instagram}`} target="_blank" rel="noopener noreferrer" className="av-btn av-btn-ghost">@{STUDIO.instagram}</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="av-footer">
      <span>© 2026 {STUDIO.full} — by {STUDIO.founder}.</span>
      <span>VAT IT01433140322 — All rights reserved.</span>
    </footer>
  );
}

export default function App() {
  const ref = useReveal();
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#faf9f7';
    document.documentElement.style.background = '#faf9f7';
    return () => { document.body.style.background = prev; };
  }, []);
  return (
    <div className="av-root" ref={ref}>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Services />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
