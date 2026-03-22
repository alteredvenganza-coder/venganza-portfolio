import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.parallax-bg', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="philosophy" ref={sectionRef} className="relative py-40 px-6 bg-charcoal text-cream overflow-hidden">
      <div 
        className="parallax-bg absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay scale-110"
         style={{backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop")'}}
      ></div>
      
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center justify-between">
        
        {/* Industry standard */}
        <div className="flex-1 opacity-50">
          <div className="text-xs font-mono tracking-widest uppercase mb-4 text-cream/50">[ The Old Way ]</div>
          <h3 className="text-2xl md:text-3xl font-sans text-cream/70 line-through decoration-clay/50 decoration-2 mb-6 leading-tight">
            Scouting locations. Booking photographers. Lighting setups. Hours of post-production.
          </h3>
          <p className="font-mono text-xs md:text-sm text-cream/40 leading-relaxed">
            The traditional pipeline is broken. It's an archaic process built to drain resources and extinguish momentum.
          </p>
        </div>

        {/* The MAT approach */}
        <div className="flex-1">
          <div className="text-[10px] md:text-xs font-mono tracking-widest uppercase mb-4 text-moss font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-moss animate-pulse shadow-[0_0_8px_rgba(46,64,54,0.8)]"></span>
            [ The MAT Protocol ]
          </div>
          <h3 className="text-4xl md:text-5xl font-sans font-bold leading-tight mb-6">
            Pure <span className="font-serif italic text-clay">Synthesis.</span><br/>Zero friction.
          </h3>
          <p className="font-mono text-sm text-cream/70 leading-relaxed mb-10">
            We've distilled the entire production studio into an algorithm. You provide the vision; MAT renders reality. Total control. Absolute precision.
          </p>
          <button className="magnetic-btn border border-cream/20 px-8 py-4 rounded-xlarge text-sm font-semibold hover:bg-cream hover:text-charcoal transition-colors">
            <span className="block">Experience It</span>
          </button>
        </div>

      </div>
    </section>
  );
}
