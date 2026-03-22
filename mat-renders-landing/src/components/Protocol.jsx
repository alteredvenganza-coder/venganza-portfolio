import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top top+=100',
            end: 'bottom top',
            pin: true,
            pinSpacing: false,
            scrub: true,
          },
          scale: 0.95 - (cards.length - 1 - i) * 0.05,
          opacity: 0.8,
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={containerRef} className="py-20 px-6 bg-cream relative">
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-4xl md:text-6xl font-sans font-bold text-charcoal tracking-tight text-center">
          The <span className="font-serif italic text-moss">Protocol.</span>
        </h2>
      </div>

      <div className="max-w-4xl mx-auto space-y-32 pb-40">
        
        {/* Card 1 */}
        <div className="protocol-card min-h-[60vh] bg-white border border-charcoal/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col justify-center relative origin-top">
          <div className="absolute top-8 right-8 md:top-12 md:right-12 font-mono text-charcoal/30 text-4xl md:text-6xl font-bold">01</div>
          <h3 className="text-3xl font-sans font-bold mb-4 text-charcoal">Ingest</h3>
          <p className="font-mono text-charcoal/60 max-w-lg mb-10 leading-relaxed text-sm md:text-base">
            Upload your base CAD, raw geometry, or sketch. The engine analyzes spatial volume and material properties instantly.
          </p>
          <div className="h-40 w-full bg-cream rounded-2xl flex items-center justify-center border border-dashed border-charcoal/20">
            <span className="font-mono text-xs text-charcoal/40 uppercase tracking-widest">[ Drop Geometry Here ]</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="protocol-card min-h-[60vh] bg-charcoal text-cream border border-charcoal/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col justify-center relative origin-top">
          <div className="absolute top-8 right-8 md:top-12 md:right-12 font-mono text-cream/10 text-4xl md:text-6xl font-bold">02</div>
          <h3 className="text-3xl font-sans font-bold mb-4">Compute</h3>
          <p className="font-mono text-cream/60 max-w-lg mb-10 leading-relaxed text-sm md:text-base">
            The Altered Venganz proprietary AI begins ambient occlusion synthesis and ray bounce estimation. Total integration.
          </p>
          <div className="h-40 w-full bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
               <svg viewBox="0 0 100 100" className="w-full h-full stroke-clay animate-[spin_10s_linear_infinite]">
                 <polygon points="50,10 90,90 10,90" fill="none" strokeWidth="0.5"/>
                 <polygon points="50,90 90,10 10,10" fill="none" strokeWidth="0.5"/>
               </svg>
            </div>
            <span className="font-mono text-xs text-clay font-bold uppercase tracking-widest animate-pulse z-10">Processing 1024 SPP...</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="protocol-card min-h-[60vh] bg-moss text-cream border border-charcoal/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col justify-center relative origin-top">
          <div className="absolute top-8 right-8 md:top-12 md:right-12 font-mono text-cream/20 text-4xl md:text-6xl font-bold">03</div>
          <h3 className="text-3xl font-sans font-bold mb-4">Output</h3>
          <p className="font-mono text-cream/70 max-w-lg mb-10 leading-relaxed text-sm md:text-base">
            Final synthesis delivered. Cinematic resolution capabilities with separated physical layers ready for production.
          </p>
          <div className="h-40 w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden group hover:bg-black/30 transition-colors cursor-pointer border border-cream/10">
            <span className="font-mono text-sm text-cream font-bold tracking-widest flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-cream group-hover:bg-clay transition-colors"></span>
              DOWNLOAD_RENDER.EXR
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
