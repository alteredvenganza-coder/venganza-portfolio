import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import RedLightEffect from './RedLightEffect';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
      });
      gsap.from('.hero-image', {
        scale: 0.95,
        opacity: 0,
        duration: 1.5,
        delay: 0.3,
        ease: 'power2.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100dvh] min-h-[700px] w-full flex items-center px-6 overflow-hidden bg-cream pt-20">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-moss/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <RedLightEffect />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Typographic Block */}
        <div className="flex-1 max-w-xl">
          <div className="hero-text inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-charcoal/10 text-[10px] md:text-xs font-mono font-medium tracking-wider uppercase text-charcoal/60">
            <span className="w-2 h-2 rounded-full bg-clay relative animate-pulse shadow-[0_0_8px_rgba(204,88,51,0.6)]"></span>
            Altered Venganz Engine
          </div>
          
          <h1 className="hero-text text-5xl sm:text-7xl lg:text-[5.5rem] font-sans font-bold tracking-tighter text-charcoal leading-[0.9] mb-6">
            Renders, <br/>
            <span className="font-serif italic text-moss font-medium tracking-normal text-6xl sm:text-8xl lg:text-[7rem] relative -left-1">Redefined.</span>
          </h1>
          
          <p className="hero-text font-mono text-sm sm:text-base text-charcoal/70 max-w-md mb-10 leading-relaxed">
            Ultra-realistic 3D visual generation in under 40 seconds. 
            Skip the expensive photoshoots. One-click magic.
          </p>

          <div className="hero-text flex gap-4 items-center">
            <button className="magnetic-btn bg-moss text-cream px-8 py-4 text-base font-semibold rounded-xlarge shadow-xl shadow-moss/20">
              <span>Join the Beta</span>
            </button>
            <div className="text-xs font-mono text-charcoal/40 hidden sm:block">
              [ 1:1 Pixel Accuracy ]
            </div>
          </div>
        </div>

        {/* Visual / Abstract Representation */}
        <div className="hero-image flex-1 w-full max-w-md lg:max-w-lg aspect-[4/5] relative mt-10 md:mt-0">
          <div className="absolute inset-0 bg-charcoal rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Lab/organic image matching Preset A */}
            <div 
              className="absolute inset-0 opacity-60 mix-blend-overlay scale-110 object-cover bg-center" 
              style={{backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")'}}
            ></div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent"></div>
            
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between border-t border-cream/10 pt-4">
              <div className="font-mono text-[10px] text-cream/70 uppercase tracking-widest leading-relaxed">
                Render_ID: 0x9F41 <br/>
                Proc: 38.2s // Realism: 99.9%
              </div>
              <div className="h-2 w-2 rounded-full bg-clay shadow-[0_0_12px_rgba(204,88,51,0.8)]"></div>
            </div>
          </div>
          {/* Floating UI Elements */}
          <div className="absolute -left-8 top-20 bg-cream/90 backdrop-blur-md p-4 rounded-large border border-charcoal/10 shadow-lg hidden md:block">
            <div className="text-[10px] font-mono text-charcoal/50 mb-1">Cost Savings</div>
            <div className="text-2xl font-sans font-bold text-moss">- 85%</div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
