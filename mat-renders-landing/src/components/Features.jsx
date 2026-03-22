import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Clock, MousePointer2, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-32 px-6 bg-cream border-t border-charcoal/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-sans font-bold text-charcoal tracking-tight mb-6">
            The Physics of <span className="font-serif italic text-clay">Efficiency.</span>
          </h2>
          <p className="font-mono text-charcoal/60 leading-relaxed text-sm md:text-base">
            Engineered to bypass traditional bottlenecks. We've compressed weeks of 
            studio time and exorbitant budgets into a single autonomous protocol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1: Cost Effective */}
          <div className="feature-card bg-cream border border-charcoal/10 rounded-[2rem] p-8 flex flex-col items-start hover:bg-white transition-colors duration-500 shadow-sm hover:shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-clay/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-clay/10 transition-colors"></div>
            
            <div className="w-12 h-12 rounded-full bg-charcoal text-cream flex items-center justify-center mb-16">
              <Zap size={20} />
            </div>
            
            {/* Micro UI: Savings Comparison */}
            <div className="w-full h-32 mb-8 bg-charcoal/5 rounded-xlarge border border-charcoal/10 p-4 relative overflow-hidden flex flex-col justify-end">
              <div className="w-full flex items-end gap-3 h-full px-2">
                <div className="w-1/2 bg-charcoal/20 rounded-t-lg h-[90%] relative group-hover:h-[95%] transition-all duration-700">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-50 font-semibold tracking-wider">AGENCY</span>
                </div>
                <div className="w-1/2 bg-moss rounded-t-lg h-[15%] relative group-hover:h-[10%] transition-all duration-700 delay-100 shadow-[0_0_15px_rgba(46,64,54,0.3)]">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-moss font-bold tracking-wider">MAT</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-sans font-bold text-charcoal mb-3">Shatter Costs</h3>
            <p className="font-mono text-sm text-charcoal/60 leading-relaxed">
              Stop bleeding budget on expensive photoshoots and complex agency renders. Our AI protocol slashes production costs entirely.
            </p>
          </div>

          {/* Feature 2: High Speed Realistic */}
          <div className="feature-card bg-cream border border-charcoal/10 rounded-[2rem] p-8 flex flex-col items-start hover:bg-white transition-colors duration-500 shadow-sm hover:shadow-xl group relative overflow-hidden mt-0 md:mt-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-moss/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-moss/10 transition-colors"></div>

            <div className="w-12 h-12 rounded-full bg-charcoal text-cream flex items-center justify-center mb-16">
              <Clock size={20} />
            </div>
            
            {/* Micro UI: Typewriter Telemetry */}
            <div className="w-full h-32 mb-8 bg-charcoal rounded-xlarge border border-charcoal/10 p-4 relative overflow-hidden flex flex-col justify-center shadow-inner">
              <div className="font-mono text-[10px] text-cream/80 opacity-70 group-hover:opacity-100 transition-opacity leading-loose">
                &gt; Init geometric pass...<br/>
                &gt; Raytracing active [1024 spp]<br/>
                &gt; Textures mapped.<br/>
                <span className="text-clay font-bold block mt-2 group-hover:animate-pulse">&gt; Render complete: 38.4s</span>
              </div>
            </div>

            <h3 className="text-xl font-sans font-bold text-charcoal mb-3">Hyper-Real in &lt;40s</h3>
            <p className="font-mono text-sm text-charcoal/60 leading-relaxed">
              Achieve total photorealism faster than a coffee break. Uncompromised granular visual quality delivered in under 40 seconds.
            </p>
          </div>

          {/* Feature 3: One Click Magic */}
          <div className="feature-card bg-charcoal text-cream rounded-[2rem] p-8 flex flex-col items-start transition-transform duration-500 shadow-xl group relative overflow-hidden mt-0 md:mt-24">
            
            <div className="w-12 h-12 rounded-full bg-cream text-charcoal flex items-center justify-center mb-16 relative z-10">
              <MousePointer2 size={20} />
            </div>
            
            {/* Micro UI: One click interaction */}
            <div className="w-full h-32 mb-8 bg-[#222222] rounded-xlarge border border-cream/10 p-4 relative overflow-hidden flex items-center justify-center z-10">
              <div className="h-10 px-6 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center text-xs font-mono group-hover:bg-cream group-hover:text-charcoal group-hover:shadow-[0_0_20px_rgba(242,240,233,0.2)] transition-all duration-500 font-bold tracking-widest uppercase">
                Generate
              </div>
              <MousePointer2 className="absolute text-clay w-6 h-6 translate-x-12 translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out fill-clay/20" />
            </div>

            <h3 className="text-xl font-sans font-bold text-cream mb-3 relative z-10">One-Click Magic</h3>
            <p className="font-mono text-sm text-cream/60 leading-relaxed relative z-10">
              No complex node trees, no rendering parameters to decipher. The entire studio pipeline is triggered with a single click.
            </p>
          </div>

        </div>

        {/* Clothing Design Service — Premades */}
        <div className="feature-card mt-12 bg-charcoal rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-clay/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cream/10 text-[10px] font-mono font-medium tracking-wider uppercase text-cream/50">
              <Shirt size={14} />
              New Service
            </div>
            <h3 className="text-3xl md:text-4xl font-sans font-bold text-cream tracking-tight mb-3">
              Clothing Design <span className="font-serif italic text-clay">Premades.</span>
            </h3>
            <p className="font-mono text-sm text-cream/60 leading-relaxed max-w-lg">
              Ready-to-use clothing renders, numbered and curated. Browse our gallery,
              pick your favorite, and make it yours in one click.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <Link
              to="/premades"
              className="magnetic-btn inline-flex items-center gap-3 bg-clay text-cream px-8 py-4 text-base font-semibold rounded-xlarge shadow-xl shadow-clay/20 hover:shadow-clay/40 transition-shadow"
            >
              <span>View Premades &rarr;</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
