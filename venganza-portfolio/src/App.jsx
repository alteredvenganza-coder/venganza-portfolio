import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Instagram, ArrowLeft, ArrowRight, Folder, FileImage, FileVideo, User, X, ExternalLink, MessageCircle, ShoppingBag, Plus, Minus, Trash2, ChevronDown, Menu } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INSTAGRAM_DM_URL, INSTAGRAM_HANDLE, PREMADE_PRICE_PREMIUM, PREMADE_PRICE_BASIC } from './config';
import { useTheme } from './hooks/useTheme';
import { useSiteSettings } from './hooks/useSiteSettings';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// GLOBAL CART CONTEXT
// ==========================================

const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (item) => {
    setCart(prev => {
      const dup = item.kind === 'premade'
        ? prev.some(i => i.kind === 'premade' && i.id === item.id)
        : prev.some(i => i.kind === 'service' && i.title === item.title && i.tier === item.tier);
      return dup ? prev : [...prev, item];
    });
  };
  const removeFromCart = (idx) => setCart(p => p.filter((_, i) => i !== idx));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

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
    linkTo: "/premades",
    subtitle: "Ready-to-buy clothing graphics",
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
    title: "Tailored Design",
    subtitle: "Based on your references",
    price: "EUR €190 – €350",
    delivery: "3 to 7 days",
    layout: "options",
    options: [
      {
        price: "Basic — €190",
        delivery: "(3-4 days)",
        features: [
          "1 custom graphic based on your references",
          "Personal or commercial use",
          "PNG/JPG/PDF",
          "Free mockup",
          "High resolution 300 ppi",
          "1 revision round"
        ]
      },
      {
        price: "Premium — €350",
        delivery: "(5-7 days)",
        features: [
          "Up to 3 custom graphics based on your references",
          "Personal or commercial use",
          "PNG/JPG/PSD/PDF",
          "Free mockup",
          "High resolution 300 ppi",
          "Size Chart if required",
          "Factory contact based in Portugal with MOQ of 50 pcs",
          "2 revision rounds"
        ]
      }
    ]
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
    layout: "options",
    options: [
      {
        price: "One Page — €70",
        delivery: "(1 day delivery)",
        features: ["Flat technical drawing (front / back)", "Fabric & color specifications", "Print / embroidery placement", "Essential construction notes"],
        details: "Simplified production guide for basic garments."
      },
      {
        price: "Full Techpack — €170",
        delivery: "(1-2 days delivery)",
        features: ["Complete measurement chart", "Stitching & construction details", "Fabric & color specifications", "Print / embroidery placement", "Packaging notes"],
        details: "Complete specification sheet ready for factory production."
      }
    ]
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
  const decoded = decodeURIComponent(path);
  const isLightMode = path === '/' || path === '/archive';
  const isTailored = decoded.includes('Tailored');

  return (
    <div ref={bgRef} className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
      {!isLightMode && !isTailored && (
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
      {(!isLightMode || isTailored) ? (
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
    document.body.classList.remove('theme-red', 'theme-light', 'theme-dark', 'theme-tailored');
    const path = location.pathname;
    const decoded = decodeURIComponent(path);

    if (path === '/mat-renders') {
      document.body.classList.add('theme-dark');
    } else if (path === '/' || path === '/archive' || path === '/about' || path === '/premades' || path === '/materializing-ideas') {
      document.body.classList.add('theme-light');
    } else if (decoded.includes('Tailored') || path === '/designs' || decoded.includes('E-commerce') || decoded.includes('Techpack')) {
      document.body.classList.add('theme-tailored');
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
        <Link to="/materializing-ideas" className={`font-mono text-[8px] md:text-[9px] text-[color:var(--primary)] ${hoverColor} uppercase tracking-[0.15em] transition-colors`}>
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

// Returns first N premade images for the hero slideshow
const useHeroSlides = (count = 5) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/instagram-feed');
        if (!res.ok) throw new Error('API error');
        const { data } = await res.json();
        setSlides(
          (data || []).slice(0, count).map(p => ({
            imageUrl: p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url,
            permalink: p.permalink,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch hero slides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [count]);

  return { slides, loading };
};

// Returns the latest Instagram reel/video
const useLatestReel = () => {
  const [reel, setReel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/instagram-reel');
        if (!res.ok) throw new Error('API error');
        const { reel: r } = await res.json();
        setReel(r || null);
      } catch (err) {
        console.error('Failed to fetch latest reel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return { reel, loading };
};

// Keep for backwards compat
const useLatestPremade = () => {
  const { slides, loading } = useHeroSlides(1);
  return { latest: slides[0] || null, loading };
};

const Home = () => {
  const containerRef = useRef();
  const { slides, loading: slidesLoading } = useHeroSlides(6);
  const theme = useTheme();
  const { settings: site } = useSiteSettings();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      gsap.from('.nav-item', { y: -20, opacity: 0, stagger: 0.05, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hero-line', { y: 36, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'power3.out', delay: 0.2 });
      gsap.from('.hero-sub', { y: 18, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.7 });
      gsap.from('.hero-cta', { y: 18, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
      gsap.from('.hero-image', { x: 40, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 0.4 });
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { y: 32, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const strategicServices = [
    { num: '01', title: 'Brand System', desc: 'Complete identity for clothing brands — strategy, logo system, visual language, label set.', price: '€3,500 – €5,500', delivery: '3–4 weeks', linkTo: '/brand-identity' },
    { num: '02', title: 'Drop Starter', desc: 'For first-drop founders. Logo, palette, typography, social templates, print graphics.', price: '€900 – €1,800', delivery: '1–2 weeks', linkTo: '/brand-identity' },
    { num: '03', title: 'Packaging Design', desc: 'Print-ready packaging built on top of an existing identity. Master and variant systems.', price: '€900 – €2,000', delivery: 'On request', linkTo: '/brand-identity' },
    { num: '04', title: 'Retainer', desc: 'Ongoing creative continuity for brands that ship — graphics, social, ads, email.', price: '€600 – €2,500 / mo', delivery: 'Monthly', linkTo: '/brand-identity' },
    { num: '05', title: 'Custom Apparel', desc: 'Tailored clothing graphics & techpacks built from your references and direction.', price: '€190 – €5,500', delivery: '3 days – 4 weeks', linkTo: '/designs' },
  ];

  const quickServices = [
    { title: 'Premade Design', desc: 'Ready-to-buy clothing graphics. PSD/PNG, free mockup, factory contact.', price: '€150 – €250', delivery: '4h – 1 day', linkTo: '/premades' },
    { title: 'Tech Pack', desc: 'Production-ready spec sheet — flat drawings, fabric specs, construction.', price: '€70 – €170', delivery: '1–2 days', linkTo: '/service/Techpack' },
    { title: 'E-commerce Renders', desc: 'Studio-lit product renders for product pages and feed.', price: '€45 – €140', delivery: '4h – 1 day', linkTo: `/service/${encodeURIComponent('E-commerce Visual Asset')}` },
  ];

  const cases = [
    {
      type: 'Primary case study',
      title: 'MAALI',
      subtitle: 'Logo system · brand identity · apparel',
      brief: 'A clothing label searching for an identity that could survive across drops without losing tension.',
      approach: 'We built a modular logo system, an edited type voice, and a label set engineered for production — scaling from neckline tags to full campaign keyvisuals.',
      result: 'A repeatable identity the brand can drop on for years without rebuilding.',
      tags: ['Identity', 'Apparel', 'Production'],
      year: '2025',
    },
    {
      type: 'Secondary case study',
      title: '[04]-STUDIOS',
      subtitle: 'Logo · visual direction',
      brief: 'A creative studio needing a confident logo and a quiet visual system to anchor it.',
      approach: 'A typographic mark, a restrained palette, and motion-friendly visuals built to live across web, social and print.',
      result: 'A direction the founder can defend in any room — minimal, deliberate, theirs.',
      tags: ['Logo', 'Direction'],
      year: '2025',
    },
  ];

  const apps = [
    { name: 'MAT Renders', tag: 'AI Fashion Rendering', desc: 'Production-ready clothing renders generated from references. Built to replace photoshoot dependency for emerging brands.', status: 'In private beta', to: '/mat-renders' },
    { name: 'Showp Folio', tag: 'Portfolio + Storefront', desc: 'Portfolio SaaS for creators — one link that holds the work, the shop and the contact, fully synced.', status: 'Coming 2026', to: '/materializing-ideas' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative z-10" ref={containerRef}>

      {/* ============ TOP NAV ============ */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-md border-b border-black/5' : ''}`}>
        <div className="flex items-center justify-between px-6 md:px-10 py-4 md:py-5">
          <Link to="/" className="nav-item heading-font tracking-widest text-black text-xl md:text-2xl hover:opacity-70 transition-opacity">
            Altered Venganza
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <div className="relative pb-2 -mb-2" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button onClick={() => setServicesOpen(o => !o)} className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
                Services <ChevronDown size={12} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 bg-white border border-black/10 rounded-lg shadow-xl py-2 min-w-[200px] z-50">
                  <Link to="/brand-identity" onClick={() => setServicesOpen(false)} className="block px-5 py-2.5 font-mono text-[10px] text-black/70 hover:text-black hover:bg-black/5 uppercase tracking-[0.2em] transition-colors">Brand Identity</Link>
                  <Link to="/designs" onClick={() => setServicesOpen(false)} className="block px-5 py-2.5 font-mono text-[10px] text-black/70 hover:text-black hover:bg-black/5 uppercase tracking-[0.2em] transition-colors">Clothing Designs</Link>
                </div>
              )}
            </div>
            <a href="#work" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.2em] transition-colors">Work</a>
            <Link to="/premades" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.2em] transition-colors">Premades</Link>
            <a href="#apps" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.2em] transition-colors">Apps</a>
            <Link to="/about" className="nav-item font-mono text-[11px] text-[color:var(--primary)] hover:text-black uppercase tracking-[0.2em] transition-colors">Studio</Link>
            <Link to="/contact" className="nav-item font-mono text-[11px] text-black/70 hover:text-black uppercase tracking-[0.2em] transition-colors">Contact</Link>
          </nav>
          <button onClick={() => setMenuOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-32 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 w-full max-w-7xl mx-auto items-center">

          {/* Left — Content */}
          <div className="md:col-span-7">
            <p className="hero-eyebrow font-mono text-[10px] md:text-[11px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-8">
              Italian Creative Studio · Trieste
            </p>

            <h1 className="hero-line heading-font text-black leading-[0.85] text-[4rem] sm:text-[5.5rem] md:text-[6.5rem] lg:text-[8.5rem] xl:text-[10rem] tracking-[0.01em] mb-6">
              <span className="block">Altered</span>
              <span className="block">Venganza</span>
            </h1>

            <p className="hero-line serif-heading italic text-black/75 text-[1.3rem] md:text-[1.7rem] lg:text-[2rem] leading-tight mb-10 max-w-xl">
              We build brands worth defending.
            </p>

            <p className="hero-sub max-w-xl text-black/65 text-base md:text-lg leading-relaxed font-light mb-12">
              A small Italian studio shaping identity systems, apparel and tools for emerging brands. Strategic, editorial, made to outlast a single drop.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-mono text-[11px] uppercase tracking-[0.25em] rounded-full hover:bg-black hover:text-white transition-colors">
                Schedule a Consultation
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#services" className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-black/15 text-black/80 hover:text-black hover:border-black/40 font-mono text-[11px] uppercase tracking-[0.25em] rounded-full transition-colors">
                See What We Do
              </a>
            </div>
          </div>

          {/* Right — Image */}
          <div className="md:col-span-5 hero-image">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-black/10 bg-gradient-to-br from-black/[0.05] to-black/[0.01]">
              {site?.hero_image ? (
                <img src={site.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : theme.images?.heroRight ? (
                <img src={theme.images.heroRight} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Studio · 2026</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Trieste · IT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-black/30">
          <span className="font-mono text-[9px] uppercase tracking-[0.4em]">Scroll</span>
          <span className="w-px h-10 bg-gradient-to-b from-black/30 to-transparent" />
        </div>
      </section>

      {/* ============ STRATEGIC SERVICES ============ */}
      <section id="services" className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal flex items-baseline justify-between flex-wrap gap-6 mb-16">
            <div>
              <p className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-3">01 — Strategic Engagements</p>
              <h2 className="serif-heading text-black text-4xl md:text-6xl leading-tight">What we build</h2>
            </div>
            <p className="font-mono text-[10px] text-black/40 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
              Built for brands that intend to ship more than once.
            </p>
          </div>

          <div className="reveal divide-y divide-black/5 border-t border-black/5">
            {strategicServices.map((s) => (
              <Link key={s.num} to={s.linkTo} className="group grid grid-cols-12 gap-4 md:gap-8 py-8 md:py-10 items-baseline hover:bg-black/[0.02] transition-colors px-2 -mx-2">
                <div className="col-span-2 md:col-span-1 font-mono text-[11px] text-black/30 uppercase tracking-widest pt-2">{s.num}</div>
                <div className="col-span-10 md:col-span-5">
                  <h3 className="serif-heading text-2xl md:text-3xl text-black group-hover:text-[color:var(--primary)] transition-colors">{s.title}</h3>
                </div>
                <div className="col-span-12 md:col-span-4 text-black/60 text-sm md:text-[15px] leading-relaxed font-light">{s.desc}</div>
                <div className="col-span-12 md:col-span-2 md:text-right">
                  <div className="font-mono text-[11px] text-[color:var(--primary)] uppercase tracking-[0.2em]">{s.price}</div>
                  <div className="font-mono text-[9px] text-black/40 uppercase tracking-[0.2em] mt-1">{s.delivery}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASE STUDIES ============ */}
      <section id="work" className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-20">
            <p className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-3">02 — Selected Work</p>
            <h2 className="serif-heading text-black text-4xl md:text-6xl leading-tight">Case studies</h2>
          </div>

          {/* MAALI — primary */}
          <div className="reveal grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24">
            <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1">
              <p className="font-mono text-[10px] text-black/40 uppercase tracking-[0.3em] mb-4">{cases[0].type}</p>
              <h3 className="serif-heading text-black text-5xl md:text-6xl mb-3">{cases[0].title}</h3>
              <p className="font-mono text-[11px] text-[color:var(--primary)] uppercase tracking-[0.25em] mb-8">{cases[0].subtitle}</p>
              <div className="space-y-5 text-black/70 text-[15px] leading-relaxed font-light">
                <div><span className="font-mono text-[10px] text-black/40 uppercase tracking-[0.25em] block mb-1">Brief</span>{cases[0].brief}</div>
                <div><span className="font-mono text-[10px] text-black/40 uppercase tracking-[0.25em] block mb-1">Approach</span>{cases[0].approach}</div>
                <div><span className="font-mono text-[10px] text-black/40 uppercase tracking-[0.25em] block mb-1">Result</span>{cases[0].result}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-8">
                {cases[0].tags.map(t => <span key={t} className="font-mono text-[9px] text-black/55 uppercase tracking-[0.2em] px-3 py-1.5 border border-black/10 rounded-full">{t}</span>)}
              </div>
            </div>
            <div className="md:col-span-7 order-1 md:order-2 aspect-[4/5] bg-gradient-to-br from-black/[0.04] to-black/[0.01] border border-black/10 rounded-sm overflow-hidden relative">
              {site?.case_study_maali_image ? (
                <img src={site.case_study_maali_image} alt="MAALI" className="absolute inset-0 w-full h-full object-cover" />
              ) : !slidesLoading && slides[0]?.imageUrl ? (
                <img src={slides[0].imageUrl} alt="MAALI" className="absolute inset-0 w-full h-full object-cover" />
              ) : theme.images?.matRender1 ? (
                <img src={theme.images.matRender1} alt="MAALI" className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <span className="serif-heading text-white text-2xl md:text-3xl italic">MAALI</span>
                <span className="font-mono text-[9px] text-white/70 uppercase tracking-[0.25em]">{cases[0].year}</span>
              </div>
            </div>
          </div>

          {/* [04]-STUDIOS — secondary */}
          <div className="reveal grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5 order-1 aspect-square bg-gradient-to-br from-black/[0.04] to-black/[0.01] border border-black/10 rounded-sm overflow-hidden relative flex items-center justify-center">
              {site?.case_study_04_image ? (
                <img src={site.case_study_04_image} alt="04 Studios" className="absolute inset-0 w-full h-full object-cover opacity-70" />
              ) : theme.images?.matRender3 ? (
                <img src={theme.images.matRender3} alt="04 Studios" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              ) : null}
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative z-10 text-center">
                <span className="serif-heading text-white text-6xl md:text-7xl italic">[04]</span>
                <p className="font-mono text-[10px] text-white/70 uppercase tracking-[0.3em] mt-2">STUDIOS</p>
              </div>
            </div>
            <div className="md:col-span-7 order-2 flex flex-col justify-center">
              <p className="font-mono text-[10px] text-black/40 uppercase tracking-[0.3em] mb-4">{cases[1].type}</p>
              <h3 className="serif-heading text-black text-4xl md:text-5xl mb-3">{cases[1].title}</h3>
              <p className="font-mono text-[11px] text-[color:var(--primary)] uppercase tracking-[0.25em] mb-6">{cases[1].subtitle}</p>
              <p className="text-black/70 text-[15px] leading-relaxed font-light max-w-lg mb-3">{cases[1].brief}</p>
              <p className="text-black/70 text-[15px] leading-relaxed font-light max-w-lg">{cases[1].approach}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {cases[1].tags.map(t => <span key={t} className="font-mono text-[9px] text-black/55 uppercase tracking-[0.2em] px-3 py-1.5 border border-black/10 rounded-full">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PREMADES / QUICK ============ */}
      <section id="premades" className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-16 max-w-3xl">
            <p className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-3">03 — Quick Services</p>
            <Link to="/premades" className="group inline-flex items-baseline gap-4">
              <h2 className="serif-heading text-black text-4xl md:text-6xl leading-tight group-hover:text-[color:var(--primary)] transition-colors">Premades & deliverables</h2>
              <ArrowRight size={28} className="text-black/30 group-hover:text-[color:var(--primary)] group-hover:translate-x-2 transition-all" />
            </Link>
            <p className="text-black/60 text-base md:text-lg mt-6 font-light leading-relaxed">
              For founders who need speed — files, renders and packs that move from inbox to factory in days, not weeks.
            </p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickServices.map((p) => (
              <Link key={p.title} to={p.linkTo} className="group flex flex-col p-6 md:p-8 bg-black/[0.02] border border-black/10 hover:border-[color:var(--primary)] rounded-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[9px] text-black/40 uppercase tracking-[0.25em]">{p.delivery}</span>
                  <span className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.2em]">{p.price}</span>
                </div>
                <h3 className="serif-heading text-black text-2xl md:text-3xl mb-3 group-hover:text-[color:var(--primary)] transition-colors">{p.title}</h3>
                <p className="text-black/55 text-sm leading-relaxed font-light flex-1">{p.desc}</p>
                <div className="mt-6 flex items-center gap-2 font-mono text-[10px] text-black/45 group-hover:text-[color:var(--primary)] uppercase tracking-[0.25em] transition-colors">
                  Open <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal mt-12 flex justify-center">
            <Link to="/premades" className="group inline-flex items-center gap-3 px-8 py-4 border border-black/15 text-black/80 hover:text-black hover:border-black/40 font-mono text-[11px] uppercase tracking-[0.25em] rounded-full transition-colors">
              Browse all premades
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ APPS / PRODUCTS ============ */}
      <section id="apps" className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-16 max-w-3xl">
            <p className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-3">04 — Tools we're shipping</p>
            <h2 className="serif-heading text-black text-4xl md:text-6xl leading-tight">Software for creators</h2>
            <p className="text-black/60 text-base md:text-lg mt-6 font-light leading-relaxed">
              Two products spinning out of the studio — built to fix problems we kept hitting in client work.
            </p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {apps.map((a) => (
              <Link key={a.name} to={a.to} className="group relative aspect-[5/6] md:aspect-[4/5] flex flex-col justify-between p-8 md:p-10 bg-gradient-to-br from-black/[0.04] to-black/[0.01] border border-black/10 hover:border-[color:var(--primary)] rounded-sm overflow-hidden transition-colors">
                <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(123,31,36,0.10), transparent 60%)' }} />
                <div className="relative z-10">
                  <p className="font-mono text-[9px] text-[color:var(--primary)] uppercase tracking-[0.3em] mb-4">{a.tag}</p>
                  <h3 className="serif-heading text-black text-4xl md:text-5xl">{a.name}</h3>
                </div>
                <div className="relative z-10">
                  <p className="text-black/65 text-sm md:text-base leading-relaxed font-light max-w-md mb-6">{a.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-black/45 uppercase tracking-[0.3em]">{a.status}</span>
                    <span className="flex items-center gap-2 font-mono text-[10px] text-black/60 group-hover:text-[color:var(--primary)] uppercase tracking-[0.25em] transition-colors">
                      Learn more <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-black/5">
        <div className="reveal max-w-4xl mx-auto text-center">
          <p className="font-mono text-[10px] text-[color:var(--primary)] uppercase tracking-[0.4em] mb-6">Let's build it</p>
          <h2 className="serif-heading text-black text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-10">
            If your brand is going to <span className="italic text-black/75">last,</span><br />it deserves a real foundation.
          </h2>
          <p className="text-black/60 text-base md:text-lg max-w-xl mx-auto mb-12 font-light leading-relaxed">
            Tell us where you are. We'll tell you honestly what makes sense — premade, custom, or somewhere between.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-mono text-[11px] uppercase tracking-[0.25em] rounded-full hover:bg-black hover:text-white transition-colors">
              Schedule a Consultation
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-black/15 text-black/80 hover:text-black hover:border-black/40 font-mono text-[11px] uppercase tracking-[0.25em] rounded-full transition-colors">
              <Instagram size={14} /> @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <div className="px-6 md:px-10">
        <SiteFooter light={true} />
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// SERVICE PAGES (DARK THEMES & EDITORIAL LAYOUT)
// ==========================================

const ServiceItem = ({ title, subtitle, price, delivery, linkTo }) => {
  return (
    <Link
      to={linkTo || `/service/${encodeURIComponent(title)}`}
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
  const location = useLocation();
  const _p = decodeURIComponent(location.pathname);
  const isTailored = _p.includes('Tailored') || location.pathname === '/designs' || _p.includes('E-commerce') || _p.includes('Techpack');

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

       {/* Fixed header: logo/brand left, nav/burger right */}
       <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-10 py-4 bg-[color:var(--bg-color)]/80 backdrop-blur-sm">
         <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">
           <span className={`heading-font text-xl tracking-widest${isTailored ? ' text-black' : ' text-white'}`}>Altered Venganza</span>
         </Link>
         <div className="flex items-center gap-4">
           <Link to="/" className={`hidden md:inline-flex items-center gap-2 transition-colors text-[10px] font-mono uppercase tracking-widest${isTailored ? ' text-black/50 hover:text-black' : ' text-white/50 hover:text-white'}`}>
             Back to Home <ArrowRight size={14} />
           </Link>
           <button onClick={() => setMenuOpen(true)} className={`md:hidden w-10 h-10 flex items-center justify-center transition-colors${isTailored ? ' text-black/70 hover:text-black' : ' text-white/70 hover:text-white'}`}>
             <Menu size={24} />
           </button>
         </div>
       </header>

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
  const [cartTier, setCartTier] = useState(null);
  const [cartAdded, setCartAdded] = useState(false);
  const { addToCart, setCartOpen } = useCart();
  const theme = useTheme();
  const location = useLocation();
  const _p = decodeURIComponent(location.pathname);
  const isTailored = _p.includes('Tailored') || location.pathname === '/designs' || _p.includes('E-commerce') || _p.includes('Techpack');

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

       {/* Fixed header: brand/logo left, back/burger right */}
       <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-10 py-4 bg-[color:var(--bg-color)]/80 backdrop-blur-sm">
         <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">
           <span className={`heading-font text-xl tracking-widest${isTailored ? ' text-black' : ' text-white'}`}>Altered Venganza</span>
         </Link>
         <div className="flex items-center gap-4">
           <button onClick={() => window.history.back()} className={`hidden md:inline-flex items-center gap-2 transition-colors text-[10px] font-mono uppercase tracking-widest${isTailored ? ' text-black/50 hover:text-black' : ' text-white/50 hover:text-white'}`}>
             Back <ArrowRight size={14} />
           </button>
           <button onClick={() => setMenuOpen(true)} className={`md:hidden w-10 h-10 flex items-center justify-center transition-colors${isTailored ? ' text-black/70 hover:text-black' : ' text-white/70 hover:text-white'}`}>
             <Menu size={24} />
           </button>
         </div>
       </header>

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
      <div className="w-full max-w-[480px] pb-4 pt-24 header-element mt-auto flex flex-col gap-3">
         <p className="font-mono text-[8px] md:text-[10px] text-white/60 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto mb-6 text-center">
            Includes: 2 rounds of revisions. Additional revisions are available at 20% of the project total per revision.
          </p>

         {/* Add to Cart — tier picker for options layout */}
         {service.layout === 'options' && (
           <div className="flex flex-col gap-2 mb-2">
             <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 text-center">Select to add to cart</p>
             <div className="flex flex-col gap-2">
               {service.options.map((opt, i) => (
                 <button key={i} type="button" onClick={() => setCartTier(i)}
                   className={`text-left px-4 py-3 border transition-all duration-300 font-mono text-[10px] uppercase tracking-wider ${cartTier === i ? 'border-[color:var(--primary)] bg-white/5 text-white' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'}`}>
                   {opt.price} <span className="text-white/25">{opt.delivery}</span>
                 </button>
               ))}
             </div>
           </div>
         )}

         <button
           onClick={() => {
             const tier = service.layout === 'options' ? (cartTier !== null ? service.options[cartTier]?.price : null) : null;
             if (service.layout === 'options' && cartTier === null) return;
             const priceDef = SERVICE_PRICES[service.title];
             let priceCents = typeof priceDef === 'number' ? priceDef : 0;
             if (priceDef?.options && cartTier !== null) {
               const key = Object.keys(priceDef.options).find(k => service.options[cartTier]?.price?.includes(k));
               if (key) priceCents = priceDef.options[key];
             }
             addToCart({ kind: 'service', id: `${service.title}__${tier || ''}`, title: service.title, tier, priceDisplay: tier || service.price, priceCents });
             setCartAdded(true);
             setTimeout(() => setCartAdded(false), 2000);
           }}
           disabled={service.layout === 'options' && cartTier === null}
           className="w-full py-4 border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-all duration-500 font-mono text-[10px] justify-center tracking-widest uppercase flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
         >
           <ShoppingBag size={13} /> {cartAdded ? 'Added!' : 'Add to Cart'}
         </button>

         <Link to={`/service/${encodeURIComponent(service.title)}/order`}
            className="w-full py-5 bg-[color:var(--primary)] text-[color:var(--btn-tx)] hover:bg-white hover:text-black transition-all duration-500 font-mono text-[10px] justify-center tracking-widest uppercase flex items-center gap-3">
             Order &amp; Send Brief <ArrowRight size={14} />
          </Link>
      </div>
      <div className="w-full max-w-[480px]"><SiteFooter light={isTailored} /></div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// SERVICE ORDER PAGE
// ==========================================

const SERVICE_PRICES = {
  'Packaging Design & Development': 90000,
  'Clothing Brand': 350000,
  'Drop Starter': 90000,
  'RETAINER': 60000,
  'Premade Design': 15000,
  'Tailored Design': { options: { 'Basic': 19000, 'Premium': 35000 } },
  'E-commerce Visual Asset': { options: { 'Single View': 4500, 'Custom View': 6000, '360°': 14000 } },
  'Techpack': { options: { 'One Page': 7000, 'Full Techpack': 17000 } },
};

const ServiceOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const service = allData.find(s => s.title === decodeURIComponent(id));
  const [form, setForm] = useState({ name: '', email: '', brand: '', instagram: '', brief: '', referenceLinks: '' });
  const [files, setFiles] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const { addToCart, setCartOpen } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') setSuccess(true);
  }, [location.search]);

  useEffect(() => {
    if (success) return;
    const ctx = gsap.context(() => {
      gsap.from('.order-el', { y: 24, opacity: 0, stagger: 0.07, duration: 1, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [success]);

  if (!service) return <div className="min-h-screen flex items-center justify-center text-white font-mono text-xs">Service not found.</div>;

  const getPriceCents = () => {
    if (service.layout === 'options' && selectedTier !== null) {
      const tier = service.options[selectedTier];
      const priceDef = SERVICE_PRICES[service.title];
      if (priceDef?.options) {
        const key = Object.keys(priceDef.options).find(k => tier.price.includes(k));
        return key ? priceDef.options[key] : Object.values(priceDef.options)[0];
      }
    }
    const p = SERVICE_PRICES[service.title];
    return typeof p === 'number' ? p : 0;
  };

  const addFiles = (incoming) => {
    setFiles(prev => {
      const merged = [...prev, ...Array.from(incoming)];
      return merged.slice(0, 8);
    });
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (service.layout === 'options' && selectedTier === null) { setError('Please select a package.'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        service: service.title,
        tier: selectedTier !== null ? service.options[selectedTier]?.price : null,
        ...form,
        fileNames: files.map(f => f.name),
      };
      const res = await fetch('/api/service-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else setError(data.error || 'Something went wrong. Try again.');
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10 gap-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Order Confirmed</p>
      <h1 className="serif-heading text-5xl md:text-6xl text-white">Payment received.</h1>
      <p className="text-white/50 font-mono text-[11px] max-w-sm leading-relaxed">
        Now send your files — mood boards, logos, references — to:<br />
        <span className="text-white mt-2 block">studio@alteredvenganza.com</span>
      </p>
      <p className="text-white/30 font-mono text-[9px] uppercase tracking-widest max-w-xs">
        Include your brand name and order email in the subject line.
      </p>
      <Link to="/" className="mt-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
        Back to Home <ArrowRight size={12} />
      </Link>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen pt-20 px-6 pb-28 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-[520px]">

        {/* Nav row */}
        <div className="flex justify-between items-center mb-10 order-el">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest">
            <ArrowLeft size={12} /> Back
          </button>
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-white/60 hover:text-white"><Menu size={20} /></button>
        </div>

        {/* Header */}
        <div className="mb-10 order-el">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Order · {service.price}</p>
          <h1 className="serif-heading text-4xl md:text-5xl text-white leading-tight">{service.title}</h1>
          <p className="text-white/50 font-light text-sm mt-1">{service.subtitle}</p>
        </div>

        {/* Tier selector */}
        {service.layout === 'options' && (
          <div className="mb-10 order-el">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">Select Package *</p>
            <div className="flex flex-col gap-2">
              {service.options.map((opt, i) => (
                <button key={i} type="button" onClick={() => setSelectedTier(i)}
                  className={`text-left px-5 py-4 border transition-all duration-300 ${selectedTier === i ? 'border-[color:var(--primary)] bg-white/5 text-white' : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/70'}`}>
                  <span className="font-medium text-sm">{opt.price}</span>
                  <span className="text-white/30 text-xs font-mono ml-2">{opt.delivery}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 order-el">
            {[['name', 'Name *', 'text'], ['email', 'Email *', 'email']].map(([key, label, type]) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</label>
                <input type={type} required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="bg-transparent border-b border-white/20 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors placeholder:text-white/20" />
              </div>
            ))}
          </div>

          {/* Brand + Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 order-el">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Brand / Label *</label>
              <input type="text" required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="@handle"
                className="bg-transparent border-b border-white/20 py-3 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors placeholder:text-white/20" />
            </div>
          </div>

          {/* Brief */}
          <div className="flex flex-col gap-2 order-el">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Project Brief *</label>
            <textarea rows={4} required value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
              placeholder="Describe your brand, vision, style, specific requirements..."
              className="bg-transparent border border-white/15 p-4 font-mono text-sm text-white outline-none focus:border-[color:var(--primary)] transition-colors resize-none placeholder:text-white/20" />
          </div>

          {/* Reference links */}
          <div className="flex flex-col gap-2 order-el">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Reference Links <span className="normal-case text-white/25 text-[9px]">(Pinterest, Instagram, etc.)</span>
            </label>
            <textarea rows={2} value={form.referenceLinks} onChange={e => setForm(f => ({ ...f, referenceLinks: e.target.value }))}
              placeholder="https://pinterest.com/..."
              className="bg-transparent border border-white/15 p-4 font-mono text-[11px] text-white outline-none focus:border-[color:var(--primary)] transition-colors resize-none placeholder:text-white/20" />
          </div>

          {/* File drop zone */}
          <div className="flex flex-col gap-3 order-el">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Reference Files <span className="normal-case text-white/25 text-[9px]">(mood boards, logos, inspiration)</span>
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed py-10 px-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 ${dragging ? 'border-[color:var(--primary)] bg-white/5' : 'border-white/15 hover:border-white/30'}`}
            >
              <FileImage size={22} className="text-white/25" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 text-center">Drop files here or click to browse</p>
              <p className="font-mono text-[9px] text-white/20">JPG · PNG · PDF · up to 8 files</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
            </div>
            {files.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-2.5 border border-white/10 bg-white/[0.02]">
                    <span className="font-mono text-[10px] text-white/50 truncate max-w-[85%]">{f.name}</span>
                    <button type="button" onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-white/25 hover:text-white/70 transition-colors ml-3 flex-shrink-0">
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col gap-4 pt-6 border-t border-white/10 order-el">
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                {service.layout === 'options' ? 'Package' : 'Starting From'}
              </span>
              <span className="text-xl text-white font-medium">
                {service.layout === 'options'
                  ? (selectedTier !== null ? service.options[selectedTier]?.price : '—')
                  : service.price}
              </span>
            </div>
            {error && <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest">{error}</p>}
            <button type="submit" disabled={loading || (service.layout === 'options' && selectedTier === null)}
              className="w-full py-5 bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-mono text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {loading ? 'Processing...' : <><span>Proceed to Payment</span><ArrowRight size={12} /></>}
            </button>
            <button type="button"
              disabled={service.layout === 'options' && selectedTier === null}
              onClick={() => {
                const tier = selectedTier !== null ? service.options[selectedTier]?.price : null;
                addToCart({ kind: 'service', id: `${service.title}__${tier || ''}`, title: service.title, tier, priceDisplay: tier || service.price, priceCents: getPriceCents() });
                setCartAdded(true);
                setTimeout(() => { setCartAdded(false); setCartOpen(true); }, 400);
              }}
              className="w-full py-4 border border-white/20 text-white/60 font-mono text-[11px] uppercase tracking-widest hover:border-white/40 hover:text-white transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              <ShoppingBag size={12} /> {cartAdded ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            <p className="font-mono text-[9px] text-white/25 text-center uppercase tracking-wider">Secure checkout via Stripe · 2 revision rounds included</p>
          </div>

        </form>
      </div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================
// OTHER PAGES
// ==========================================

const AboutPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('scramble'); // scramble | reveal | done
  const [visible, setVisible] = useState(false);
  const fullText = 'Who the f*ck is Rare?';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    // Start scramble phase
    let frame = 0;
    let revealIndex = 0;
    const totalFrames = 40;

    const interval = setInterval(() => {
      frame++;
      if (frame < totalFrames) {
        // Random scramble, progressively reveal from left
        revealIndex = Math.floor((frame / totalFrames) * fullText.length);
        const scrambled = fullText.split('').map((ch, i) => {
          if (i < revealIndex) return ch;
          if (ch === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        setDisplayed(scrambled);
      } else {
        setDisplayed(fullText);
        setPhase('done');
        clearInterval(interval);
      }
    }, 40);

    const visTimer = setTimeout(() => setVisible(true), 300);
    return () => { clearInterval(interval); clearTimeout(visTimer); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-6 overflow-hidden">

      {/* Animated noise background */}
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0,0) }
          10% { transform: translate(-2%,-3%) }
          20% { transform: translate(3%,2%) }
          30% { transform: translate(-1%,4%) }
          40% { transform: translate(4%,-1%) }
          50% { transform: translate(-3%,3%) }
          60% { transform: translate(2%,-4%) }
          70% { transform: translate(-4%,1%) }
          80% { transform: translate(1%,3%) }
          90% { transform: translate(3%,-2%) }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1 }
          92% { opacity: 1 }
          93% { opacity: 0.4 }
          94% { opacity: 1 }
          96% { opacity: 0.6 }
          97% { opacity: 1 }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(3deg); }
          66% { transform: translateY(10px) rotate(-2deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40% { transform: translateY(14px) rotate(-4deg); }
          75% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(80px, -60px) scale(1.08); }
          50% { transform: translate(-50px, 80px) scale(0.95); }
          75% { transform: translate(60px, 40px) scale(1.04); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          30% { transform: translate(-90px, 50px) scale(1.1); }
          60% { transform: translate(70px, -80px) scale(0.92); }
          80% { transform: translate(-40px, -30px) scale(1.06); }
        }
        @keyframes orbDrift3 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          20% { transform: translate(60px, 90px) scale(0.96); }
          55% { transform: translate(-80px, -40px) scale(1.12); }
          80% { transform: translate(40px, -70px) scale(0.98); }
        }
        .about-title { animation: flicker 6s infinite; }
        .float-a { animation: floatA 7s ease-in-out infinite; }
        .float-b { animation: floatB 9s ease-in-out infinite; }
        .slide-up-1 { animation: slideUp 0.7s ease forwards; animation-delay: 1.8s; opacity: 0; }
        .slide-up-2 { animation: slideUp 0.7s ease forwards; animation-delay: 2.2s; opacity: 0; }
        .slide-up-3 { animation: slideUp 0.7s ease forwards; animation-delay: 2.6s; opacity: 0; }
        .about-orb-1 { animation: orbDrift1 12s ease-in-out infinite; }
        .about-orb-2 { animation: orbDrift2 16s ease-in-out infinite; }
        .about-orb-3 { animation: orbDrift3 20s ease-in-out infinite; }
      `}</style>

      {/* Red gradient orbs */}
      <div className="about-orb-1 pointer-events-none fixed" style={{ top: '10%', left: '20%', width: '70vw', height: '70vw', maxWidth: 800, maxHeight: 800, borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(123,31,36,0.22) 0%, transparent 65%)', filter: 'blur(90px)', zIndex: 0 }} />
      <div className="about-orb-2 pointer-events-none fixed" style={{ top: '40%', right: '10%', width: '55vw', height: '55vw', maxWidth: 650, maxHeight: 650, borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(123,31,36,0.18) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="about-orb-3 pointer-events-none fixed" style={{ bottom: '5%', left: '5%', width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(123,31,36,0.14) 0%, transparent 65%)', filter: 'blur(110px)', zIndex: 0 }} />

      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, animation: 'grain 0.5s steps(1) infinite' }} />

      {/* Scanline */}
      <div className="pointer-events-none fixed left-0 w-full h-[2px] bg-black/5 z-0" style={{ animation: 'scanline 4s linear infinite' }} />

      {/* Floating decorative elements */}
      <span className="float-a absolute top-[15%] left-[8%] font-mono text-[10px] text-black/10 uppercase tracking-[0.3em] select-none">©rare</span>
      <span className="float-b absolute top-[20%] right-[10%] font-mono text-[9px] text-black/8 uppercase tracking-[0.4em] select-none">AV</span>
      <span className="float-a absolute bottom-[25%] left-[12%] font-mono text-[8px] text-black/8 uppercase tracking-[0.3em] select-none" style={{animationDelay:'2s'}}>2026</span>
      <span className="float-b absolute bottom-[30%] right-[8%] font-mono text-[9px] text-[color:var(--primary)] opacity-20 uppercase tracking-[0.4em] select-none" style={{animationDelay:'1s'}}>■</span>
      <span className="float-a absolute top-[55%] left-[5%] font-mono text-[8px] text-black/6 uppercase tracking-[0.3em] select-none" style={{animationDelay:'3s'}}>altered</span>

      {/* Nav */}
      <Link to="/" className="absolute top-10 right-10 hidden md:inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-xs font-mono uppercase tracking-widest z-10">
        Back to Home <ArrowRight size={14} />
      </Link>
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1 className="about-title heading-font text-[2.8rem] md:text-[7rem] text-black leading-none mt-20 mb-10 relative z-10 select-none" style={{letterSpacing:'0.02em'}}>
        {displayed || '\u00A0'}
        {phase !== 'done' && <span className="inline-block w-[3px] h-[0.8em] bg-[color:var(--primary)] ml-1 align-middle animate-pulse" />}
      </h1>

      {/* Content */}
      <div className="relative z-10 max-w-xl">
        <div className="slide-up-1 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-black/20" />
          <span className="font-mono text-[9px] text-black/25 uppercase tracking-[0.3em]">Altered Venganza</span>
          <span className="w-8 h-px bg-black/20" />
        </div>
      </div>

      <div className="w-full max-w-2xl mt-auto relative z-10"><SiteFooter light={true} /></div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

const MaterializingIdeasPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const products = [
    { name: 'MAT Renders', tag: 'AI Renders', desc: 'Pre-made & custom AI clothing renders. Production-ready files, fully alterable to your brand.' },
    { name: 'MAT Ideas', tag: 'Creative Canvas', desc: 'A system to develop and visualize your creative direction before spending a single dollar on production.' },
    { name: 'MAT Try On', tag: 'Virtual Fitting', desc: 'See how your designs look on real body proportions — no photoshoot needed.' },
    { name: 'MAT Drop', tag: 'Drop System', desc: 'Tools and templates to plan, build, and execute a clothing drop from concept to launch.' },
  ];
  return (
    <div className="min-h-screen flex flex-col relative z-10 px-6 py-16 md:py-24 max-w-4xl mx-auto w-full">
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>
      <Link to="/" className="hidden md:inline-flex self-end items-center gap-2 text-black/50 hover:text-black transition-colors text-xs font-mono uppercase tracking-widest mb-12">
        Back to Home <ArrowRight size={14} />
      </Link>

      {/* Hero */}
      <div className="mb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--primary)] mb-4">Materializing Ideas</p>
        <h1 className="heading-font text-[3rem] md:text-[6rem] text-black leading-none mb-8">
          Creative Canvas<br />System
        </h1>
        <p className="font-mono text-sm text-black/60 uppercase tracking-[0.15em] max-w-lg leading-relaxed">
          Tools for fashion creators — AI renders · flat templates · design tools.<br />
          <span className="text-black font-semibold">Made for doers, not dreamers.</span>
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-black/10 mb-16" />

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {products.map((p) => (
          <div key={p.name} className="border border-black/10 rounded-2xl p-6 hover:border-[color:var(--primary)] transition-colors duration-300">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[color:var(--primary)] mb-2">{p.tag}</p>
            <h2 className="heading-font text-2xl text-black mb-3">{p.name}</h2>
            <p className="font-mono text-[11px] text-black/50 leading-relaxed uppercase tracking-[0.05em]">{p.desc}</p>
            <p className="font-mono text-[9px] text-black/25 uppercase tracking-[0.2em] mt-4">Coming Soon</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="font-mono text-[10px] text-black/30 uppercase tracking-[0.2em] text-center">
        A sub-brand of Altered Venganza — <Link to="/about" className="text-[color:var(--primary)] hover:text-black transition-colors">Who the f*ck is Rare?</Link>
      </p>

      <div className="mt-12"><SiteFooter light={true} /></div>
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

const CartSidebar = ({ onClose }) => {
  const { cart, removeFromCart } = useCart();
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const premades = cart.filter(i => i.kind === 'premade');
  const services = cart.filter(i => i.kind === 'service');
  const totalEur = premades.reduce((s, i) => s + i.price, 0) + services.reduce((s, i) => s + (i.priceCents / 100), 0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      gsap.from(panelRef.current, { x: '100%', duration: 0.4, ease: 'power3.out' });
    });
    return () => { document.body.style.overflow = ''; ctx.revert(); };
  }, []);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert('Checkout failed. Please try again or DM us on Instagram.'); }
    } catch { alert('Network error. Please try again.'); }
    finally { setCheckoutLoading(false); }
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm">
      <div ref={panelRef} className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <h2 className="heading-font text-2xl tracking-widest text-black">Cart ({cart.length})</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 && (
            <p className="font-mono text-xs text-black/30 uppercase tracking-widest text-center py-12">Your cart is empty</p>
          )}
          {cart.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 group hover:border-black/10 transition-colors">
              {item.kind === 'premade' ? (
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img src={item.imageUrl} alt={`Premade #${item.number}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[color:var(--primary)] flex-shrink-0 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {item.kind === 'premade' ? (
                  <>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">Premade #{item.number}</p>
                    <p className="text-sm font-semibold text-black">€{item.price}</p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">{item.title}</p>
                    {item.tier && <p className="font-mono text-[9px] text-black/35 uppercase tracking-wider">{item.tier}</p>}
                    <p className="text-sm font-semibold text-black">{item.priceDisplay}</p>
                  </>
                )}
              </div>
              <button onClick={() => removeFromCart(idx)} className="w-8 h-8 rounded-full flex items-center justify-center text-black/30 hover:text-[color:var(--primary)] hover:bg-black/5 transition-all">
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
              <span className="text-xl font-semibold text-black">€{totalEur.toFixed(0)}</span>
            </div>
            {services.length > 0 && (
              <p className="font-mono text-[9px] text-black/40 uppercase tracking-wider">
                Service orders: brief required after payment · studio@alteredvenganza.com
              </p>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-[color:var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              <ExternalLink size={16} />
              {checkoutLoading ? 'Processing...' : `Checkout — €${totalEur.toFixed(0)}`}
            </button>
            <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer"
               className="w-full flex items-center justify-center gap-2 bg-white text-black px-6 py-4 text-xs font-mono uppercase tracking-widest rounded-lg border border-black/10 hover:border-black/30 transition-all">
              <MessageCircle size={16} />
              Ask via DM
            </a>
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
// MAT RENDERS PAGE
// ==========================================

const MatRendersPage = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.from('.mat-header', { y: 40, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'power3.out' });
      gsap.from('.mat-card', { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', delay: 0.4 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Sample render results — admin can set heroRight image; here we show gallery slots
  const gallerySlots = [
    { key: 'matRender1', label: 'Render 01' },
    { key: 'matRender2', label: 'Render 02' },
    { key: 'matRender3', label: 'Render 03' },
    { key: 'matRender4', label: 'Render 04' },
    { key: 'matRender5', label: 'Render 05' },
    { key: 'matRender6', label: 'Render 06' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex flex-col relative z-10">

      {/* Mobile burger */}
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
        <Menu size={24} />
      </button>

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-6 md:px-12 pt-8 pb-6">
        <Link to="/" className="mat-header heading-font text-white/30 hover:text-white transition-colors tracking-widest text-sm uppercase font-mono">
          ← Altered Venganza
        </Link>
        <span className="mat-header font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">
          MAT Renders
        </span>
      </header>

      {/* ── HERO ── */}
      <div className="relative px-6 md:px-12 pt-6 pb-16">
        <h1 className="mat-header heading-font text-[4rem] md:text-[7rem] lg:text-[10rem] leading-none text-white tracking-widest">
          MAT
        </h1>
        <h1 className="mat-header heading-font text-[4rem] md:text-[7rem] lg:text-[10rem] leading-none text-white/20 tracking-widest -mt-4 md:-mt-8">
          RENDERS
        </h1>
        <p className="mat-header font-mono text-xs text-white/40 uppercase tracking-[0.25em] mt-6 max-w-md">
          Materialized clothing renders. Production-ready 3D results for your brand — from our in-house rendering pipeline.
        </p>

        {/* Hero image */}
        {theme.images?.heroRight && (
          <div className="mt-10 relative rounded-2xl overflow-hidden aspect-[16/7]">
            <img src={theme.images.heroRight} alt="MAT Renders" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          </div>
        )}
      </div>

      {/* ── GALLERY GRID ── */}
      <div className="px-6 md:px-12 pb-16">
        <p className="mat-header font-mono text-[9px] text-white/25 uppercase tracking-[0.3em] mb-8">Results</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {gallerySlots.map((slot, i) => (
            <div key={slot.key} className="mat-card relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group">
              {theme.images?.[slot.key] ? (
                <img src={theme.images[slot.key]} alt={slot.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-white/20">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <span className="font-mono text-[8px] text-white/15 uppercase tracking-widest">{slot.label}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute bottom-4 left-4 font-mono text-[9px] text-white/70 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">{slot.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── APP NOT AVAILABLE YET ── */}
      <div className="mx-6 md:mx-12 mb-16 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-6 md:px-10 py-7 flex flex-col md:flex-row items-start md:items-center gap-5">
        <span className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-[9px] text-amber-400 uppercase tracking-[0.2em]">App Coming Soon</span>
        </span>
        <p className="font-mono text-[11px] text-white/55 leading-relaxed">
          The <span className="text-white/90">MAT public app</span> is not yet available. In the meantime, order your renders directly via DM — we'll produce them manually through our in-house pipeline at the same quality.
        </p>
      </div>

      {/* ── PRICING ── */}
      <div className="px-6 md:px-12 pb-20">
        <p className="font-mono text-[9px] text-white/25 uppercase tracking-[0.3em] mb-8">Pricing</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: 'Single View', price: '€45', delivery: '4 h delivery', features: ['High-resolution studio lighting render', 'Optimized for product page or social feed'] },
            { tier: 'Custom View', price: '€60', delivery: '6 h delivery', features: ['Specific camera angle requested by you', 'Lighting & shadow refined to your brief'] },
            { tier: '360°', price: '€140', delivery: '1 day delivery', features: ['Full rotational sequence', 'Ready for interactive e-commerce integration'] },
          ].map(({ tier, price, delivery, features }) => (
            <div key={tier} className="mat-card rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-5 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300">
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.25em] mb-2">{tier}</p>
                <p className="heading-font text-5xl text-white tracking-widest">{price}</p>
                <p className="font-mono text-[9px] text-white/30 mt-1.5 uppercase tracking-widest">{delivery}</p>
              </div>
              <div className="flex-1 space-y-2 border-t border-white/5 pt-4">
                {features.map(f => (
                  <p key={f} className="font-mono text-[10px] text-white/45 flex items-start gap-2 leading-relaxed">
                    <span className="text-white/20 flex-shrink-0 mt-0.5">—</span>{f}
                  </p>
                ))}
              </div>
              <a
                href="https://www.instagram.com/rare______________________/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 font-mono text-[10px] text-white/50 hover:text-white hover:border-white/25 hover:bg-white/5 uppercase tracking-widest transition-all duration-300"
              >
                <Instagram size={11} /> Order this
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-6 md:px-12 py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="heading-font text-3xl md:text-5xl text-white tracking-widest mb-3">Get Your Renders</h2>
          <p className="font-mono text-xs text-white/40 uppercase tracking-[0.2em] max-w-sm">
            Upload your designs — we materialize them into production-ready clothing renders for your brand.
          </p>
        </div>
        <div className="flex flex-col gap-3 flex-shrink-0">
          <a
            href="https://www.instagram.com/rare______________________/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/90 transition-all"
          >
            <Instagram size={14} /> Order via DM
          </a>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-mono text-xs uppercase tracking-widest rounded-full hover:border-white/40 hover:bg-white/5 transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 md:px-12">
        <SiteFooter />
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// ==========================================

const PremadesPage = () => {
  const { premades, loading, error } = useInstagramPremades();
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const { cart, cartOpen, setCartOpen, addToCart, removeFromCart } = useCart();

  const addPremadeToCart = (premade) => {
    addToCart({ kind: 'premade', ...premade });
  };

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

      {/* Mobile burger */}
      <button onClick={() => setMenuOpen(true)} className="fixed top-6 right-6 z-[100] md:hidden w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors">
        <Menu size={24} />
      </button>

      {/* ============ TOP HEADER — Logo left, nav left below logo ============ */}
      <div className="premade-header w-full mb-10 pr-14 md:pr-0">

        {/* Row 1: Brand + right count */}
        <div className="flex items-start justify-between">
          <Link to="/" className="heading-font text-[3rem] md:text-[3.5rem] leading-none text-black tracking-widest block hover:opacity-80 transition-opacity">
            Altered Venganza
          </Link>
          <p className="hidden md:flex text-black/60 font-mono text-xs uppercase tracking-[0.1em] items-center gap-2 pt-3 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse shadow-[0_0_8px_rgba(123,31,36,0.6)]" />
            {loading ? '...' : `${premades.filter(p => p.available).length} Pieces Available`}
          </p>
        </div>

        {/* Row 2: description (left) + nav links (left) */}
        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-black/70 font-mono text-xs uppercase tracking-[0.1em] leading-relaxed">
              Pre-made clothing renders &bull; Production ready files
            </p>
            <p className="text-black/70 font-mono text-xs uppercase tracking-[0.1em] leading-relaxed">
              Fully alterable &amp; customizable to your brand &bull; Numbered &amp; Ready to purchase
            </p>
            {/* Mobile count */}
            <p className="md:hidden text-black/60 font-mono text-xs uppercase tracking-[0.1em] flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse" />
              {loading ? '...' : `${premades.filter(p => p.available).length} Pieces Available`}
            </p>
          </div>

          {/* Nav links on the LEFT side below description */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="font-mono text-[11px] text-black/50 hover:text-black transition-colors uppercase tracking-[0.2em]">
              ← Home
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="font-mono text-[11px] text-[color:var(--primary)] hover:text-black transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
            >
              Cart ({cart.length}) <ShoppingBag size={13} />
            </button>
            {cart.length > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-xl
                  bg-white/60 backdrop-blur-md border border-black/12 shadow-sm
                  text-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white hover:border-[color:var(--primary)]
                  transition-all duration-300"
              >
                <ShoppingBag size={12} />
                View Cart — ${cart.reduce((s, i) => s + i.price, 0)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============ GALLERY GRID ============ */}
      <div className="flex-1 w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {premades.map((premade) => (
            <div key={premade.id} className="premade-item">
              <button
                onClick={() => premade.available && setSelected(premade)}
                className={`group text-left w-full overflow-hidden transition-all duration-500 focus:outline-none ${!premade.available ? 'cursor-default' : ''}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black/5 border border-black/10 rounded-2xl hover:border-[color:var(--primary)] transition-colors duration-500">
                  <img src={premade.imageUrl} alt={`Premade #${premade.number}`} loading="lazy" className={`w-full h-full object-cover transition-transform duration-700 ${premade.available ? 'group-hover:scale-105' : 'grayscale-[30%]'}`} />

                  {/* Type badge */}
                  {premade.type === 'legacy' ? (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full font-mono text-[8px] font-bold tracking-widest z-10 bg-black/70 text-white/90 backdrop-blur-sm uppercase">
                      Archive
                    </span>
                  ) : (
                    <span className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold tracking-wider z-10 ${premade.type === 'premium' ? 'bg-[color:var(--primary)] text-white shadow-[0_0_10px_rgba(123,31,36,0.4)]' : 'bg-white text-black/60 border border-black/15'}`}>
                      {premade.type === 'premium' ? 'P' : 'B'}
                    </span>
                  )}

                  {/* SOLD overlay */}
                  {!premade.available ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(123,31,36,0.75)] rounded-2xl">
                      <span className="font-mono text-sm text-white font-bold tracking-[0.3em] uppercase">Sold</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center rounded-2xl">
                      <span className="font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-widest uppercase">View</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className={`font-mono text-[10px] tracking-widest uppercase ${premade.available ? 'text-black/40' : 'text-black/25 line-through'}`}>#{premade.number}</span>
                  {premade.type === 'legacy' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-black/30 line-through">${PREMADE_PRICE_BASIC}</span>
                      <span className="font-mono text-xs font-semibold text-[color:var(--primary)]">${premade.price}</span>
                    </span>
                  ) : (
                    <span className={`font-mono text-xs font-semibold ${premade.available ? 'text-black' : 'text-black/25'}`}>${premade.price}</span>
                  )}
                </div>
              </button>

              {/* Add to Cart — Glassmorphism button */}
              {premade.available ? (
                <button
                  onClick={() => addPremadeToCart(premade)}
                  disabled={cart.find(item => item.kind === 'premade' && item.id === premade.id)}
                  className="flex mt-2 w-full py-2.5 text-[10px] font-mono uppercase tracking-widest rounded-xl
                    bg-white/60 backdrop-blur-md border border-black/10 shadow-sm
                    text-black/60 hover:bg-black hover:text-white hover:border-black hover:shadow-md
                    transition-all duration-300
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/60 disabled:hover:text-black/60 disabled:hover:border-black/10 disabled:hover:shadow-sm
                    items-center justify-center gap-1.5"
                >
                  {cart.find(item => item.id === premade.id) ? 'In Cart' : <><Plus size={12} /> Add to Cart</>}
                </button>
              ) : (
                <span className="flex mt-2 w-full py-2.5 text-[10px] font-mono uppercase tracking-widest text-black/20 items-center justify-center">Sold</span>
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

      {/* BOTTOM — View Cart CTA + Footer */}
      <div className="w-full relative z-20 mt-20">
        {cart.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-8 py-3.5 font-mono text-xs uppercase tracking-widest rounded-full
                bg-white/70 backdrop-blur-md border border-black/12 shadow-md
                text-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white hover:border-[color:var(--primary)] hover:shadow-lg
                transition-all duration-300"
            >
              <ShoppingBag size={14} />
              View Cart ({cart.length}) — ${cart.reduce((s, i) => s + i.price, 0)}
            </button>
          </div>
        )}
        <SiteFooter light={true} />
      </div>

      {/* Modal */}
      {selected && <PremadeModal premade={selected} onClose={() => setSelected(null)} onAddToCart={addPremadeToCart} />}
      {/* Cart Sidebar */}
      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
      {/* Mobile Menu */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};

// Global cart button — visible when cart has items, on any page
const GlobalCartButton = () => {
  const { cart, setCartOpen, cartOpen } = useCart();
  if (cart.length === 0) return null;
  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-[color:var(--primary)] text-[color:var(--btn-tx)] font-mono text-[10px] uppercase tracking-widest px-5 py-3 shadow-2xl hover:scale-105 transition-all duration-300"
      style={{ display: cartOpen ? 'none' : 'flex' }}
    >
      <ShoppingBag size={14} />
      Cart ({cart.length})
    </button>
  );
};

const GlobalCartSidebar = () => {
  const { cartOpen, setCartOpen } = useCart();
  if (!cartOpen) return null;
  return <CartSidebar onClose={() => setCartOpen(false)} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ThemeController />
        <AnimatedBackground />
        <GlobalCartButton />
        <GlobalCartSidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/materializing-ideas" element={<MaterializingIdeasPage />} />
          <Route path="/vag" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/premades" element={<PremadesPage />} />
          <Route path="/mat-renders" element={<MatRendersPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/service/:id/order" element={<ServiceOrderPage />} />
          <Route path="/brand-identity" element={<ServicePage title="Brand Identity Service" services={brandIdentityData} />} />
          <Route path="/designs" element={<ServicePage title="Clothing Design Service" services={designsData} />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
