import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div
        className={`flex items-center justify-between px-6 py-3 transition-all duration-500 rounded-large w-full max-w-5xl border ${
          scrolled
            ? 'bg-cream/80 backdrop-blur-md border-charcoal/10 shadow-sm'
            : 'bg-transparent border-transparent'
        }`}
      >
        <Link to="/" className="text-xl font-sans font-extrabold tracking-tight text-charcoal">
          MAT<span className="text-moss">Renders</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-sans font-medium text-charcoal/80">
          {isHome ? (
            <>
              <a href="#features" className="hover:text-clay transition-colors">Features</a>
              <a href="#philosophy" className="hover:text-clay transition-colors">Philosophy</a>
              <a href="#protocol" className="hover:text-clay transition-colors">Protocol</a>
            </>
          ) : (
            <Link to="/" className="hover:text-clay transition-colors">&larr; Home</Link>
          )}
          <Link to="/premades" className="hover:text-clay transition-colors">Premades</Link>
        </nav>
        <button className="magnetic-btn bg-charcoal text-cream px-6 py-2.5 text-sm font-semibold rounded-large shadow-lg">
          <span>Join Beta</span>
        </button>
      </div>
    </header>
  );
}
