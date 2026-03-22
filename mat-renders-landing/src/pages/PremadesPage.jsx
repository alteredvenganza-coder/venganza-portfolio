import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { premades } from '../data/premades';
import PremadeCard from '../components/PremadeCard';
import PremadeModal from '../components/PremadeModal';

export default function PremadesPage() {
  const [selected, setSelected] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.from('.premade-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2,
      });
      gsap.from('.gallery-header', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={gridRef} className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-charcoal/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-mono text-charcoal/50 hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <Link to="/" className="text-lg font-sans font-extrabold tracking-tight text-charcoal">
            MAT<span className="text-moss">Renders</span>
          </Link>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Gallery Header */}
      <div className="gallery-header max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-5xl sm:text-7xl font-serif italic text-charcoal tracking-tight mb-4">
          Premades
        </h1>
        <p className="font-mono text-sm text-charcoal/40 max-w-md mx-auto leading-relaxed">
          Curated clothing renders, numbered and ready. Click any piece to purchase.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal/10 text-[10px] font-mono tracking-wider uppercase text-charcoal/40">
          <span className="w-2 h-2 rounded-full bg-clay animate-pulse shadow-[0_0_8px_rgba(204,88,51,0.6)]"></span>
          {premades.length} pieces available
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {premades
            .filter((p) => p.available)
            .map((premade) => (
              <div key={premade.id} className="premade-item">
                <PremadeCard premade={premade} onClick={setSelected} />
              </div>
            ))}
        </div>

        {premades.length === 0 && (
          <div className="text-center py-24">
            <p className="font-mono text-charcoal/30 text-sm">
              No premades available yet. Check back soon.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-charcoal/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest">
            MAT Renders &copy; {new Date().getFullYear()}
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest hover:text-charcoal transition-colors"
          >
            Home
          </Link>
        </div>
      </footer>

      {/* Modal */}
      {selected && (
        <PremadeModal premade={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
