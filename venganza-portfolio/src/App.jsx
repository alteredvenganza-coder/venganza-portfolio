import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Instagram, ArrowLeft, ArrowRight, Folder, FileImage, FileVideo, User, X, ExternalLink, MessageCircle, ShoppingBag, Plus, Minus, Trash2, ChevronDown, Menu } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INSTAGRAM_DM_URL, INSTAGRAM_HANDLE, PREMADE_PRICE_PREMIUM, PREMADE_PRICE_BASIC } from './config';
import { useTheme } from './hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// DATA
// ==========================================
const brandIdentityData = [
  {
    title: "Packaging Design & Development",
    subtitle: "After Completing Brand Identity",
    price: "EUR €900 – €2,000",
    delivery: "Print-Ready Files",
    features: ["Master Packaging EUR €2,000", "Variant Packaging EUR €900"],
    layout: "bullets"
  },
  {
    title: "Clothing Brand",
    subtitle: "Balanced identity system",
    price: "EUR €3,500 – €5,500",
    delivery: "3 to 4 weeks",
    features: [
      "Light brand strategy", "Positioning", "Tone of voice", "Logo system (main logo + variations)",
      "Visual system (patterns / graphic elements)", "Label set (Neck, Wash, Flag)",
      "Hangtag design", "Basic packaging design", "15 social media templates (feed + stories)"
    ],
    details: "Outcome: A repeatable identity system designed to support multiple drops without starting from scratch every time.",
    layout: "bullets"
  },
  {
    title: "Drop Starter",
    subtitle: "For brands launching their first drop",
    price: "EUR €900 – €1,800",
    delivery: "1 to 2 weeks",
    features: [
      "Simple logo design or logo refresh", "Color palette", "Primary typography",
      "10 Instagram templates (posts / stories)", "2 basic print graphics (t-shirt / hoodie / merch)"
    ],
    details: "Notes: This package is focused on execution.",
    layout: "bullets"
  },
  {
    title: "RETAINER",
    subtitle: "Clothing brand — Ongoing drop support",
    price: "EUR €600 – €2,500",
    delivery: "Monthly",
    features: ["Drop graphics & assets", "Social content & templates", "Drop / landing pages", "Email visuals", "Ads creative assets"],
    details: "Includes (based on scope). Designed as creative continuity, not basic maintenance.",
    layout: "bullets"
  }
];

const designsData = [
  {
    title: "Premade Design",
    subtitle: "Balanced identity system",
    price: "EUR €150 – €250",
    delivery: "4h-1 day delivery",
    features: [
      "Personal or commercial use",
      "PNG/JPG/PSD/PDF",
      "Text & color can be altered",
      "Free mockup",
      "High resolution 300 ppi",
      "Size Chart if required",
      "Factory contact based in Portugal with MOQ of 50 pcs"
    ],
    layout: "bullets"
  },
  {
    title: "E-commerce Visual Asset",
    subtitle: "Product Visualization for E-commerce & Social",
    price: "EUR €45 - €140",
    delivery: "4h - 1 day delivery",
    layout: "options",
    options: [
      { price: "Single View — €45", delivery: "(4 h delivery)", features: ["High-resolution studio lighting render.", "Optimized for product page or feed."] },
      { price: "Custom View — €60", delivery: "(6 h delivery)", features: ["Specific camera angle requested by client.", "Lighting & shadow refined."] },
      { price: "360° — €140", delivery: "(1 day delivery)", features: ["Full rotational sequence.", "Ready for interactive e-commerce integration."] }
    ]
  },
  {
    title: "Techpack",
    subtitle: "Specification Sheet",
    price: "EUR €70 – €170",
    delivery: "1-2 days delivery",
    layout: "bullets",
    features: ["Flat technical drawing (front / back)", "Fabric & color specifications", "Print / embroidery placement", "Essential construction notes"],
    details: "Simplified production guide for basic garments. Full Techpack — €170 include complete measurement chart, stitching & construction details, fabric specs, and packaging notes."
  }
];

const allData = [...brandIdentityData, ...designsData];

// ==========================================
// BACKGROUND / THEME
// ==========================================

const AnimatedBackground = () => {
  const location = useLocation();
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q1 = document.querySelector('.glow-orb-wrapper-1');
      const q2 = document.querySelector('.glow-orb-wrapper-2');
      const q3 = document.querySelector('.glow-orb-wrapper-3');

      let xTo1, yTo1, xTo2, yTo2, xTo3, yTo3;
      if (q1) {
        xTo1 = gsap.quickTo('.glow-orb-wrapper-1', 'x', { duration: 3, ease: 'power3.out' });
        yTo1 = gsap.quickTo('.glow-orb-wrapper-1', 'y', { duration: 3, ease: 'power3.out' });
      }
      if (q2) {
        xTo2 = gsap.quickTo('.glow-orb-wrapper-2', 'x', { duration: 4, ease: 'power3.out' });
        yTo2 = gsap.quickTo('.glow-orb-wrapper-2', 'y', { duration: 4, ease: 'power3.out' });
      }
      if (q3) {
        xTo3 = gsap.quickTo('.glow-orb-wrapper-3', 'x', { duration: 5, ease: 'power3.out' });
        yTo3 = gsap.quickTo('.glow-orb-wrapper-3', 'y', { duration: 5, ease: 'power3.out' });
      }

      const onMouseMove = (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        if (xTo1) { xTo1(dx * 0.15); yTo1(dy * 0.15); }
        if (xTo2) { xTo2(dx * 0.2); yTo2(dy * 0.2); }
        if (xTo3) { xTo3(dx * 0.1); yTo3(dy * 0.1); }
      };

      window.addEventListener('mousemove', onMouseMove);
      return () => window.removeEventListener('mousemove', onMouseMove);
    }, bgRef);
    return () => ctx.revert();
  }, [location.pathname]);

  const path = location.pathname;
  const isLightMode = path === '/' || path === '/archive';

  return (
    <div ref={bgRef} className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
      {!isLightMode && (
        <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72 0.72"
              numOctaves="4"
              seed="2"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0.3" in="noise" result="coloredNoise" />
            <feComposite in="coloredNoise" in2="SourceGraphic" operator="in" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      )}
      {!isLightMode ? (
        <>
          <div className="glow-wrapper glow-orb-wrapper-1" style={{ pointerEvents: 'none' }}><div className="glow-orb-1"></div></div>
          <div className="glow-wrapper glow-orb-wrapper-2" style={{ pointerEvents: 'none' }}><div className="glow-orb-2"></div></div>
          <div className="glow-wrapper glow-orb-wrapper-3" style={{ pointerEvents: 'none' }}><div className="glow-orb-3"></div></div>
        </>
      ) : (
        <div className="glow-wrapper glow-orb-wrapper-2" style={{ pointerEvents: 'none' }}>
           <div className="glow-orb-2 orb-mode-light"></div>
        </div>
      )}
    </div>
  );
};

const ThemeController = () => {
  const location = useLocation();
  useEffect(() => {
    document.body.classList.remove('theme-red', 'theme-light', 'theme-dark');
    const path = location.pathname;
    
    if (path === '/' || path === '/archive' || path === '/about' || path === '/premades') {
      document.body.classList.add('theme-light');
    } else if (path === '/designs' || decodeURIComponent(path).includes('E-commerce') || decodeURIComponent(path).includes('Premade') || decodeURIComponent(path).includes('Techpack')) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add('theme-red');
    }
  }, [location.pathname]);
  return null;
};

// ==========================================
// MOBILE BURGER MENU (ERD Style)
// ==========================================

const MobileMenu = ({ onClose }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      gsap.from('.mobile-menu-link', { y: 30, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    });
    return () => { document.body.style.overflow = ''; ctx.revert(); };
  }, []);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center">
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-black/60 hover:text-black transition-colors">
        <X size={24} />
      </button>
      <nav className="flex flex-col items-center gap-6">
        <Link to="/" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Home</Link>
        <Link to="/brand-identity" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Brand Identity</Link>
        <Link to="/designs" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Clothing Designs</Link>
        <Link to="/vag" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">VAG</Link>
        <Link to="/premades" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Premades</Link>
        <Link to="/archive" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Archive</Link>
        <Link to="/about" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-[color:var(--primary)] tracking-widest uppercase hover:text-black transition-colors">Who the f*ck is Rare?</Link>
        <Link to="/contact" onClick={onClose} className="mobile-menu-link heading-font text-3xl text-black tracking-widest uppercase hover:text-[color:var(--primary)] transition-colors">Contact</Link>
      </nav>
    </div>
  );
};

// ==========================================
// SHARED FOOTER (all pages)
// ==========================================

const SiteFooter = ({ light = true }) => {
  const textColor = light ? 'text-black/40' : 'text-white/40';
  const hoverColor = light ? 'hover:text-black' : 'hover:text-white';

  return (
    <footer className={`w-full relative z-20 mt-auto`}>
      {/* Softwares */}
      <div className="py-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-3">
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} ${hoverColor} uppercase tracking-[0.15em] transition-colors cursor-pointer`}>MAT Renders</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} uppercase tracking-[0.15em]`}>&bull;</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} ${hoverColor} uppercase tracking-[0.15em] transition-colors cursor-pointer`}>MAT Ideas</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} uppercase tracking-[0.15em]`}>&bull;</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} ${hoverColor} uppercase tracking-[0.15em] transition-colors cursor-pointer`}>MAT Try On</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} uppercase tracking-[0.15em]`}>&bull;</span>
          <span className={`font-mono text-[9px] md:text-[10px] ${textColor} ${hoverColor} uppercase tracking-[0.15em] transition-colors cursor-pointer`}>MAT Drop</span>
        </div>
        <p className={`font-mono text-[8px] md:text-[9px] ${textColor} uppercase tracking-[0.2em] mb-2`}>Coming Soon</p>
        <Link to="/about" className={`font-mono text-[8px] md:text-[9px] text-[color:var(--primary)] ${hoverColor} uppercase tracking-[0.15em] transition-colors`}>
          What is Materializing Ideas?
        </Link>
      </div>

      {/* Copyright */}
      <p className={`font-mono text-[8px] md:text-[9px] ${textColor} uppercase tracking-[0.15em] text-center pb-6`}>
        &copy; 2026 Altered Venganza. VAT IT01433140322 — All rights reserved.
      </p>
    </footer>
  );
};

// ==========================================
// HOME PAGE (LIGHT THEME)
// ==========================================

// ==========================================
// LATEST PREMADE SHOWCASE (for Homepage)
// ==========================================

const useLatestPremade = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/instagram-feed');
        if (!res.ok) throw new Error('API error');
        const { data } = await res.json();

        const post = data?.[0]; // Already filtered by #premade, first = newest

        if (post) {
          setLatest({
            imageUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
            permalink: post.permalink,
            caption: (post.caption || '').split('\n')[0].replace(/#\w+/g, '').trim(),
          });
        }
      } catch (err) {
        console.error('Failed to fetch latest premade:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { latest, loading };
};

const Home = () => {
  const containerRef = useRef();
  const { latest, loading: premadeLoading } = useLatestPremade();
  const theme = useTheme();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-item', { y: -20, opacity: 0, stagger: 0.05, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-panel', { y: 40, opacity: 0, stagger: 0.15, duration: 1.5, ease: 'power3.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative z-10" ref={containerRef}>

      {/* ============ TOP NAV BAR — ERD Style ============ */}
      <header className="flex items-start justify-between px-6 md:px-10 pt-6 md:pt-8 pb-4 relative z-20">

        {/* Left — Logo + Handle + Description */}
        <div className="nav-item flex-shrink-0">
          <Link to="/" className="heading-font leading-none text-black tracking-widest hover:opacity-70 transition-opacity block">
            <span className="hidden lg:inline text-4xl xl:text-5xl">Altered Venganza</span>
            <span className="lg:hidden text-3xl sm:text-4xl">Altered<br/>Venganza</span>
          </Link>
          <a href="https://www.instagram.com/rare______________________/" target="_blank" rel="noopener noreferrer" className="font-mono text-[8px] md:text-[9px] text-black/40 hover:text-[color:var(--primary)] uppercase tracking-[0.1em] transition-colors mt-1.5 block">
            rare______________________
          </a>
          <p className="font-mono text-[8px] md:text-[9px] text-black/50 uppercase tracking-[0.1em] leading-relaxed mt-2">
            <span className="hidden lg:inline">Multi-disciplinary studio for brands that builds. Premium Branding + Custom Designs &bull; Pre-mades &amp; Softwares for Fashion Designers and Creatives.</span>
            <span className="lg:hidden max-w-[260px] block">Multi-disciplinary studio<br/>for brands that builds.</span>
          </p>
        </div>

        {/* Center — Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 pt-2">
          <div className="relative pb-2 -mb-2" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button onClick={() => setServicesOpen(o => !o)} className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors flex items-center gap-1">
              Services <ChevronDown size={12} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 bg-white border border-black/10 rounded-lg shadow-xl py-2 min-w-[200px] z-50">
                <Link to="/brand-identity" onClick={() => setServicesOpen(false)} className="block px-5 py-2.5 font-mono text-[10px] text-black/70 hover:text-black hover:bg-black/5 uppercase tracking-[0.15em] transition-colors">Brand Identity</Link>
                <Link to="/designs" onClick={() => setServicesOpen(false)} className="block px-5 py-2.5 font-mono text-[10px] text-black/70 hover:text-black hover:bg-black/5 uppercase tracking-[0.15em] transition-colors">Clothing Designs</Link>
              </div>
            )}
          </div>
          <Link to="/vag" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors">VAG</Link>
          <Link to="/premades" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors">Premades</Link>
          <Link to="/archive" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors">Archive</Link>
          <Link to="/about" className="nav-item font-mono text-[11px] text-[color:var(--primary)] hover:text-black uppercase tracking-[0.15em] transition-colors">Who the f*ck is Rare?</Link>
        </nav>

        {/* Right — Contact + Cart + Burger */}
        <div className="flex items-center gap-6 pt-2">
          <Link to="/contact" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors hidden md:block">Contact</Link>
          <Link to="/premades" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.15em] transition-colors hidden md:block">Cart (0)</Link>
          <button onClick={() => setMenuOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ============ HERO — Two panels side by side ============ */}
      <div className="flex-1 flex flex-col md:flex-row w-full relative z-10">
        <Link to="/premades" className="hero-panel relative w-full md:w-1/2 min-h-[50vh] md:min-h-0 overflow-hidden group cursor-pointer">
          {premadeLoading && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
              <span className="font-mono text-black/30 uppercase tracking-[0.2em] text-xs animate-pulse">Loading...</span>
            </div>
          )}
          {!premadeLoading && latest && (
            <img src={latest.imageUrl} alt="Latest Premade" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          )}
          {!premadeLoading && !latest && theme.images?.heroLeft && (
            <img src={theme.images.heroLeft} alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          )}
          {!premadeLoading && !latest && !theme.images?.heroLeft && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
              <span className="font-mono text-black/30 uppercase tracking-[0.2em] text-xs">Coming Soon</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-6 left-6 md:bottom-8 md:left-8 font-mono text-[11px] md:text-xs text-white uppercase tracking-[0.25em] group-hover:tracking-[0.35em] transition-all duration-500">
            Shop Premades
          </span>
        </Link>

        <Link to="/brand-identity" className="hero-panel relative w-full md:w-1/2 min-h-[50vh] md:min-h-0 overflow-hidden group cursor-pointer bg-neutral-100 flex items-center justify-center">
          {theme.images?.heroRight ? (
            <img src={theme.images.heroRight} alt="Brand Identity" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <span className="font-mono text-black/20 uppercase tracking-[0.2em] text-xs relative z-10">Coming Soon</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] group-hover:tracking-[0.35em] transition-all duration-500 ${theme.images?.heroRight ? 'text-white' : 'text-black/60 group-hover:text-black'}`}>
            Brand Identity
          </span>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 md:px-10">
        <SiteFooter light={true} />
      </div>

      {/* Mobile Menu */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// SERVICE PAGES (DARK THEMES & EDITORIAL LAYOUT)
// ==========================================

const ServiceItem = ({ title, subtitle, price, delivery }) => {
  return (
    <Link
      to={`/service/${encodeURIComponent(title)}`}
      className="block py-10 border-b border-white/10 group last:border-0 opacity-0 translate-y-8 service-item transition-all duration-500 relative overflow-hidden text-center"
    >
      {/* Hover tint that sweeps in */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex flex-col gap-2 relative z-10 w-full max-w-xl mx-auto px-4">
        <h2 className="serif-heading text-5xl md:text-6xl text-white mb-2 transition-colors duration-500 group-hover:text-[color:var(--primary)] text-center">
          {title}
        </h2>
        <h3 className="serif-heading text-lg md:text-xl text-white/70 group-hover:text-white/90 font-light mb-6 transition-colors duration-500 text-center">
          {subtitle}
        </h3>
        <div className="flex justify-center items-center gap-6 mb-4">
          <span className="text-xl md:text-2xl text-white group-hover:text-[color:var(--primary)] font-medium transition-colors duration-500">
            {price}
          </span>
          <span className="text-white/60 text-sm md:text-base font-light transition-colors">
            ({delivery})
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-[color:var(--primary)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
           Explore Details <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
};

const ServicePage = ({ title, services }) => {
  const containerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      gsap.from('.header-element', { y: 30, opacity: 0, stagger: 0.1, duration: 1.5, ease: 'power3.out' });
      gsap.utils.toArray('.service-item').forEach(item => {
        gsap.to(item, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 85%' }});
      });
    }, containerRef);
    return () => ctx.revert();
  }, [title]);

  return (
    <div className="min-h-screen pt-20 px-6 pb-24 relative z-10 flex flex-col justify-start items-center" ref={containerRef}>
       
       <div className="w-full max-w-2xl flex justify-between items-start mb-12 header-element relative">
          <Link to="/" className="hidden md:inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-widest mt-2 absolute right-0">
            Back to Home <ArrowRight size={14} />
          </Link>
          <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
       </div>

       {/* Logo Block Restored */}
       <div className="relative mb-20 flex justify-center w-full max-w-lg header-element">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full lg:translate-x-[-120%] pr-4">
             <span className="transform -rotate-90 block origin-right font-mono text-[10px] tracking-[0.2em] text-white/50 whitespace-nowrap">
                2026 PRICING
             </span>
          </div>
          <img src={theme.images?.logo || '/logo.png'} className="w-[200px] md:w-[280px] object-contain filter invert opacity-90 mx-auto" alt="Alter Logo" />
       </div>

       <div className="header-element mb-16 text-center w-full max-w-2xl">
          <p className="text-white/80 font-mono text-xs uppercase tracking-[0.2em] mb-6">{title}</p>
          <div className="flex flex-col gap-2 items-center">
            <p className="text-white/60 font-mono text-[10px] uppercase tracking-[0.1em] leading-relaxed max-w-lg">
              Multi-disciplinary studio made for brands that builds.
            </p>
            <p className="text-white/60 font-mono text-[10px] uppercase tracking-[0.1em] leading-relaxed max-w-lg">
              Premium Branding + Custom Designs &bull; Pre-mades &amp; Softwares for Fashion Designers and Creatives
            </p>
          </div>
       </div>

       <div className="w-full max-w-2xl space-y-4 mb-20 flex-1">
          <div className="flex flex-col border-t border-white/10">
             {services.map((item, i) => <ServiceItem key={i} {...item} />)}
          </div>
       </div>

       <div className="w-full max-w-2xl text-center mt-auto header-element pt-8">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="max-w-[280px] mx-auto py-4 bg-transparent border border-white/20 text-white font-mono text-[10px] rounded-full hover:bg-white hover:text-black transition-colors duration-500 flex items-center justify-center gap-2 tracking-widest uppercase mb-12">
             <Instagram size={14} /> BOOK SERVICES
          </a>
          <p className="font-mono text-[8px] md:text-[10px] text-white/60 uppercase tracking-[0.2em] leading-loose max-w-md mx-auto">
            Includes: 2 rounds of revisions. Additional revisions are available at 20% of the project total per revision.
          </p>
       </div>
       <div className="w-full max-w-2xl"><SiteFooter light={false} /></div>
       {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

const ServiceDetail = () => {
  const { id } = useParams();
  const service = allData.find(s => s.title === decodeURIComponent(id));
  const containerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.header-element', { y: 30, opacity: 0, stagger: 0.1, duration: 1.5, ease: 'power3.out' });
      gsap.from('.feature-item', { x: -20, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, [id]);

  if (!service) return <div className="min-h-screen text-center text-white py-32 font-mono">Service not found.</div>;

  return (
    <div className="min-h-screen pt-20 px-6 pb-24 relative z-10 flex flex-col justify-start items-center w-full" ref={containerRef}>
       
       <div className="w-full max-w-[480px] flex justify-between items-start mb-8 header-element relative">
          <button onClick={() => window.history.back()} className="hidden md:inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-widest mt-2 absolute right-0">
            Back <ArrowRight size={14} />
          </button>
          <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
       </div>

       {/* Logo Block Restored */}
       <div className="relative mb-20 flex justify-center w-full max-w-[480px] header-element">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 md:-translate-x-[110%]">
             <span className="transform -rotate-90 block origin-right font-mono text-[10px] tracking-[0.2em] text-white/50 whitespace-nowrap">
                2026 PRICING
             </span>
          </div>
          <img src={theme.images?.logo || '/logo.png'} className="w-[200px] md:w-[260px] object-contain filter invert opacity-90 mx-auto" alt="Alter Logo" />
       </div>
      
      <div className="header-element mb-16 w-full max-w-[480px] text-left">
        <h1 className="serif-heading text-5xl md:text-6xl text-white mb-2 leading-none">{service.title}</h1>
        <h2 className="serif-heading text-lg md:text-xl text-white/90 font-light mb-8">{service.subtitle}</h2>
        
        {service.layout === 'bullets' && (
          <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-8 mb-4">
            <span className="text-2xl md:text-3xl text-white font-medium">{service.price}</span>
            <span className="text-white/60 text-base md:text-lg font-light">({service.delivery})</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-[480px] flex-1 text-left">
        {service.layout === 'bullets' ? (
          <div className="flex flex-col items-start w-full">
            <ul className="space-y-4 text-sm md:text-base text-white/90 w-full mb-8">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 feature-item">
                  <span className="text-white mt-0.5">•</span>
                  <span className="leading-snug font-light">{feature}</span>
                </li>
              ))}
            </ul>
            {service.details && (
              <p className="text-white/60 font-light text-sm mt-4">{service.details}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start w-full space-y-12">
            {service.options.map((opt, idx) => (
               <div key={idx} className="w-full">
                 <div className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline gap-2 md:gap-4 mb-4">
                    <span className="text-2xl md:text-[28px] text-white font-medium">{opt.price}</span>
                    <span className="text-white/60 text-base font-light">{opt.delivery}</span>
                 </div>
                 <ul className="space-y-2 text-sm md:text-[15px] text-white/90 w-full">
                  {opt.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 feature-item">
                      <span className="text-white mt-0.5">•</span>
                      <span className="leading-snug font-light">{f}</span>
                    </li>
                  ))}
                </ul>
               </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="w-full max-w-[480px] text-center pb-4 pt-24 header-element mt-auto">
         <p className="font-mono text-[8px] md:text-[10px] text-white/60 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto mb-10">
            Includes: 2 rounds of revisions. Additional revisions are available at 20% of the project total per revision.
          </p>
         <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-full py-5 bg-transparent border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-500 font-mono text-[10px] justify-center tracking-widest uppercase flex items-center gap-3">
             <Instagram size={14} /> Book this service
          </a>
      </div>
      <div className="w-full max-w-[480px]"><SiteFooter light={false} /></div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// OTHER PAGES
// ==========================================

const AboutPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-6">
      <Link to="/" className="absolute top-10 right-10 hidden md:inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm font-mono uppercase tracking-widest">
          Back to Home <ArrowRight size={16} />
      </Link>
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>
      <h1 className="heading-font text-6xl md:text-[8rem] text-black mb-8 leading-none mt-20">Who the f*ck is Rare?</h1>
      <p className="max-w-xl text-black/60 font-mono leading-relaxed mb-12">
        Placeholder for brand manifesto, history, or creator biography. <br/><br/>
        More content coming soon.
      </p>
      <div className="w-full max-w-2xl mt-auto"><SiteFooter light={true} /></div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

const GalleryPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-6">
      <Link to="/" className="absolute top-10 right-10 hidden md:inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest">
          Back to Home <ArrowRight size={16} />
      </Link>
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
        <Menu size={24} />
      </button>
      <h1 className="heading-font text-5xl md:text-[6rem] text-white mb-4 leading-none mt-20">Venganza's Art Gallery</h1>
      <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] mb-12">
        Curated by Rare
      </p>

      <div className="max-w-md w-full bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-6">
         <p className="text-white/60 font-mono text-xs uppercase tracking-widest">Enter Password to Access</p>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
           <input type="password" placeholder="PASSWORD" className="w-full flex-1 bg-transparent border border-white/20 rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors text-center uppercase tracking-widest placeholder:text-white/30" />
           <button className="w-full sm:w-auto bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-semibold px-8 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Enter</button>
         </div>
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

const ContactPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-10 px-6 py-20">
      <Link to="/" className="absolute top-10 right-10 hidden md:inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest">
          Back to Home <ArrowRight size={16} />
      </Link>
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
        <Menu size={24} />
      </button>
      
      <div className="max-w-2xl w-full flex flex-col items-center">
         <h1 className="heading-font text-5xl md:text-[6rem] text-white mb-4 leading-none text-center">Contact</h1>
         <p className="text-white/60 font-mono text-sm uppercase tracking-widest text-center mb-12">Schedule a Google Meet</p>
         
         <form className="w-full flex flex-col gap-6 bg-white/5 p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-sm shadow-xl" onSubmit={(e) => { e.preventDefault(); alert("Meeting request sent! (Mock)"); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="font-mono text-xs text-white/60 uppercase tracking-widest ml-2">Name</label>
                 <input type="text" className="bg-transparent border border-white/20 rounded-xl px-4 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors" required />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-mono text-xs text-white/60 uppercase tracking-widest ml-2">Email</label>
                 <input type="email" className="bg-transparent border border-white/20 rounded-xl px-4 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors" required />
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-white/60 uppercase tracking-widest ml-2">Preferred Date & Time</label>
              <input type="datetime-local" className="bg-transparent border border-white/20 rounded-xl px-4 py-3 font-mono text-sm text-white/60 outline-none focus:border-[color:var(--primary)] transition-colors" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-white/60 uppercase tracking-widest ml-2">Project Details</label>
              <textarea rows={4} className="bg-transparent border border-white/20 rounded-xl px-4 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors resize-none" placeholder="Tell us about your brand..." required></textarea>
            </div>

            <button type="submit" className="mt-4 bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-semibold w-full py-4 rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-lg">
              Request Google Meet
            </button>
         </form>
      </div>
      <div className="w-full max-w-2xl mt-12"><SiteFooter light={false} /></div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// ARCHIVE PAGE (LIGHT THEME RESTORED)
// ==========================================

const ArchivePage = () => {
  const [path, setPath] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const FolderIcon = ({ label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-black/5 hover:bg-[color:var(--primary)] text-black/70 hover:text-white border border-black/10 backdrop-blur-lg transition-all group outline-none shadow-sm min-w-[120px]">
      <Folder size={48} className="text-black/40 group-hover:text-white transition-colors stroke-1" fill="currentColor" fillOpacity="0.2" />
      <span className="font-mono text-xs font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );

  const FileIcon = ({ type, label }) => (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-black/5 hover:bg-black/10 border border-black/10 transition-all group cursor-pointer min-w-[120px]">
      {type === 'image' ? (
        <FileImage size={48} className="text-black/40 group-hover:text-black transition-colors stroke-1" />
      ) : (
        <FileVideo size={48} className="text-black/40 group-hover:text-black transition-colors stroke-1" />
      )}
      <span className="font-mono text-xs text-center text-black/60 group-hover:text-black break-all">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen relative z-10 flex flex-col py-12 px-6 lg:px-20 max-w-screen-2xl mx-auto">
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-b border-black/10 pb-10 w-full">
         <div className="flex flex-col items-start gap-8 w-full">
           <div className="flex justify-between items-start w-full">
             <Link to="/" className="heading-font text-5xl md:text-7xl text-black tracking-widest leading-none block hover:opacity-80 transition-opacity">
               Altered Venganza
             </Link>
             <Link to="/" className="hidden md:inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-xs font-mono uppercase tracking-widest mt-2">
                Back to Home <ArrowRight size={14} />
             </Link>
           </div>
           <h2 className="font-mono text-sm text-black/60 uppercase tracking-[0.2em] mt-4">Client Archive</h2>
         </div>
      </div>

      <div className="flex-1 flex flex-col bg-white border border-black/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden mt-4">
        {/* Browser Top Bar */}
        <div className="bg-[#f5f5f5] border-b border-black/10 px-4 py-3 flex items-center gap-4">
          <button 
            onClick={() => setPath(p => p.slice(0, -1))}
            disabled={path.length === 0}
            className="p-1.5 rounded text-black/50 hover:text-black hover:bg-black/10 transition-colors disabled:opacity-20"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2 font-mono text-[10px] text-black/60 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="cursor-pointer hover:text-black transition-colors" onClick={() => setPath([])}>C: \ Archive</span>
            {path.map((segment, idx) => (
              <React.Fragment key={idx}>
                <span className="text-black/30">\</span>
                <span className="cursor-pointer hover:text-black transition-colors" onClick={() => setPath(path.slice(0, idx+1))}>
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
          
          <div className="ml-auto">
             <div className="flex items-center gap-2 text-black/50 cursor-pointer bg-black/5 p-2 rounded-full hover:bg-black/10 transition-colors">
                <User size={18} className="stroke-1" />
             </div>
          </div>
        </div>

        {/* Content Explorer */}
        <div className="flex-1 p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 content-start auto-rows-min bg-white">
          
          {path.length === 0 && years.map(y => (
            <FolderIcon key={y} label={y} onClick={() => setPath([y])} />
          ))}

          {path.length === 1 && months.map(m => (
            <FolderIcon key={m} label={m} onClick={() => setPath([...path, m])} />
          ))}

          {path.length === 2 && (
            <>
              <FileIcon type="image" label={`${path[1]}_Look_1.jpg`} />
              <FileIcon type="image" label={`${path[1]}_Look_2.jpg`} />
              <FileIcon type="video" label={`Campaign_${path[0]}.mp4`} />
              <FolderIcon label="Drafts" onClick={() => setPath([...path, 'Drafts'])} />
            </>
          )}

          {path.length > 2 && (
             <div className="col-span-full py-20 text-center font-mono text-black/30 text-xs">
                -- Directory is empty --
             </div>
          )}

        </div>
      </div>
      
      <div className="mt-8 w-full">
        <SiteFooter light={true} />
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

// ==========================================
// PREMADE MODAL (QUICK VIEW)
// ==========================================

const PremadeModal = ({ premade, onClose, onAddToCart }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      gsap.from(contentRef.current, { scale: 0.95, opacity: 0, duration: 0.4, delay: 0.1, ease: 'power3.out' });
    });
    return () => { document.body.style.overflow = ''; ctx.revert(); };
  }, []);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={contentRef} className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-white transition-all">
          <X size={18} />
        </button>

        <div className="aspect-square overflow-hidden rounded-t-2xl bg-neutral-100">
          <img src={premade.imageUrl} alt={`Premade #${premade.number}`} className="w-full h-full object-cover" />
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm tracking-widest uppercase text-black/50">Premade #{premade.number}</h2>
            {premade.type === 'legacy' ? (
              <span className="flex items-center gap-2">
                <span className="text-lg text-black/30 line-through">${PREMADE_PRICE_BASIC}</span>
                <span className="text-2xl font-semibold text-[color:var(--primary)]">${premade.price}</span>
              </span>
            ) : (
              <span className="text-2xl font-semibold text-black">${premade.price}</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onAddToCart(premade); onClose(); }}
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-[color:var(--primary)] transition-colors"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 bg-white text-black px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg border border-black/10 hover:border-black/30 hover:shadow-md transition-all">
              <MessageCircle size={16} />
              Ask via Instagram DM
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CART SIDEBAR
// ==========================================

const CartSidebar = ({ cart, onRemove, onClose }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      gsap.from(panelRef.current, { x: '100%', duration: 0.4, ease: 'power3.out' });
    });
    return () => { document.body.style.overflow = ''; ctx.revert(); };
  }, []);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const dmNumbers = cart.map(item => `#${item.number}`).join(', ');

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            number: item.number,
            price: item.price,
            type: item.type,
            imageUrl: item.imageUrl,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Checkout failed. Please try again or DM us on Instagram.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed. Please try again or DM us on Instagram.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm">
      <div ref={panelRef} className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <h2 className="heading-font text-2xl tracking-widest text-black">Cart</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 && (
            <p className="font-mono text-xs text-black/30 uppercase tracking-widest text-center py-12">Your cart is empty</p>
          )}
          {cart.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 group hover:border-black/10 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                <img src={item.imageUrl} alt={`Premade #${item.number}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">Premade #{item.number}</p>
                <p className="text-sm font-semibold text-black">${item.price}</p>
              </div>
              <button onClick={() => onRemove(idx)} className="w-8 h-8 rounded-full flex items-center justify-center text-black/30 hover:text-[color:var(--primary)] hover:bg-black/5 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-black/50">Total</span>
              <span className="text-xl font-semibold text-black">${total}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-[color:var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              <ExternalLink size={16} />
              {checkoutLoading ? 'Processing...' : `Checkout — $${total}`}
            </button>
            <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer"
               className="w-full flex items-center justify-center gap-2 bg-white text-black px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg border border-black/10 hover:border-black/30 transition-all">
              <MessageCircle size={16} />
              Confirm via DM
            </a>
            <p className="text-center font-mono text-[10px] text-black/30 uppercase tracking-wider">
              DM us: "I'd like premades {dmNumbers}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// INSTAGRAM PREMADES HOOK
// ==========================================

const useInstagramPremades = () => {
  const [premades, setPremades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPremades = async () => {
      try {
        // Use serverless function as proxy (token stays server-side)
        const res = await fetch('/api/instagram-feed');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${res.status}`);
        }
        const { data: filtered } = await res.json();

        const total = filtered.length;

        const mapped = filtered.map((post, idx) => {
            const caption = post.caption || '';
            const captionLower = caption.toLowerCase();

            // Inverted numbering: first (newest) post = highest number, last (oldest) = #001
            const number = String(total - idx).padStart(3, '0');

            // Detect SOLD status
            const isSold = captionLower.includes('sold out') || captionLower.includes('🩹sold') || /\bsold\b/.test(captionLower);

            // Detect type: look for P or B near #premade in caption
            // Matches: "#premade p", "#premade P", "p #premade", "P#premade", "#premade  p", etc.
            const isPremium = /\bp\s*#premade|#premade\s*p\b/i.test(caption);

            // Legacy discount: posts from Feb 5 2024 and older → €90
            const postDate = new Date(post.timestamp);
            const cutoffDate = new Date('2024-02-05');
            const isLegacy = postDate <= cutoffDate;

            const type = isLegacy ? 'legacy' : (isPremium ? 'premium' : 'basic');
            const price = isLegacy ? 90 : (isPremium ? PREMADE_PRICE_PREMIUM : PREMADE_PRICE_BASIC);

            // Extract name from first line of caption (before hashtags)
            const firstLine = caption.split('\n')[0].replace(/#\w+/g, '').trim();
            const name = firstLine.length > 3 ? firstLine : `Premade #${number}`;

            return {
              id: post.id,
              number,
              title: name,
              imageUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
              instagramUrl: post.permalink,
              price,
              available: !isSold,
              type,
              timestamp: post.timestamp,
            };
          });

        setPremades(mapped);
      } catch (err) {
        console.error('Failed to fetch Instagram premades:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPremades();
  }, []);

  return { premades, loading, error };
};

// ==========================================
// PREMADES GALLERY PAGE
// ==========================================

const PremadesPage = () => {
  const { premades, loading, error } = useInstagramPremades();
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const addToCart = (premade) => {
    if (!cart.find(item => item.id === premade.id)) {
      setCart(prev => [...prev, premade]);
    }
  };
  const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.from('.premade-header', { y: 30, opacity: 0, stagger: 0.1, duration: 1.5, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animate premade items when they load from Instagram
  useEffect(() => {
    if (loading || premades.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from('.premade-item', { y: 40, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, premades]);

  return (
    <div ref={containerRef} className="min-h-screen p-6 md:p-12 flex flex-col relative z-10">

      {/* Mobile burger — fixed top right */}
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>

      {/* TOP — Same layout as Home */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full relative z-20">
        <div className="premade-header max-w-3xl">
          <Link to="/" className="heading-font text-6xl md:text-[7rem] leading-none text-black tracking-widest mb-6 block hover:opacity-80 transition-opacity">
            Altered Venganza
          </Link>
          <div className="space-y-1 mb-8 max-w-2xl">
            <p className="text-black/70 font-mono text-xs md:text-sm uppercase tracking-[0.1em] leading-relaxed">
              Pre-made clothing renders &bull; Production ready files
            </p>
            <p className="text-black/70 font-mono text-xs md:text-sm uppercase tracking-[0.1em] leading-relaxed pt-1">
              Fully alterable &amp; customizable to your brand &bull; Numbered &amp; Ready to purchase
            </p>
          </div>
          <p className="text-black/60 font-mono text-xs uppercase tracking-[0.1em] flex flex-wrap items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse shadow-[0_0_8px_rgba(123,31,36,0.6)]"></span>
            {loading ? '...' : `${premades.filter(p => p.available).length} Pieces Available`}
          </p>
        </div>

        <div className="premade-header flex flex-col items-start md:items-end gap-3 mt-8 md:mt-0 text-left md:text-right">
          <Link to="/" className="hidden md:flex group text-black/60 hover:text-black transition-colors uppercase tracking-[0.2em] font-mono text-xs items-center gap-3">
            <span>Back to Home</span>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:-translate-x-2" />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="group text-[color:var(--primary)] hover:text-black transition-colors uppercase tracking-[0.2em] font-mono text-xs flex items-center gap-3"
          >
            <span className="md:order-1">Cart ({cart.length})</span>
            <ShoppingBag size={14} className="md:order-2" />
          </button>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="flex-1 w-full mt-16 md:mt-12 relative z-10">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4 md:gap-6">
          {premades.map((premade) => (
            <div key={premade.id} className="premade-item">
              <button
                onClick={() => premade.available && setSelected(premade)}
                className={`group text-left w-full bg-white/0 overflow-hidden transition-all duration-500 focus:outline-none ${!premade.available ? 'cursor-default' : ''}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black/5 border border-black/10 rounded-none sm:rounded-xl hover:border-[color:var(--primary)] transition-colors duration-500">
                  <img src={premade.imageUrl} alt={`Premade #${premade.number}`} loading="lazy" className={`w-full h-full object-cover transition-transform duration-700 ${premade.available ? 'group-hover:scale-105' : 'grayscale-[30%]'}`} />

                  {/* Type badge: P = premium, B = basic, ARCHIVE = legacy */}
                  {premade.type === 'legacy' ? (
                    <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-mono text-[6px] sm:text-[8px] font-bold tracking-widest z-10 bg-black/70 text-white/90 backdrop-blur-sm uppercase">
                      Archive
                    </span>
                  ) : (
                    <span className={`absolute top-1.5 left-1.5 sm:top-3 sm:left-3 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-[8px] sm:text-[10px] font-bold tracking-wider z-10 ${premade.type === 'premium' ? 'bg-[color:var(--primary)] text-white shadow-[0_0_10px_rgba(123,31,36,0.4)]' : 'bg-white/80 text-black/60 backdrop-blur-sm border border-black/10'}`}>
                      {premade.type === 'premium' ? 'P' : 'B'}
                    </span>
                  )}

                  {/* SOLD overlay */}
                  {!premade.available ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(123,31,36,0.75)]">
                      <span className="font-mono text-sm text-white font-bold tracking-[0.3em] uppercase">Sold</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-widest uppercase">View</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 sm:mt-3 flex items-center justify-between px-0.5 sm:px-1">
                  <span className={`font-mono text-[7px] sm:text-[10px] tracking-widest uppercase ${premade.available ? 'text-black/40' : 'text-black/25 line-through'}`}>#{premade.number}</span>
                  {premade.type === 'legacy' ? (
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <span className="font-mono text-[7px] sm:text-[10px] text-black/30 line-through">${PREMADE_PRICE_BASIC}</span>
                      <span className="font-mono text-[9px] sm:text-xs font-semibold text-[color:var(--primary)]">${premade.price}</span>
                    </span>
                  ) : (
                    <span className={`font-mono text-[9px] sm:text-xs font-semibold ${premade.available ? 'text-black' : 'text-black/25'}`}>${premade.price}</span>
                  )}
                </div>
              </button>
              {premade.available ? (
                <button
                  onClick={() => addToCart(premade)}
                  disabled={cart.find(item => item.id === premade.id)}
                  className="hidden sm:flex mt-2 w-full py-2 text-[10px] font-mono uppercase tracking-widest border border-black/10 rounded-lg text-black/50 hover:text-white hover:bg-black hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black/50 disabled:hover:border-black/10 items-center justify-center gap-1.5"
                >
                  {cart.find(item => item.id === premade.id) ? 'In Cart' : <><Plus size={12} /> Add to Cart</>}
                </button>
              ) : (
                <span className="hidden sm:flex mt-2 w-full py-2 text-[10px] font-mono uppercase tracking-widest text-black/20 items-center justify-center">Sold</span>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-24">
            <p className="font-mono text-black/30 text-xs uppercase tracking-widest animate-pulse">Loading premades from Instagram...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <p className="font-mono text-black/30 text-xs uppercase tracking-widest">Could not load premades. {error}</p>
          </div>
        )}

        {!loading && !error && premades.length === 0 && (
          <div className="text-center py-24">
            <p className="font-mono text-black/30 text-xs uppercase tracking-widest">No premades available yet. Check back soon.</p>
          </div>
        )}
      </div>

      {/* BOTTOM */}
      <div className="w-full relative z-20 mt-20">
        {cart.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setCartOpen(true)}
              className="group text-[color:var(--btn-tx)] hover:text-white transition-colors uppercase tracking-[0.2em] font-mono text-[10px] sm:text-xs flex items-center gap-2 border border-[color:var(--primary)] bg-[color:var(--primary)] px-6 py-3 rounded-full hover:bg-black hover:border-black"
            >
              <ShoppingBag size={14} />
              View Cart ({cart.length}) — ${cart.reduce((s, i) => s + i.price, 0)}
            </button>
          </div>
        )}
        <SiteFooter light={true} />
      </div>

      {/* Modal */}
      {selected && <PremadeModal premade={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} />}
      {/* Cart Sidebar */}
      {cartOpen && <CartSidebar cart={cart} onRemove={removeFromCart} onClose={() => setCartOpen(false)} />}
      {/* Mobile Menu */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// ADMIN IMPORTS
// ==========================================
import { AuthProvider, useAuth } from './admin/lib/auth';
import { EditorProvider } from './admin/lib/editor-context';
import { ToastProvider } from './admin/lib/toast';
import AdminLayout from './admin/components/AdminLayout';
import EditorToolbar from './admin/components/EditorToolbar';
import Dashboard from './admin/pages/Dashboard';
import PremadesList from './admin/pages/PremadesList';
import PremadeEdit from './admin/pages/PremadeEdit';
import MediaLibrary from './admin/pages/MediaLibrary';
import AdminSettings from './admin/pages/AdminSettings';
import ThemeEditor from './admin/pages/ThemeEditor';

const AdminGuard = () => {
  const { user, loading, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    const handleLogin = (e) => {
      e.preventDefault();
      const ok = login(password);
      if (!ok) {
        setError('Wrong password');
        setPassword('');
      }
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-font text-4xl tracking-widest text-white mb-4">Admin</h1>
          <Link to="/" className="font-mono text-xs text-white/40 uppercase tracking-widest mb-8 block hover:text-white/60 transition-colors">Altered Venganza</Link>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 items-center">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white text-center placeholder:text-white/20 outline-none focus:border-white/20 transition-colors w-64"
              autoFocus
            />
            {error && <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest">{error}</p>}
            <button
              type="submit"
              className="bg-white text-black px-8 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EditorProvider>
          <ToastProvider>
            <ThemeController />
            <AnimatedBackground />
            <EditorToolbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/vag" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/premades" element={<PremadesPage />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/brand-identity" element={<ServicePage title="Brand Identity Service" services={brandIdentityData} />} />
              <Route path="/designs" element={<ServicePage title="Clothing Design Service" services={designsData} />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminGuard />}>
                <Route index element={<Dashboard />} />
                <Route path="theme" element={<ThemeEditor />} />
                <Route path="premades" element={<PremadesList />} />
                <Route path="premades/new" element={<PremadeEdit />} />
                <Route path="premades/edit/:filename" element={<PremadeEdit />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </ToastProvider>
        </EditorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
